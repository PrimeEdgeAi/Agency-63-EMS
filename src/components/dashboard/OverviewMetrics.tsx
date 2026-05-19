import { FiCalendar, FiUsers, FiDollarSign, FiFileText, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

interface Metric {
  label: string
  value: string | number
  sub: string
  delta: number        // positive = up, negative = down
  deltaLabel: string
  icon: 'calendar' | 'users' | 'dollar' | 'file'
}

interface OverviewMetricsProps {
  metrics: Metric[]
}

const ICON_MAP = { calendar: FiCalendar, users: FiUsers, dollar: FiDollarSign, file: FiFileText }
const ACCENT_MAP: Record<string, string> = {
  calendar: '#248afd',
  users: '#71c02b',
  dollar: '#f5a623',
  file: '#ff4747',
}

export function OverviewMetrics({ metrics }: OverviewMetricsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}
    >
      {metrics.map((m) => {
        const Icon = ICON_MAP[m.icon]
        const accent = ACCENT_MAP[m.icon]
        const isUp = m.delta >= 0
        const TrendIcon = isUp ? FiTrendingUp : FiTrendingDown
        return (
          <div
            key={m.label}
            style={{
              background: 'white',
              borderRadius: 16,
              padding: '20px 22px',
              border: '1px solid #e8edf5',
              borderTop: `3px solid ${accent}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `${accent}18`,
                  color: accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                }}
              >
                <Icon />
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 15,
                  background: isUp ? '#f0fdf4' : '#fff1f2',
                  color: isUp ? '#15803d' : '#be123c',
                }}
              >
                <TrendIcon size={10} />
                {Math.abs(m.delta)}%
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', letterSpacing: -1, lineHeight: 1 }}>
              {m.value}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{m.deltaLabel}</div>
          </div>
        )
      })}
    </div>
  )
}
