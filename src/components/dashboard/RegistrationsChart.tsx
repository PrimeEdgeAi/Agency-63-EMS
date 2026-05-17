import { useMemo } from 'react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Simulated monthly registration data
const DATA_2025 = [620, 740, 810, 1100, 1950, 1420, 1280, 1590, 2100, 1870, 1300, 980]
const DATA_2024 = [480, 590, 700, 920, 1600, 1150, 1050, 1350, 1820, 1600, 1100, 800]

function buildPath(data: number[], w: number, h: number, pad: number): string {
  const max = Math.max(...data, ...DATA_2024)
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (w - pad * 2))
  const ys = data.map((v) => pad + (1 - v / max) * (h - pad * 2))
  let d = `M ${xs[0]} ${ys[0]}`
  for (let i = 1; i < xs.length; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2
    d += ` C ${cx} ${ys[i - 1]}, ${cx} ${ys[i]}, ${xs[i]} ${ys[i]}`
  }
  return d
}

function buildArea(data: number[], w: number, h: number, pad: number): string {
  const path = buildPath(data, w, h, pad)
  const lastX = pad + (w - pad * 2)
  const firstX = pad
  return `${path} L ${lastX} ${h - pad} L ${firstX} ${h - pad} Z`
}

export function RegistrationsChart() {
  const W = 560
  const H = 220
  const PAD = 24

  const path25 = useMemo(() => buildPath(DATA_2025, W, H, PAD), [])
  const area25 = useMemo(() => buildArea(DATA_2025, W, H, PAD), [])
  const path24 = useMemo(() => buildPath(DATA_2024, W, H, PAD), [])

  const max = Math.max(...DATA_2025, ...DATA_2024)
  const xs = DATA_2025.map((_, i) => PAD + (i / (DATA_2025.length - 1)) * (W - PAD * 2))
  const ys25 = DATA_2025.map((v) => PAD + (1 - v / max) * (H - PAD * 2))

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 16,
        padding: '22px 24px',
        border: '1px solid #e8edf5',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Registrations over time</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Monthly attendee sign-ups</div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
            <span style={{ width: 20, height: 2, background: '#248afd', display: 'inline-block', borderRadius: 1 }} />
            2025
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
            <span style={{ width: 20, height: 2, background: '#cbd5e1', display: 'inline-block', borderRadius: 1, borderTop: '2px dashed #cbd5e1' }} />
            2024
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
        aria-label="Line chart of monthly registrations 2025 vs 2024"
        role="img"
      >
        <defs>
          <linearGradient id="grad25" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#248afd" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#248afd" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines */}
        {[0.25, 0.5, 0.75, 1].map((f) => {
          const y = PAD + (1 - f) * (H - PAD * 2)
          const val = Math.round(f * max)
          return (
            <g key={f}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#f1f5f9" strokeWidth={1} />
              <text x={PAD - 6} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize={9}>
                {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
              </text>
            </g>
          )
        })}

        {/* Area fill 2025 */}
        <path d={area25} fill="url(#grad25)" />

        {/* 2024 dashed line */}
        <path d={path24} fill="none" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* 2025 line */}
        <path d={path25} fill="none" stroke="#248afd" strokeWidth={2} />

        {/* Data points 2025 */}
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys25[i]} r={3} fill="#248afd" stroke="white" strokeWidth={1.5} />
        ))}

        {/* Month labels */}
        {MONTHS.map((m, i) => (
          <text key={m} x={xs[i]} y={H - 4} textAnchor="middle" fill="#94a3b8" fontSize={9}>
            {m}
          </text>
        ))}
      </svg>
    </div>
  )
}
