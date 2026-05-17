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
}