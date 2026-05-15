import type { EventItem } from '../../types'
import { StatusBadge, Card } from '../ui'

interface EventDetailProps {
  event: EventItem
  onBack: () => void
}

export function EventDetail({ event, onBack }: EventDetailProps) {
  const meta = [
    ['📅 Date',      event.date],
    ['📍 Location',  event.location],
    ['👥 Attendees', String(event.attendees)],
    ['💰 Budget',    `KES ${event.budget.toLocaleString()}`],
  ]

  const actions = [
    'Edit Event',
    'Add Recce Request',
    'Create Pay Request',
    'View Reports',
    'Export Summary',
  ]

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#999',
          fontSize: 13,
          marginBottom: 32,
          fontFamily: 'Georgia, serif',
        }}
      >
        ← Back to Events
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

        {/* Main Info */}
        <div>
          <Card style={{ padding: 40, marginBottom: 20 }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>{event.image}</div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <StatusBadge status={event.status} />
              <span
                style={{
                  background: '#f7f7f7',
                  color: '#666',
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                {event.category}
              </span>
            </div>

            <h1
              style={{ fontSize: 30, fontWeight: 400, color: '#111', letterSpacing: -0.5, margin: '0 0 12px' }}
            >
              {event.title}
            </h1>
            <p style={{ color: '#888', fontSize: 15, margin: '0 0 28px', lineHeight: 1.75 }}>
              {event.story}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {meta.map(([k, v]) => (
                <div key={k} style={{ padding: 16, background: '#fafafa', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: '#bbb', letterSpacing: 0.5, marginBottom: 6 }}>{k}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Story Block */}
          <Card style={{ padding: 28 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#111' }}>
              Full Event Story
            </h3>
            <p style={{ color: '#666', fontSize: 14, lineHeight: 1.85, margin: 0, fontStyle: 'italic' }}>
              "{event.story} Every detail — from the venue's ambiance to the agenda's flow — is designed to
              leave attendees inspired and connected. This event embodies our commitment to creating
              experiences that resonate long after the last guest has departed."
            </p>
          </Card>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Dark story card */}
          <div
            style={{
              background: '#111',
              borderRadius: 16,
              padding: 28,
              backgroundImage:
                'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 60%)',
            }}
          >
            <h3 style={{ color: 'white', fontSize: 14, margin: '0 0 14px', fontWeight: 600 }}>
              Event Story
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.85, fontStyle: 'italic', margin: 0 }}>
              "{event.story}"
            </p>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 0.5 }}>
                ID #{String(event.id).padStart(4, '0')} · {event.category}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <Card style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, margin: '0 0 14px', color: '#111', fontWeight: 600 }}>
              Quick Actions
            </h3>
            {actions.map((a) => (
              <button
                key={a}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  textAlign: 'left',
                  background: '#fafafa',
                  border: '1px solid #f0f0f0',
                  borderRadius: 10,
                  marginBottom: 8,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'Georgia, serif',
                  color: '#444',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {a}
                <span style={{ color: '#ccc', fontSize: 12 }}>→</span>
              </button>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
