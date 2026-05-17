import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export interface ModuleActionItem {
  id: string
  label: string
  description?: string
  icon?: ReactNode
}

interface ModuleActionGridProps {
  title?: string
  items: ModuleActionItem[]
  active?: string
  onSelect?: (id: string) => void
}

export function ModuleActionGrid({ title = 'Quick actions', items, active: activeProp, onSelect }: ModuleActionGridProps) {
  const [active, setActive] = useState(activeProp ?? items[0]?.id ?? '')

  useEffect(() => {
    if (activeProp) setActive(activeProp)
  }, [activeProp])

  const current = activeProp ?? active

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.4 }}>
            {title}
          </p>
          <h3 style={{ margin: '8px 0 0', fontSize: 20, fontWeight: 700, color: '#111' }}>
            Select a workflow
          </h3>
        </div>
        {current && (
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
            {current}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {items.map((item) => {
          const isActive = current === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActive(item.id)
                onSelect?.(item.id)
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 12,
                padding: 18,
                width: '100%',
                minHeight: 140,
                borderRadius: 16,
                border: `1px solid ${isActive ? '#93c5fd' : '#e5e7eb'}`,
                background: isActive ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 12,
                  background: isActive ? '#2563eb' : '#eff6ff',
                  color: isActive ? '#ffffff' : '#2563eb',
                  fontSize: 16,
                }}
              >
                {item.icon ?? item.label.charAt(0)}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{item.label}</div>
              {item.description && <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{item.description}</div>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
