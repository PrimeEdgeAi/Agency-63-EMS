interface SalutationProps {
  firstName: string
  dateLabel: string
}

export function Salutation({ firstName, dateLabel }: SalutationProps) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <p style={{ color: '#7d7d7d', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 8px', fontWeight: 600 }}>
            Overview
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 600, color: '#111', letterSpacing: -1, margin: '0 0 8px' }}>
            Hi {firstName}, welcome back!
          </h1>
        </div>

        <div
          style={{
            padding: '10px 16px',
            background: '#248afd',
            color: 'white',
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            alignSelf: 'center',
          }}
        >
          {dateLabel}
        </div>
      </div>

      <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
        Here's what's happening across your event portfolio today.
      </p>
    </div>
  )
}
