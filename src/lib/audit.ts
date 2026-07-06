import { supabase } from './supabase'

export type AuditStatus = 'success' | 'error'

export interface AuditEventPayload {
  action: string
  entity_type: string
  entity_id?: string | null
  user_email?: string | null
  status?: AuditStatus
  metadata?: Record<string, unknown>
  route?: string | null
}

interface PendingAuditEvent extends AuditEventPayload {
  created_at: string
}

const PENDING_AUDIT_KEY = 'btl_pending_audit_events'

function getRoute(): string | null {
  if (typeof window === 'undefined') return null
  return `${window.location.pathname}${window.location.search}`
}

function readPendingEvents(): PendingAuditEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = window.localStorage.getItem(PENDING_AUDIT_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writePendingEvents(events: PendingAuditEvent[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(PENDING_AUDIT_KEY, JSON.stringify(events))
}

function queueEvent(event: PendingAuditEvent) {
  const pending = readPendingEvents()
  pending.push(event)
  writePendingEvents(pending)
}

async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser()
    return data?.user?.email ?? null
  } catch {
    return null
  }
}

export async function logAuditEvent(payload: AuditEventPayload): Promise<boolean> {
  const event: PendingAuditEvent = {
    ...payload,
    user_email: payload.user_email ?? null,
    status: payload.status ?? 'success',
    metadata: payload.metadata ?? {},
    route: payload.route ?? getRoute(),
    created_at: new Date().toISOString(),
  }

  if (!event.user_email) {
    event.user_email = await getCurrentUserEmail()
  }

  try {
    const { error } = await supabase.from('audit_logs').insert([event])
    if (error) throw error
    return true
  } catch {
    queueEvent(event)
    return false
  }
}

export async function flushPendingAuditLogs(): Promise<void> {
  const pending = readPendingEvents()
  if (!pending.length) return

  try {
    const { error } = await supabase.from('audit_logs').insert(pending)
    if (!error) {
      writePendingEvents([])
    }
  } catch {
    // Keep the queued items for the next attempt.
  }
}

if (typeof window !== 'undefined') {
  void flushPendingAuditLogs()
}
