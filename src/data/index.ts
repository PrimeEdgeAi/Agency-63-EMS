import type { EventItem, RecceItem, PayRequest } from '../types'
import { loadGoogleSheetsConfig } from '../admin/components/GoogleSheetsConnection'

type DataListener = () => void
const dataListeners = new Set<DataListener>()

type WorkflowKind = 'event' | 'recce' | 'requisition' | 'pay_request'

const N8N_WORKFLOW_URLS: Record<WorkflowKind, string> = {
  event: (import.meta.env.VITE_N8N_EVENT_WORKFLOW_URL as string) || '',
  recce: (import.meta.env.VITE_N8N_RECCE_WORKFLOW_URL as string) || '',
  requisition: (import.meta.env.VITE_N8N_REQUISITION_WORKFLOW_URL as string) || '',
  pay_request: (import.meta.env.VITE_N8N_PAY_REQUEST_WORKFLOW_URL as string) || '',
}

function getWorkflowKind(type?: string): WorkflowKind | undefined {
  switch (type) {
    case 'event_submission':
    case 'event':
      return 'event'
    case 'recce':
      return 'recce'
    case 'requisition':
      return 'requisition'
    case 'pay_request':
      return 'pay_request'
    default:
      return undefined
  }
}

interface SheetEvent {
  Job_ID: string
  Description: string
  Client: string
  Status: string
  Client_Lead: string
  Project_Lead: string
  Email: string
  Where: string
  Start_Date: string
  End_Date: string
  Recce_Done?: string
}

// Reccee sheet rows can have many columns; accept a loose shape
type SheetRequisition = Record<string, any>

interface SheetDashboardData {
  events: SheetEvent[]
  claims?: unknown[]
  requisitions: SheetRequisition[]
  roles?: unknown[]
}

function normalizeSheetEventStatus(status: string): EventItem['status'] {
  if (/completed|done|finished/i.test(status)) return 'completed'
  if (/planning|update|launch|creation/i.test(status)) return 'planning'
  return 'upcoming'
}

function mapSheetEvents(events: SheetEvent[]): EventItem[] {
  return events.map((event, index) => ({
    id: index + 1,
    title: event.Description || event.Job_ID || `Event ${index + 1}`,
    date: event.Start_Date || event.End_Date || '',
    location: event.Where || 'Unknown location',
    status: normalizeSheetEventStatus(event.Status || ''),
    attendees: 0,
    budget: 0,
    category: event.Status || 'Event',
    story: event.Description || 'Imported from Google Sheets',
    image: event.Status && event.Status.toLowerCase().includes('update') ? '🔁' : '📅',
    job_id: event.Job_ID,
    recceDone: event.Recce_Done || 'No',
  }))
}

function mapSheetRequisitions(requisitions: SheetRequisition[]): RecceItem[] {
  return requisitions.map((req, index) => ({
    id: `RR-SHEET-${String(index + 1).padStart(3, '0')}`,
    event: req['Job_ID'] || req['Description'] || `Recce ${index + 1}`,
    venue: req['Location'] || req['Company'] || 'Unknown location',
    requestedBy: req['Email'] || req['Requested By'] || 'Sheet import',
    date: req['Reccee Date'] || '',
    status: 'pending',
    notes: req['Notes'] || (req['Amenities'] ? `Amenities: ${req['Amenities']}` : ''),
    job_id: req['Job_ID'] || undefined,
  }))
}

function notifyData() {
  dataListeners.forEach((listener) => listener())
}

export function subscribeData(listener: DataListener) {
  dataListeners.add(listener)
  return () => {
    dataListeners.delete(listener)
  }
}

export async function pushDataToGoogleSheets(payload: unknown) {
  const payloadObject = payload as { type?: string; payload?: unknown; request?: unknown } | undefined
  const workflowKind = getWorkflowKind(payloadObject?.type)
  const workflowUrl = workflowKind ? N8N_WORKFLOW_URLS[workflowKind] : ''

  if (workflowUrl) {
    try {
      const response = await fetch(workflowUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: payloadObject?.payload ?? payloadObject?.request ?? payloadObject ?? payload }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        return { ok: false, error: errorText || `Workflow request failed with status ${response.status}` }
      }

      return { ok: true }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Workflow request failed' }
    }
  }

  const config = loadGoogleSheetsConfig()
  if (!config.webAppUrl) {
    return { ok: false, error: 'Google Sheets Web App URL is not configured.' }
  }

  try {
    await fetch(config.webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Network error' }
  }
}

export async function submitEventWorkflow(payload: unknown) {
  return pushDataToGoogleSheets({ type: 'event_submission', payload })
}

export async function submitRecceWorkflow(payload: unknown) {
  return pushDataToGoogleSheets({ type: 'recce', payload })
}

export async function submitRequisitionWorkflow(payload: unknown) {
  return pushDataToGoogleSheets({ type: 'requisition', payload })
}

export async function submitPayRequestWorkflow(payload: unknown) {
  return pushDataToGoogleSheets({ type: 'pay_request', payload })
}

export const APPROVED_EMAILS: string[] = [
  'admin@company.com',
  'events@company.com',
  'demo@eventportal.com',
]

export let EVENTS_DATA: EventItem[] = [
  {
    id: 1,
    title: 'Nairobi Tech Summit 2025',
    date: '2025-03-15',
    location: 'KICC, Nairobi',
    status: 'upcoming',
    attendees: 420,
    budget: 850000,
    category: 'Tech',
    story: 'Bringing together East Africa\'s brightest minds to shape the digital future.',
    image: '🏙️',
  },
  {
    id: 2,
    title: 'Annual Gala Dinner',
    date: '2025-02-28',
    location: 'Serena Hotel',
    status: 'completed',
    attendees: 180,
    budget: 650000,
    category: 'Corporate',
    story: 'An evening of celebration, recognition, and connection for our partners.',
    image: '✨',
  },
  {
    id: 3,
    title: 'Leadership Retreat',
    date: '2025-04-10',
    location: 'Aberdare Country Club',
    status: 'upcoming',
    attendees: 45,
    budget: 320000,
    category: 'Retreat',
    story: 'A transformative weekend for executives to align vision and strategy.',
    image: '🏔️',
  },
  {
    id: 4,
    title: 'Product Launch: Horizon',
    date: '2025-03-30',
    location: 'Radisson Blu',
    status: 'planning',
    attendees: 300,
    budget: 1200000,
    category: 'Launch',
    story: 'Unveiling a product that redefines what\'s possible for African businesses.',
    image: '🚀',
  },
  {
    id: 5,
    title: 'CSR Community Day',
    date: '2025-03-05',
    location: 'Westlands, Nairobi',
    status: 'completed',
    attendees: 800,
    budget: 250000,
    category: 'Community',
    story: 'Giving back to the community that has given us so much.',
    image: '🌱',
  },
  {
    id: 6,
    title: 'Marketing Workshop',
    date: '2025-04-22',
    location: 'Virtual + Nairobi Hub',
    status: 'upcoming',
    attendees: 90,
    budget: 180000,
    category: 'Training',
    story: 'Equipping our teams with tools to tell better brand stories.',
    image: '📊',
  },
  {
    id: 7,
    title: 'Board Strategy Session',
    date: '2025-05-08',
    location: 'Villa Rosa Kempinski',
    status: 'planning',
    attendees: 20,
    budget: 420000,
    category: 'Strategy',
    story: 'Setting the course for the next three years of growth and impact.',
    image: '🎯',
  },
  {
    id: 8,
    title: 'East Africa HR Forum',
    date: '2025-06-15',
    location: 'Safari Park Hotel',
    status: 'upcoming',
    attendees: 250,
    budget: 560000,
    category: 'Forum',
    story: 'Uniting HR leaders across the region to reimagine workplace culture.',
    image: '🤝',
  },
]

export let RECCE_DATA: RecceItem[] = [
  {
    id: 'RR-001',
    event: 'Nairobi Tech Summit 2025',
    venue: 'KICC Main Hall',
    requestedBy: 'Sarah M.',
    date: '2025-02-20',
    status: 'approved',
    notes: 'Capacity check & AV walkthrough completed.',
  },
  {
    id: 'RR-002',
    event: 'Product Launch: Horizon',
    venue: 'Radisson Blu Ballroom',
    requestedBy: 'James K.',
    date: '2025-03-05',
    status: 'pending',
    notes: 'Awaiting venue coordinator response.',
  },
  {
    id: 'RR-003',
    event: 'Leadership Retreat',
    venue: 'Aberdare Country Club',
    requestedBy: 'Lisa N.',
    date: '2025-03-12',
    status: 'completed',
    notes: 'All rooms mapped. Catering walk-through done.',
  },
  {
    id: 'RR-004',
    event: 'Board Strategy Session',
    venue: 'Villa Rosa Kempinski',
    requestedBy: 'Michael O.',
    date: '2025-04-01',
    status: 'pending',
    notes: 'Boardroom layout and AV requirements to be confirmed.',
  },
]

export let PAY_REQUESTS: PayRequest[] = [
  {
    id: 'PR-001',
    event: 'Nairobi Tech Summit 2025',
    vendor: 'AV Solutions Ltd',
    amount: 85000,
    status: 'pending',
    date: '2025-03-01',
    category: 'Equipment',
  },
  {
    id: 'PR-002',
    event: 'Annual Gala Dinner',
    vendor: 'Serena Catering',
    amount: 240000,
    status: 'approved',
    date: '2025-02-20',
    category: 'Catering',
  },
  {
    id: 'PR-003',
    event: 'Leadership Retreat',
    vendor: 'Aberdare Resorts',
    amount: 180000,
    status: 'pending',
    date: '2025-03-08',
    category: 'Venue',
  },
  {
    id: 'PR-004',
    event: 'Product Launch: Horizon',
    vendor: 'Creative Studios KE',
    amount: 95000,
    status: 'review',
    date: '2025-03-10',
    category: 'Design',
  },
  {
    id: 'PR-005',
    event: 'CSR Community Day',
    vendor: 'Print & Go',
    amount: 32000,
    status: 'approved',
    date: '2025-02-25',
    category: 'Print',
  },
  {
    id: 'PR-006',
    event: 'East Africa HR Forum',
    vendor: 'Safari Park Hotel',
    amount: 310000,
    status: 'pending',
    date: '2025-04-10',
    category: 'Venue',
  },
]

export function getEventsData() {
  return EVENTS_DATA
}

export function getRecceData() {
  return RECCE_DATA
}

export function getPayRequestsData() {
  return PAY_REQUESTS
}

export async function syncSheetDataToLocalStore() {
  const config = loadGoogleSheetsConfig()
  if (!config.webAppUrl) {
    return { ok: false, error: 'Google Sheets Web App URL is not configured.' }
  }

  try {
    const response = await fetch(config.webAppUrl)
    if (!response.ok) {
      return { ok: false, error: `Google Sheets fetch failed (${response.status})` }
    }

    const data = (await response.json()) as SheetDashboardData
    if (!data?.events || !data?.requisitions) {
      return { ok: false, error: 'Google Sheets response did not include valid events and requisitions.' }
    }

    EVENTS_DATA = mapSheetEvents(data.events)
    RECCE_DATA = mapSheetRequisitions(data.requisitions)
    notifyData()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to fetch Google Sheets data.' }
  }
}

export async function addRecce(requisition: Omit<RecceItem, 'id' | 'status'>) {
  const id = `RR-${String(RECCE_DATA.length + 1).padStart(3, '0')}`
  const newRecce: RecceItem = {
    ...requisition,
    id,
    status: 'pending',
  }
  RECCE_DATA = [...RECCE_DATA, newRecce]
  notifyData()

  const result = await pushDataToGoogleSheets({
    type: 'recce',
    payload: {
      job_id: (newRecce as any).job_id || newRecce.event,
      client: newRecce.event,
      reccee_date: newRecce.date,
      location: newRecce.venue,
      email: '',
      description: newRecce.notes || '',
      submitted_at: new Date().toISOString(),
    },
  })

  return { ok: result.ok, recce: newRecce, error: result.ok ? undefined : result.error }
}

export function completeRecce(id: string) {
  const recce = RECCE_DATA.find((item) => item.id === id)
  if (!recce) return undefined

  RECCE_DATA = RECCE_DATA.filter((item) => item.id !== id)
  EVENTS_DATA = EVENTS_DATA.filter((event) => event.title !== recce.event)
  notifyData()

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('BtlRecceCompleted', { detail: { id: recce.id, event: recce.event } }))
  }

  return recce
}

export function approveRecce(id: string) {
  const recce = RECCE_DATA.find((item) => item.id === id)
  if (!recce) return undefined

  RECCE_DATA = RECCE_DATA.map((item) =>
    item.id === id ? { ...item, status: 'approved' } : item
  )
  notifyData()
  return RECCE_DATA.find((item) => item.id === id)
}

export function addPayRequest(request: Omit<PayRequest, 'id'>) {
  const id = `PR-${String(PAY_REQUESTS.length + 1).padStart(3, '0')}`
  const newRequest: PayRequest = { id, ...request }
  PAY_REQUESTS = [...PAY_REQUESTS, newRequest]
  notifyData()
  return newRequest
}

export function updatePayRequest(id: string, updates: Partial<Omit<PayRequest, 'id'>>) {
  PAY_REQUESTS = PAY_REQUESTS.map((request) =>
    request.id === id ? { ...request, ...updates } : request
  )
  notifyData()
  return PAY_REQUESTS.find((request) => request.id === id)
}

export function findPayRequestByEvent(event: string) {
  return PAY_REQUESTS.find((request) => request.event === event)
}
