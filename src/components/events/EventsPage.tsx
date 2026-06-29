import { useEffect, useState } from 'react'
import type { EventItem } from '../../types'
import { getEventsData, subscribeData } from '../../data'
import { StatusBadge, Card, PageHeader, FilterPills, Button } from '../ui'
import { EventDetail } from './EventDetail'
import { NewEventModal } from './NewEventModal'

type ViewMode = 'grid' | 'list'

const FILTER_OPTIONS = ['all', 'upcoming', 'planning', 'completed']

export function EventsPage() {
  const [view, setView] = useState<ViewMode>('grid')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<EventItem | null>(null)
  const [showForm, setShowForm] = useState(true)
  const [events, setEvents] = useState(() => getEventsData())

  useEffect(() => {
    const unsubscribe = subscribeData(() => setEvents(getEventsData()))
    return unsubscribe
  }, [])

  const filtered = filter === 'all' ? events : events.filter((e) => e.status === filter)

  if (selected) {
    return <EventDetail event={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="animate-fade-in">
      <PageHeader section="Business Modules" title="Events">
        {/* View Toggle */}
        <div style={{ display: 'flex', background: 'white', border: '1px solid #e5e5e5', borderRadius: 10, overflow: 'hidden' }}>
          {(['grid', 'list'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '9px 16px',
                background: view === v ? '#111' : 'transparent',
                color: view === v ? 'white' : '#888',
                border: 'none',
                cursor: 'pointer',
                fontSize: 15,
                fontFamily: 'Georgia, serif',
                transition: 'all 0.15s',
              }}
            >
              {v === 'grid' ? '⊞' : '≡'}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowForm(true)}>+ New Event</Button>
      </PageHeader>

      {/* Filters + count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <FilterPills options={FILTER_OPTIONS} active={filter} onChange={setFilter} />
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#ccc' }}>
          {filtered.length} event{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {filtered.map((ev) => (
            <EventCard key={ev.id} event={ev} onClick={() => setSelected(ev)} />
          ))}
        </div>
      )}

      {/* List */}
      {view === 'list' && (
        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                {['Event', 'Date', 'Location', 'Attendees', 'Budget', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '13px 20px',
                      textAlign: 'left',
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#ccc',
                      letterSpacing: 0.8,
                      textTransform: 'uppercase',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev, i) => (
                <tr
                  key={ev.id}
                  onClick={() => setSelected(ev)}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #fafafa' : 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{ev.image}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{ev.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#999' }}>{ev.date}</td>
                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#999' }}>{ev.location}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#111' }}>{ev.attendees}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#111' }}>
                    KES {ev.budget.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 20px' }}><StatusBadge status={ev.status} /></td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#ccc' }}>→</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showForm && <NewEventModal onClose={() => setShowForm(false)} />}
    </div>
  )
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, onClick }: { event: EventItem; onClick: () => void }) {
  return (
    <Card hover onClick={onClick} style={{ overflow: 'hidden' }}>
      <div
        style={{
          height: 110,
          background: '#f7f7f7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 46,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        {event.image}
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <StatusBadge status={event.status} />
          <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500 }}>{event.category}</span>
        </div>
        <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: '#111', lineHeight: 1.35 }}>
          {event.title}
        </h3>
        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#aaa', lineHeight: 1.6, fontStyle: 'italic' }}>
          {event.story.slice(0, 72)}…
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 12,
            borderTop: '1px solid #f5f5f5',
          }}
        >
          <span style={{ fontSize: 11, color: '#aaa' }}>👥 {event.attendees}</span>
          <span style={{ fontSize: 11, color: '#aaa' }}>💰 KES {(event.budget / 1000).toFixed(0)}K</span>
          <span style={{ fontSize: 11, color: '#aaa' }}>📅 {event.date}</span>
        </div>
      </div>
    </Card>
  )
}
