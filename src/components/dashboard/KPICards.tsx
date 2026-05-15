import { FiCalendar, FiUsers, FiDollarSign, FiFileText } from 'react-icons/fi'
import { Card } from '../ui'

interface KPICard {
  label: string
  value: string | number
  sub: string
  icon: 'calendar' | 'users' | 'dollar' | 'file'
}

interface KPICardsProps {
  cards: KPICard[]
}

const ICON_MAP = {
  calendar: FiCalendar,
  users: FiUsers,
  dollar: FiDollarSign,
  file: FiFileText,
}

const ACCENT_MAP: Record<string, string> = {
  calendar: '#248afd',
  users: '#71c02b',
  dollar: '#f5a623',
  file: '#ff4747',
}

export function KPICards({ cards }: KPICardsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 32 }}>
      {cards.map((k) => {
        const Icon = ICON_MAP[k.icon]
        const accent = ACCENT_MAP[k.icon]
        return (
          <Card
            key={k.label}
            style={{
              padding: 24,
              borderTop: `4px solid ${accent}`,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                background: `${accent}1a`,
                color: accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                marginBottom: 16,
              }}
            >
              <Icon />
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#111', letterSpacing: -1, marginBottom: 4 }}>
              {k.value}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{k.sub}</div>
          </Card>
        )
      })}
    </div>
  )
}
