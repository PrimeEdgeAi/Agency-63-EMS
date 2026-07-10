interface BarDatum { label: string; value: number; color?: string }

export function SimpleBarChart({ data, title }: { data: BarDatum[]; title: string }) {
  const max = Math.max(1, ...data.map((item) => item.value))

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`, gap: 10, alignItems: 'end', minHeight: 180 }}>
        {data.map((item) => (
          <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: '100%', minHeight: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: 36, height: `${(item.value / max) * 100}%`, minHeight: 8, background: item.color ?? '#60a5fa', borderRadius: '8px 8px 0 0' }} />
            </div>
            <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TrendChart({ data, title }: { data: Array<{ label: string; value: number }>; title: string }) {
  const max = Math.max(1, ...data.map((item) => item.value))
  const points = data.map((item, index) => {
    const x = (index / Math.max(1, data.length - 1)) * 100
    const y = 100 - (item.value / max) * 80 - 10
    return `${x},${y}`
  })

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>{title}</div>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: 180 }}>
        <polyline fill="none" stroke="#2563eb" strokeWidth="2" points={points.join(' ')} />
        {data.map((item, index) => {
          const x = (index / Math.max(1, data.length - 1)) * 100
          const y = 100 - (item.value / max) * 80 - 10
          return <circle key={item.label} cx={x} cy={y} r="2" fill="#2563eb" />
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
        {data.map((item) => <span key={item.label}>{item.label}</span>)}
      </div>
    </div>
  )
}
