import { FiChevronRight } from 'react-icons/fi'
import { tokens } from '../tokens'

export interface CompanyCardProps {
  company: { id: number; name: string; logo: string }
  onClick: () => void
}

export function CompanyCard({ company, onClick }: CompanyCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        outline: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 12,
        padding: '18px',
        borderRadius: tokens.radiusLg,
        border: `1px solid ${tokens.borderSubtle}`,
        background: tokens.surfacePrimary,
        textAlign: 'left',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.borderColor = tokens.borderStrong
        el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.borderColor = tokens.borderSubtle
        el.style.boxShadow = 'none'
      }}
    >
      <img
        src={company.logo}
        alt={`${company.name} logo`}
        style={{ width: '100%', height: 40, objectFit: 'contain', objectPosition: 'left' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span style={{
          fontFamily: tokens.fontBody,
          fontSize: 13,
          fontWeight: 500,
          color: tokens.textPrimary,
        }}>
          {company.name}
        </span>
        <FiChevronRight style={{ color: tokens.textTertiary, fontSize: 14 }} />
      </div>
    </button>
  )
}
