import { ACTIONS } from '../actions'
import type { NonAlcoholicActionId } from '../actions'
import { tokens } from '../tokens'

interface WorkflowNavProps {
  active: NonAlcoholicActionId | null
  onSelect: (id: NonAlcoholicActionId) => void
}

export function WorkflowNav({ active, onSelect }: WorkflowNavProps) {
  return (
    <div
      role="tablist"
      aria-label="Workflow actions"
      style={{
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap',
        padding: '10px 0',
      }}
    >
      {ACTIONS.map((a) => {
        const isActive = a.id === active
        return (
          <button
            key={a.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onSelect(a.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 13px',
              background: isActive ? tokens.accentLight : tokens.surfacePrimary,
              color: isActive ? tokens.accentText : tokens.textSecondary,
              fontFamily: tokens.fontBody,
              fontSize: 12.5,
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              letterSpacing: '0.01em',
            }}
          >
            <span style={{ fontSize: 13, display: 'flex', alignItems: 'center' }}>{a.icon}</span>
            {a.label}
          </button>
        )
      })}
    </div>
  )
}
