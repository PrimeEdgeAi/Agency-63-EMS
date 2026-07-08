import type { ReactNode } from 'react'
import { Card, StatusBadge } from '../ui'
import type { EventItem } from '../../types'

type SectionTitleProps = {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function SectionTitle({ title, subtitle, action }: SectionTitleProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' }}>{title}</h2>
        {subtitle && <div style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  )
}

type StatCardProps = {
  label: string
  value: ReactNode
  accent?: string
  background?: string
}

export function StatCard({ label, value, accent = '#111', background = '#f7f7f7' }: StatCardProps) {
  return (
    <div style={{ background, border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px 22px' }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent, letterSpacing: -1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#aaa', letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
    </div>
  )
}

type EventListRowProps = {
  event: EventItem
  onClick?: () => void
}

export function EventListRow({ event, onClick }: EventListRowProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '9px 12px', borderRadius: 6,
        background: '#fafbfc', border: '1px solid #f0f0f0',
        borderLeft: '3px solid #111',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {event.title}
        </div>
        <div style={{ fontSize: 13, color: '#666', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {event.location} · {event.date}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
        <StatusBadge status={event.status} />
      </div>
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card style={{ padding: '28px', textAlign: 'center', color: '#999' }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13 }}>{description}</div>
    </Card>
  )
}
