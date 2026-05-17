import type { EventItem, PageId } from '../../types'
import { StatusBadge } from '../ui'

interface UpcomingEventsListProps {
  events: EventItem[]
  setActive: (id: PageId) => void
}

const CAP_MAP: Record<number, number> = { 1: 1500, 2: 500, 3: 100, 4: 400, 5: 1000, 6: 150, 7: 50, 8: 350 }

export function UpcomingEventsList({ events, setActive }: UpcomingEventsListProps) {
  const sorted = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 16,
        border: '1px solid #e8edf5',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        width: 320,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Upcoming events</div>
        <button
          onClick={() => setActive('events')}
          style={{ fontSize: 11, color: '#248afd', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          View all →
        </button>
      </div>

      <div style={{ flex: 1, padding: '4px 0' }}>
        {sorted.map((ev, i) => {
          const cap = CAP_MAP[ev.id] ?? 200
          const fillPct = Math.round((ev.attendees / cap) * 100)
          return (
            <div
              key={ev.id}
              style={{
                padding: '12px 20px',
                borderBottom: i < sorted.length - 1 ? '1px solid #f8fafc' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e8edf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {ev.image}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: 2,
                  }}
                >
                  {ev.title}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 5 }}>
                  {new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {ev.location.split(',')[0]}
                </div>
                {/* Fill rate bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 3, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(fillPct, 100)}%`,
                        height: '100%',
                        background: fillPct >= 90 ? '#ef4444' : fillPct >= 60 ? '#f59e0b' : '#22c55e',
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 10, color: '#64748b', flexShrink: 0 }}>{fillPct}%</span>
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <StatusBadge status={ev.status} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
