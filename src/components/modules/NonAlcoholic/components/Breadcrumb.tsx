import { ACTIONS } from '../actions'
import type { NonAlcoholicActionId } from '../actions'
import { tokens } from '../tokens'

interface BreadcrumbProps {
  module: string
  company: string | null
  action: NonAlcoholicActionId | null
  onModuleClick: () => void
  onCompanyClick: () => void
}

export function Breadcrumb({ module, company, action, onModuleClick, onCompanyClick }: BreadcrumbProps) {
  const activeAction = ACTIONS.find((item) => item.id === action)
  const separator = <span style={{ color: tokens.textTertiary, margin: '0 4px', fontSize: 12 }}>/</span>

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        fontFamily: tokens.fontBody,
        fontSize: 12,
        color: tokens.textTertiary,
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <button
        type="button"
        onClick={onModuleClick}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: company ? 'pointer' : 'default',
          fontFamily: tokens.fontBody,
          fontSize: 12,
          color: company ? tokens.accentBase : tokens.textPrimary,
          fontWeight: company ? 400 : 500,
        }}
      >
        {module}
      </button>

      {company && (
        <>
          {separator}
          <button
            type="button"
            onClick={onCompanyClick}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: action ? 'pointer' : 'default',
              fontFamily: tokens.fontBody,
              fontSize: 12,
              color: action ? tokens.accentBase : tokens.textPrimary,
              fontWeight: action ? 400 : 500,
            }}
          >
            {company}
          </button>
        </>
      )}

      {activeAction && (
        <>
          {separator}
          <span style={{ color: tokens.textPrimary, fontWeight: 500 }}>{activeAction.label}</span>
        </>
      )}
    </nav>
  )
}
