import { supabase } from './supabase'

const ALL_PROPOSALS_WEBHOOK = 'https://kenmongare.app.n8n.cloud/webhook/AllProposals'
const PROPOSALS_WEBHOOK_URL = (import.meta.env.VITE_PROPOSALS_WEBHOOK_URL as string | undefined) || 'https://kenmongare.app.n8n.cloud/webhook/ProposalsCheck'
const GOOGLE_SHEET_ID = '1AO-06SYVS_uVnBWkM5smUFeSoTWUeq0GbFvX7tJr3oE'

export interface ProposalWebhookRecord {
  id: string
  title: string
  budget: number
  submitted_by: string
  submitted_at: string
  file_name?: string | null
  status: 'pending' | 'approved'
  approved_at?: string | null
  job_id?: string
  client?: string
  location?: string
  status_label?: string
}

function asString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

function normalizeStatus(raw: string): 'pending' | 'approved' {
  const value = raw.toLowerCase()
  return value === 'yes' || value === 'approved' || value === 'true' || value === '1' || value === 'done' || value === 'complete'
    ? 'approved'
    : 'pending'
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    window.clearTimeout(timeoutId)
  }
}

function readResponseBody(response: Response): Promise<string> {
  return response.text().catch(() => '')
}

function parseWebhookRow(item: unknown, index: number): Record<string, string> {
  if (typeof item === 'string') {
    const parsed: Record<string, string> = {}
    const regex = /([A-Za-z0-9 _./-]+):([^]*(?=\s+[A-Za-z0-9 _./-]+:|$))/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(item)) !== null) {
      const key = match[1].trim()
      const value = match[2].trim()
      if (key && value) parsed[key] = value
    }
    return parsed
  }

  if (item && typeof item === 'object') {
    return Object.fromEntries(
      Object.entries(item as Record<string, unknown>).map(([key, value]) => [key, asString(value)])
    )
  }

  return { id: `proposal-${index + 1}` }
}

function extractRows(payload: unknown): Record<string, string>[] {
  if (Array.isArray(payload)) {
    return payload.map((item, index) => parseWebhookRow(item, index))
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    const candidates = [record.items, record.rows, record.data, record.body]
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate.map((item, index) => parseWebhookRow(item, index))
      }
      if (candidate && typeof candidate === 'object') {
        const nested = candidate as Record<string, unknown>
        if (Array.isArray(nested.items) || Array.isArray(nested.rows) || Array.isArray(nested.data)) {
          return extractRows(nested)
        }
        return [Object.fromEntries(Object.entries(nested).map(([key, value]) => [key, asString(value)]))]
      }
    }
    return [Object.fromEntries(Object.entries(record).map(([key, value]) => [key, asString(value)]))]
  }

  if (typeof payload === 'string') {
    const trimmed = payload.trim()
    if (!trimmed) return []
    try {
      return extractRows(JSON.parse(trimmed))
    } catch {
      return [parseWebhookRow(trimmed, 0)]
    }
  }

  return []
}

function mapWebhookRowToProposal(row: Record<string, string>, index: number): ProposalWebhookRecord {
  const jobId = asString(row.Job_ID ?? row.job_id ?? row.JobId ?? row['Job ID'] ?? row.id ?? `proposal-${index + 1}`)
  const title = asString(row.Description ?? row.Title ?? row.description ?? row['Description'] ?? row['Proposal Title'] ?? jobId)
  const submittedBy = asString(row.Email ?? row.email ?? row.Client ?? row.client ?? row['Client'] ?? row['submitted_by'] ?? 'Unknown')
  const budgetRaw = asString(row.Budget ?? row.budget ?? row['Budget'] ?? row.Amount ?? row.amount ?? '0')
  const submittedAt = asString(row['Start Date'] ?? row.Start_Date ?? row.StartDate ?? row['End Date'] ?? row.End_Date ?? row.submitted_at ?? new Date().toISOString())
  const statusRaw = asString(row['Proposal Done'] ?? row.Proposal_Done ?? row.proposal_done ?? row.ProposalDone ?? row.Status ?? row.status ?? row.approval_status ?? 'No')
  const fileName = asString(row.file_name ?? row.FileName ?? row['Proposal File'] ?? row['File Name'] ?? '') || null
  const client = asString(row.Client ?? row.client ?? row['Client'] ?? '')
  const location = asString(row.Where ?? row.where ?? row.location ?? row.Location ?? row['Where'] ?? '')
  const statusLabel = asString(row.Status ?? row.status ?? row['Status'] ?? '')
  const status = normalizeStatus(statusRaw)

  return {
    id: jobId,
    title,
    budget: Number(budgetRaw) || 0,
    submitted_by: submittedBy,
    submitted_at: submittedAt,
    file_name: fileName,
    status,
    approved_at: status === 'approved' ? asString(row.approved_at ?? row.Approved_At ?? new Date().toISOString()) : null,
    job_id: jobId,
    client,
    location,
    status_label: statusLabel,
  }
}

async function fetchProposalsFromGoogleSheets(): Promise<ProposalWebhookRecord[]> {
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=Events`
  const urls = [sheetUrl, `https://corsproxy.io/?${encodeURIComponent(sheetUrl)}`, `https://api.allorigins.win/raw?url=${encodeURIComponent(sheetUrl)}`]

  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        mode: 'cors',
        cache: 'no-store',
      }, 10000)
      if (!response.ok) continue

      const text = await readResponseBody(response)
      if (!text.trim()) continue

      const cleaned = text
        .replace(/^\/\*O_o\*\//, '')
        .replace(/^\s*google\.visualization\.Query\.setResponse\(/, '')
        .replace(/\)\s*;?\s*$/, '')

      const parsed = JSON.parse(cleaned)
      const columns = (parsed?.table?.cols || []).map((col: { label?: string }) => asString(col?.label))
      const rows = parsed?.table?.rows || []

      const proposals = rows
        .map((row: { c?: Array<{ v?: unknown }> }) => {
          const values = (row.c || []).map((cell) => asString(cell?.v ?? ''))
          const record = Object.fromEntries(columns.map((column: string, index: number) => [column, values[index] ?? '']))
          const statusRaw = asString(record['Proposal Done'] ?? record.status ?? 'No')
          const budgetRaw = asString(record.Budget ?? record.budget ?? '0')
          const submittedAt = asString(record['Start Date'] ?? record['Start Date'] ?? record.submitted_at ?? new Date().toISOString())
          const jobId = asString(record.Job_ID ?? record.job_id ?? '')
          const title = asString(record.Description ?? record.Title ?? record.description ?? jobId)
          const submittedBy = asString(record.Email ?? record.email ?? record.Client ?? record.client ?? 'Unknown')

          return {
            id: jobId || `sheet-${Math.random().toString(36).slice(2, 10)}`,
            title,
            budget: Number(budgetRaw) || 0,
            submitted_by: submittedBy,
            submitted_at: submittedAt,
            file_name: null,
            status: normalizeStatus(statusRaw),
            approved_at: statusRaw.toLowerCase() === 'yes' ? new Date().toISOString() : null,
            job_id: jobId,
            client: asString(record.Client ?? record.client ?? ''),
            location: asString(record.Where ?? record.where ?? record.Location ?? ''),
            status_label: asString(record.Status ?? record.status ?? ''),
          }
        })
        .filter((proposal: ProposalWebhookRecord) => proposal.title || proposal.job_id)

      if (proposals.length > 0) return proposals
    } catch {
      // Try the next fallback source
    }
  }

  return []
}

async function fetchProposalsFromSupabase(): Promise<ProposalWebhookRecord[]> {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) throw error

    return (data || []).map((row) => {
      const record = row as Record<string, unknown>
      const statusRaw = asString(record.status ?? record.approval_status ?? record['Proposal Done'] ?? 'pending')
      const budget = Number(asString(record.budget ?? record.Budget ?? '0')) || 0
      return {
        id: asString(record.id ?? ''),
        title: asString(record.title ?? ''),
        budget,
        submitted_by: asString(record.submitted_by ?? record.Email ?? record.email ?? 'Unknown'),
        submitted_at: asString(record.submitted_at ?? record.created_at ?? new Date().toISOString()),
        file_name: asString(record.file_name ?? '') || null,
        status: normalizeStatus(statusRaw),
        approved_at: asString(record.approved_at ?? '') || null,
        job_id: asString(record.job_id ?? record.id ?? ''),
        client: asString(record.client ?? ''),
        location: asString(record.location ?? ''),
        status_label: asString(record.status_label ?? record.status ?? ''),
      }
    })
  } catch (error) {
    console.warn('Falling back to Supabase proposals failed', error)
    return []
  }
}

export async function fetchProposalsFromN8nWebhook(): Promise<ProposalWebhookRecord[]> {
  const payload = {
    action: 'list_proposals',
    source: 'event_portal',
    timestamp: new Date().toISOString(),
  }

  const urls = [
    PROPOSALS_WEBHOOK_URL,
    `https://corsproxy.io/?${encodeURIComponent(PROPOSALS_WEBHOOK_URL)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(PROPOSALS_WEBHOOK_URL)}`,
  ]

  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'cors',
        cache: 'no-store',
      }, 8000)
      if (!response.ok) continue

      const text = await readResponseBody(response)
      if (!text.trim()) continue

      const parsed = JSON.parse(text)
      const rows = extractRows(parsed)
      const proposals = rows.map((row, index) => mapWebhookRowToProposal(row, index))
      if (proposals.length > 0) return proposals
    } catch {
      // Try the next candidate URL
    }
  }

  const sheetProposals = await fetchProposalsFromGoogleSheets()
  if (sheetProposals.length > 0) return sheetProposals

  return fetchProposalsFromSupabase()
}

export async function sendProposalApprovalWebhook(
  jobId: string,
  title: string,
  budget: number,
  submittedBy: string,
  proposal?: { client?: string | null; location?: string | null; statusLabel?: string | null; submittedAt?: string | null }
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedJobId = String(jobId || '').trim()
    const payload = {
      body: {
        Job_ID: normalizedJobId,
        Description: String(title || '').trim(),
        Client: String(proposal?.client ?? submittedBy ?? '').trim(),
        Status: String(proposal?.statusLabel ?? 'Project Creation').trim(),
        Email: String(submittedBy ?? '').trim(),
        Where: String(proposal?.location ?? '').trim(),
        'Start Date': String(proposal?.submittedAt ?? new Date().toISOString()).trim(),
        'End Date': String(proposal?.submittedAt ?? new Date().toISOString()).trim(),
        'Proposal Done': 'Yes',
        Budget: String(budget),
        approved_at: new Date().toISOString(),
        approval_status: 'approved',
        webhook_timestamp: new Date().toISOString(),
      },
      Job_ID: normalizedJobId,
      Description: String(title || '').trim(),
      Client: String(proposal?.client ?? submittedBy ?? '').trim(),
      Status: String(proposal?.statusLabel ?? 'Project Creation').trim(),
      Email: String(submittedBy ?? '').trim(),
      Where: String(proposal?.location ?? '').trim(),
      'Start Date': String(proposal?.submittedAt ?? new Date().toISOString()).trim(),
      'End Date': String(proposal?.submittedAt ?? new Date().toISOString()).trim(),
      'Proposal Done': 'Yes',
      Budget: String(budget),
      approved_at: new Date().toISOString(),
      approval_status: 'approved',
      webhook_timestamp: new Date().toISOString(),
    }

    const response = await fetch(ALL_PROPOSALS_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Webhook returned ${response.status}: ${errorText}`)
    }

    console.log('✓ Approval sent to n8n webhook')
    return { success: true }
  } catch (error) {
    console.error('Proposal approval error:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: `Approval failed: ${errorMsg}`,
    }
  }
}
