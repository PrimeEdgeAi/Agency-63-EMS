import type { EventItem } from '../../types'
import { Card } from '../ui'

interface EventStoriesProps {
  events: EventItem[]
}

export function EventStories({ events }: EventStoriesProps) {
  return (
    <Card style={{ padding: '24px 24px 16px' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111' }}>
        Event Stories
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {events.slice(0, 4).map((ev) => (
          <div
            key={ev.id}
            style={{
              padding: '14px',
              background: '#fafafa',
              borderRadius: 10,
              borderLeft: '3px solid #e5e5e5',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: '#111', marginBottom: 4 }}>
              {ev.image} {ev.title}
            </div>
            <p style={{ fontSize: 12, color: '#999', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
              {ev.story}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}
