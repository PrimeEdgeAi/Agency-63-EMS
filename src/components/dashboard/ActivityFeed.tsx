import { FiUserPlus, FiDollarSign, FiEdit, FiMail, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

interface ActivityItem {
  id: number
  type: 'registration' | 'payment' | 'edit' | 'campaign' | 'approval' | 'alert'
  title: string
  detail: string
  time: string
}

const ACTIVITIES: ActivityItem[] = [
  { id: 1, type: 'registration', title: 'Nairobi Tech Summit', detail: '14 new registrations', time: '2 min ago' },
  { id: 2, type: 'payment', title: 'Payment received', detail: 'KES 240,000 from Serena Catering', time: '18 min ago' },
  { id: 3, type: 'approval', title: 'PR-003 approved', detail: 'Aberdare Resorts venue booking', time: '1 hr ago' },
  { id: 4, type: 'edit', title: 'Board Strategy Session', detail: 'Event details updated', time: '2 hr ago' },
  { id: 5, type: 'campaign', title: 'Campaign email sent', detail: 'To 4,800 subscribers', time: '3 hr ago' },
  { id: 6, type: 'alert', title: 'Leadership Retreat', detail: 'Venue contract expiring in 3 days', time: '5 hr ago' },
]

const TYPE_CONFIG = {
  registration: { Icon: FiUserPlus,   bg: '#eff6ff', color: '#3b82f6' },
  payment:      { Icon: FiDollarSign, bg: '#f0fdf4', color: '#22c55e' },
  edit:         { Icon: FiEdit,       bg: '#fefce8', color: '#f59e0b' },
  campaign:     { Icon: FiMail,       bg: '#fdf4ff', color: '#a855f7' },
  approval:     { Icon: FiCheckCircle,bg: '#f0fdf4', color: '#15803d' },
  alert:        { Icon: FiAlertCircle,bg: '#fff7ed', color: '#ea580c' },
}

export function ActivityFeed() {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 16,
        border: '1px solid #e8edf5',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        flex: 1,
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
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Recent activity</div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#64748b',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 20,
            padding: '2px 8px',
          }}
        >
          Live
        </div>
      </div>

      <div style={{ padding: '4px 0' }}>
        {ACTIVITIES.map((act, i) => {
          const { Icon, bg, color } = TYPE_CONFIG[act.type]
          return (
            <div
              key={act.id}
              style={{
                padding: '11px 20px',
                borderBottom: i < ACTIVITIES.length - 1 ? '1px solid #f8fafc' : 'none',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: bg,
                  color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <Icon />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 1 }}>{act.title}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{act.detail}</div>
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', flexShrink: 0, marginTop: 2 }}>{act.time}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
