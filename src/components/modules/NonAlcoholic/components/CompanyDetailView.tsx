import type { CompanyCardProps } from './CompanyCard'
import { Breadcrumb } from './Breadcrumb'
import { WorkflowNav } from './WorkflowNav'
import { ActionContent } from './ActionContent'
import { tokens } from '../tokens'
import type { NonAlcoholicActionId } from '../actions'

interface CompanyDetailViewProps {
  company: CompanyCardProps['company']
  action: NonAlcoholicActionId | null
  onBack: () => void
  onSelectAction: (id: NonAlcoholicActionId | null) => void
}

export function CompanyDetailView({ company, action, onBack, onSelectAction }: CompanyDetailViewProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: tokens.surfacePrimary,
        borderRadius: tokens.radiusLg,
        overflow: 'hidden',
        fontFamily: tokens.fontBody,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          padding: '20px 24px 0',
          background: tokens.surfacePrimary,
          borderBottom: `1px solid ${tokens.borderSubtle}`,
          zIndex: 10,
        }}
      >
        <Breadcrumb
          module="Non Alcoholic"
          company={company.name}
          action={action}
          onModuleClick={onBack}
          onCompanyClick={() => onSelectAction(null)}
        />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to companies"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: tokens.radiusMd,
              border: `1px solid ${tokens.borderDefault}`,
              background: tokens.surfacePrimary,
              color: tokens.textSecondary,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = tokens.borderStrong }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.borderDefault }}
          >
            ←
          </button>
          <h2 style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: tokens.textPrimary,
            letterSpacing: '-0.02em',
          }}>
            {company.name}
          </h2>
        </div>

        <WorkflowNav active={action} onSelect={onSelectAction} />
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          minHeight: 0,
        }}
      >
        {action ? (
          <ActionContent action={action} companyName={company.name} />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '56px 0',
              color: tokens.textTertiary,
              fontFamily: tokens.fontBody,
              fontSize: 13.5,
            }}
          >
            <span style={{ fontSize: 22, marginBottom: 4 }}>📋</span>
            <span style={{ fontWeight: 500, color: tokens.textSecondary }}>Select a workflow above to get started</span>
            <span style={{ fontSize: 12.5 }}>Choose an action from the navigation tabs</span>
          </div>
        )}
      </div>
    </div>
  )
}
