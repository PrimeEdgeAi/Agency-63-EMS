import { CompanyCard } from './CompanyCard'
import { Divider } from './Divider'
import { tokens } from '../tokens'

interface Company {
  id: number
  name: string
  logo: string
}

interface CompanyListViewProps {
  companies: Company[]
  moduleName: string
  moduleDescription: string
  onSelectCompany: (id: number) => void
}

export function CompanyListView({ companies, moduleName, moduleDescription, onSelectCompany }: CompanyListViewProps) {
  return (
    <div
      style={{
        background: tokens.surfacePrimary,
        borderRadius: tokens.radiusLg,
        fontFamily: tokens.fontBody,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '24px 24px 20px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 10px',
          borderRadius: 999,
          background: tokens.accentLight,
          color: tokens.accentText,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Module
        </div>
        <h1 style={{
          margin: '0 0 6px',
          fontSize: 22,
          fontWeight: 700,
          color: tokens.textPrimary,
          letterSpacing: '-0.025em',
          lineHeight: 1.2,
        }}>
          {moduleName}
        </h1>
        <p style={{
          margin: 0,
          fontSize: 13.5,
          color: tokens.textSecondary,
          lineHeight: 1.6,
          maxWidth: 500,
        }}>
          {moduleDescription}
        </p>
      </div>

      <Divider />

      <div style={{ padding: '20px 24px 24px' }}>
        <p style={{
          margin: '0 0 14px',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: tokens.textTertiary,
        }}>
          Select a company
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 10,
        }}>
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onClick={() => onSelectCompany(company.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
