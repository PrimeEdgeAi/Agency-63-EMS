// ─── Auth ────────────────────────────────────────────────────────────────────

export interface UserMeta {
  full_name?: string
  avatar_url?: string
}

export interface AppUser {
  email: string
  user_metadata: UserMeta
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type PageId =
  | 'dashboard'
  | 'admin'
  | 'manager'
  | 'UniCorns'
  | 'One Off'
  | 'Alcoholic'
  | 'NonAlcoholic'
  | 'Pay Requests'
  | 'Target'
  | 'Reports'

  | 'events'
  | 'recce'
  | 'payrequest'
  | 'finance'
  | 'settings'
  | 'help'

// ─── Events ──────────────────────────────────────────────────────────────────

export type EventStatus = 'upcoming' | 'completed' | 'planning' | 'active'

export interface EventItem {
  id: number
  title: string
  date: string
  location: string
  status: EventStatus
  attendees: number
  budget: number
  category: string
  story: string
  image: string
  job_id?: string
  projectAssistant?: string
  projectAssistantEmail?: string
  projectStatus?: string
  recceDone?: string
}

// ─── Recce ───────────────────────────────────────────────────────────────────

export type RecceStatus = 'approved' | 'pending' | 'completed'

export interface RecceItem {
  id: string
  event: string
  venue: string
  requestedBy: string
  date: string
  status: RecceStatus
  notes: string
  job_id?: string
}

// ─── Pay Requests ─────────────────────────────────────────────────────────────

export type PayStatus = 'pending' | 'approved' | 'review' | 'rejected'

export interface PayRequest {
  id: string
  event: string
  vendor: string
  amount: number
  status: PayStatus
  date: string
  category: string
  paymentMethod?: 'cash' | 'cheque'
  transactionId?: string
}

export interface RequisitionItem {
  id: string
  company: string
  jobId: string
  client: string
  eventDescription: string
  requestorName: string
  requestorEmail: string
  dateRequired: string
  lineItems: Array<{ description: string; supplier: string; category: string; qty: number; days: number; unitCost: number; total: number }>
  totalAmount: number
  justification: string
  notes: string
  urgency: string
  status: 'pending' | 'approved' | 'rejected'
  paymentMethod?: 'cash' | 'cheque'
  transactionId?: string
  submittedAt: string
}