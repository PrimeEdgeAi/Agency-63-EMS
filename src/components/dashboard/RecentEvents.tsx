import type { PageId } from '../../types'
import type { EventItem } from '../../types'
import { StatusBadge, Card } from '../ui'

interface RecentEventsProps {
  events: EventItem[]
  setActive: (id: PageId) => void
}

export function RecentEvents({ events, setActive }: RecentEventsProps) {
  return (
    <Card>
      <div
        style={{
          padding: '22px 28px 16px',
          borderBottom: '1px solid #f7f7f7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111' }}>Recent Events</h3>
        <button
          onClick={() => setActive('events')}
          style={{ fontSize: 12, color: '#bbb', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          View all →
        </button>
      </div>

      {events.slice(0, 6).map((ev, i) => (
        <div
          key={ev.id}
          style={{
            padding: '15px 28px',
            borderBottom: i < 5 ? '1px solid #fafafa' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              background: '#f7f7f7',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {ev.image}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{ fontSize: 13, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {ev.title}
            </div>
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>
              {ev.date} · {ev.location}
            </div>
          </div>
          <StatusBadge status={ev.status} />
        </div>
      ))}
    </Card>
  )
}
