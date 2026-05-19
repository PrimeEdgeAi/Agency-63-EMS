import { useState } from 'react'
import {
  FiCalendar,
  FiMapPin,
  FiClipboard,
  FiFileText,
  FiCheckCircle,
  FiBriefcase,
  FiArrowLeft,
  FiChevronRight,
} from 'react-icons/fi'
import ModuleData from './type'
// import { ModuleActionGrid } from '../ModuleActionGrid'
import { EventSubmission } from '../components/EventSubmission'
import { RecceForm } from '../components/RecceForm'
import { RequisitionForm } from '../components/RequisitionForm'

/* ─────────────────────────────────────────────
   Design tokens — single source of truth
───────────────────────────────────────────── */
const tokens = {
  /* Surface */
  surfacePrimary: '#ffffff',
  surfaceSecondary: '#f6f6f7',
  surfaceTertiary: '#edeff0',

  /* Border */
  borderSubtle: 'rgba(0,0,0,0.07)',
  borderDefault: 'rgba(0,0,0,0.12)',
  borderStrong: 'rgba(0,0,0,0.20)',

  /* Text */
  textPrimary: '#111110',
  textSecondary: '#6b6b68',
  textTertiary: '#9b9b97',

  /* Accent — deep teal */
  accentBase: '#248afd',
  accentLight: 'rgb(225, 233, 245)',
  accentHover: '#248afd',
  accentText: 'rgb(8, 43, 80)',

  
  /* Type */
  fontDisplay: "'DM Sans', 'Helvetica Neue', sans-serif",
  fontBody: "'DM Sans', 'Helvetica Neue', sans-serif",

  /* Spacing */
  radiusSm: '6px',
  radiusMd: '10px',
  radiusLg: '14px',
} as const

/* ─────────────────────────────────────────────
   Action definitions
───────────────────────────────────────────── */
const ACTIONS = [
  { id: 'events',       label: 'Events',       icon: <FiCalendar />,     description: 'Submit & track events'   },
  { id: 'recce',        label: 'Recce',        icon: <FiMapPin />,       description: 'Site reconnaissance'     },
  { id: 'requisitions', label: 'Requisitions', icon: <FiClipboard />,    description: 'Raise a requisition'     },
  { id: 'proposals',    label: 'Proposals',    icon: <FiFileText />,     description: 'Draft proposals'         },
  { id: 'completed',    label: 'Completed',    icon: <FiCheckCircle />,  description: 'View completed items'    },
  { id: 'jobs',         label: 'Jobs',         icon: <FiBriefcase />,    description: 'Manage job orders'       },
]

/* ─────────────────────────────────────────────
   Action content router
───────────────────────────────────────────── */
function ActionContent({ action, companyName }: { action: string; companyName: string }) {
  if (action === 'events')       return <EventSubmission companyName={companyName} onBack={() => {}} />
  if (action === 'recce')        return <RecceForm        companyName={companyName} onBack={() => {}} />
  if (action === 'requisitions') return <RequisitionForm  companyName={companyName} onBack={() => {}} />
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '48px 0',
      color: tokens.textTertiary,
      fontFamily: tokens.fontBody,
      fontSize: 14,
    }}>
      <span style={{ fontSize: 22 }}><FiFileText /></span>
      <span>This module is not yet available.</span>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Compact Workflow Nav — replaces ModuleActionGrid
   when inside a selected company view
───────────────────────────────────────────── */
function WorkflowNav({
  active,
  onSelect,
}: {
  active: string | null
  onSelect: (id: string) => void
}) {
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
              // borderRadius: tokens.radiusMd,
              // border: isActive
              //   ? `1.5px solid ${tokens.accentBase}`
              //   : `1px solid ${tokens.borderDefault}`,
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

/* ─────────────────────────────────────────────
   Company card
───────────────────────────────────────────── */
function CompanyCard({
  company,
  onClick,
}: {
  company: { id: number; name: string; logo: string }
  onClick: () => void
}) {
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

/* ─────────────────────────────────────────────
   Breadcrumb trail
───────────────────────────────────────────── */
function Breadcrumb({
  module,
  company,
  action,
  onModuleClick,
  onCompanyClick,
}: {
  module: string
  company: string | null
  action: string | null
  onModuleClick: () => void
  onCompanyClick: () => void
}) {
  const activeAction = ACTIONS.find((a) => a.id === action)
  const sep = <span style={{ color: tokens.textTertiary, margin: '0 4px', fontSize: 12 }}>/</span>

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
          {sep}
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
          {sep}
          <span style={{ color: tokens.textPrimary, fontWeight: 500 }}>{activeAction.label}</span>
        </>
      )}
    </nav>
  )
}

/* ─────────────────────────────────────────────
   Divider
───────────────────────────────────────────── */
function Divider({ spacing = 0 }: { spacing?: number }) {
  return (
    <div style={{
      height: '1px',
      background: tokens.borderSubtle,
      margin: spacing ? `${spacing}px 0` : 0,
    }} />
  )
}

/* ─────────────────────────────────────────────
   Main export
───────────────────────────────────────────── */
export function NonAlcoholic() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  const selectedCompany =
    ModuleData.companies?.find((c) => c.id === selectedCompanyId) ?? null

  function handleBack() {
    setSelectedCompanyId(null)
    setSelectedAction(null)
  }

  /* ── Company detail view ── */
  if (selectedCompany) {
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
        {/* ── Sticky header ── */}
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
            module={ModuleData.name}
            company={selectedCompany.name}
            action={selectedAction}
            onModuleClick={handleBack}
            onCompanyClick={() => setSelectedAction(null)}
          />

          {/* Company identity row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}>
            <button
              type="button"
              onClick={handleBack}
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
              <FiArrowLeft size={15} />
            </button>
            <h2 style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              color: tokens.textPrimary,
              letterSpacing: '-0.02em',
            }}>
              {selectedCompany.name}
            </h2>
          </div>

          {/* Compact workflow nav */}
          <WorkflowNav active={selectedAction} onSelect={setSelectedAction} />
        </div>

        {/* ── Scrollable content ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            minHeight: 0,
          }}
        >
          {selectedAction ? (
            <ActionContent
              action={selectedAction}
              companyName={selectedCompany.name}
            />
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '56px 0',
              color: tokens.textTertiary,
              fontFamily: tokens.fontBody,
              fontSize: 13.5,
            }}>
              <span style={{ fontSize: 22, marginBottom: 4 }}><FiClipboard /></span>
              <span style={{ fontWeight: 500, color: tokens.textSecondary }}>Select a workflow above to get started</span>
              <span style={{ fontSize: 12.5 }}>Choose an action from the navigation tabs</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ── Company listing view ── */
  return (
    <div
      style={{
        background: tokens.surfacePrimary,
        borderRadius: tokens.radiusLg,
        fontFamily: tokens.fontBody,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
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
          {ModuleData.name}
        </h1>
        <p style={{
          margin: 0,
          fontSize: 13.5,
          color: tokens.textSecondary,
          lineHeight: 1.6,
          maxWidth: 500,
        }}>
          {ModuleData.description}
        </p>
      </div>

      <Divider />

      {/* Company grid */}
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
          {ModuleData.companies?.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onClick={() => { setSelectedCompanyId(company.id); setSelectedAction(null) }}
            />
          ))}
        </div> 
      </div>
    </div>
  )
}