interface SalutationProps {
  firstName: string
  dateLabel: string
}

export function Salutation({ firstName, dateLabel }: SalutationProps) {
  return (
    <div
      style={{
        marginBottom: 18,
        padding: '24px 22px',
        borderRadius: 24,
        background: 'white',
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111', letterSpacing: -1, margin: 0 }}>
            Hi {firstName}, <span style={{ color: '#248afd' }}>welcome back.</span>
          </h1>
          <p style={{ color: '#475569', fontSize: 15, margin: '14px 0 0' }}>
            Here's what's happening across your event portfolio today.
          </p>
        </div>

        <div
          style={{
            padding: '12px 18px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#0f172a',
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {dateLabel}
        </div>
      </div>
    </div>
  )
}
