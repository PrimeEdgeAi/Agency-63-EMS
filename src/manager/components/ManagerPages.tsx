import { useState } from 'react'
import { CompanyDetailView } from '../../components/modules/NonAlcoholic/components/CompanyDetailView'
import { CompanyListView } from '../../components/modules/NonAlcoholic/components/CompanyListView'
import type { NonAlcoholicActionId } from '../../components/modules/NonAlcoholic/actions'
import AlcoholicModuleData from '../../components/modules/Alcoholic/types'
import NonAlcoholicModuleData from '../../components/modules/NonAlcoholic/types'
import type { EventStatus } from '../../types'

type ManagerModuleId = 'Alcoholic' | 'NonAlcoholic' | 'One Off' | 'UniCorns'

interface ManagerModuleCompany {
  id: number
  name: string
  logo: string
  category: string
}

interface ManagerModule {
  id: ManagerModuleId
  name: string
  description: string
  companies: ManagerModuleCompany[]
}

interface AgentInfo {
  id: number
  name: string
  email: string
  department: string
}

interface TeamPageProps {
  agents: AgentInfo[]
}

interface ReportsPageProps {
  proposalCount: number
  approvedCount: number
  delayedCount: number
  pendingProposalCount: number
}

interface TargetsPageProps {
  companies: Array<{ id: number; name: string; category: string; status: string }>
  kcbJobs: Array<{ id: number; title: string; location: string; status: EventStatus; date: string }>
}

const defaultLogo = AlcoholicModuleData.companies?.[0]?.logo ?? NonAlcoholicModuleData.companies?.[0]?.logo ?? ''

const MANAGER_MODULES: ManagerModule[] = [
  {
    id: 'Alcoholic',
    name: 'Alcoholic',
    description: 'Track alcoholic beverage workflow partners and event activations.',
    companies: AlcoholicModuleData.companies?.map((company) => ({
      id: company.id,
      name: company.name,
      category: company.category,
      logo: company.logo,
    })) ?? [],
  },
  {
    id: 'NonAlcoholic',
    name: 'Non-Alcoholic',
    description: 'Manage non-alcoholic client accounts and module partners.',
    companies: NonAlcoholicModuleData.companies?.map((company) => ({
      id: company.id,
      name: company.name,
      category: company.category,
      logo: company.logo,
    })) ?? [],
  },
  {
    id: 'One Off',
    name: 'One Off',
    description: 'Handle temporary one-off partners and short-term event assignments.',
    companies: [
      {
        id: 101,
        name: 'Eventflare One-Off',
        category: 'Special Event Partner',
        logo: defaultLogo,
      },
      {
        id: 102,
        name: 'Spark Mobile Activation',
        category: 'Activation Campaign',
        logo: defaultLogo,
      },
    ],
  },
  {
    id: 'UniCorns',
    name: 'UniCorns',
    description: 'Monitor premium unicorn accounts and strategic enterprise opportunities.',
    companies: [
      {
        id: 201,
        name: 'Bluehorn Capital',
        category: 'Enterprise Partner',
        logo: defaultLogo,
      },
      {
        id: 202,
        name: 'Starlight Retail',
        category: 'High Growth Client',
        logo: defaultLogo,
      },
    ],
  },
]

export function ModulesPage() {
  const [selectedModuleId, setSelectedModuleId] = useState<ManagerModuleId | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null)
  const [selectedAction, setSelectedAction] = useState<NonAlcoholicActionId | null>(null)

  const selectedModule = MANAGER_MODULES.find((module) => module.id === selectedModuleId) ?? null
  const selectedCompany = selectedModule?.companies.find((company) => company.id === selectedCompanyId) ?? null

  if (selectedCompany && selectedModule) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => setSelectedCompanyId(null)}
            style={{
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#111827',
              borderRadius: 12,
              padding: '10px 18px',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            ← Back to {selectedModule.name}
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' }}>
              {selectedCompany.name}
            </h1>
            <p style={{ color: '#6b7280', marginTop: 8 }}>
              {selectedCompany.category} · {selectedModule.name} module
            </p>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <CompanyDetailView
            company={selectedCompany}
            action={selectedAction as any}
            moduleName={selectedModule.name}
            onBack={() => {
              setSelectedCompanyId(null)
              setSelectedAction(null)
            }}
            onSelectAction={(actionId) => setSelectedAction(actionId)}
          />
        </div>
      </div>
    )
  }

  if (selectedModule) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => {
              setSelectedModuleId(null)
              setSelectedCompanyId(null)
            }}
            style={{
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#111827',
              borderRadius: 12,
              padding: '10px 18px',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            ← Back to modules
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' }}>
              {selectedModule.name}
            </h1>
            <p style={{ color: '#6b7280', marginTop: 8 }}>
              {selectedModule.description}
            </p>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <CompanyListView
            companies={selectedModule.companies}
            moduleName={selectedModule.name}
            moduleDescription={selectedModule.description}
            onSelectCompany={(companyId) => setSelectedCompanyId(companyId)}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' }}>
          Modules
        </h1>
        <p style={{ color: '#6b7280', marginTop: 8 }}>
          Choose a module to view assigned companies and launch workflows.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {MANAGER_MODULES.map((module) => (
          <button
            key={module.id}
            type="button"
            onClick={() => setSelectedModuleId(module.id)}
            style={{
              cursor: 'pointer',
              border: '1px solid #e5e7eb',
              borderRadius: 22,
              padding: 24,
              textAlign: 'left',
              background: '#fff',
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(15, 23, 42, 0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.06)' }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 10 }}>
              {module.id}
            </div>
            <h2 style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 700, color: '#111' }}>
              {module.name}
            </h2>
            <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6, minHeight: 72 }}>
              {module.description}
            </p>
            <div style={{ marginTop: 18, color: '#6b7280', fontSize: 13, fontWeight: 600 }}>
              {module.companies.length} company{module.companies.length === 1 ? '' : 'ies'}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export function TeamPage({ agents }: TeamPageProps) {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' }}>
          Team
        </h1>
        <p style={{ color: '#6b7280', marginTop: 8 }}>
          Review your active agents and team assignments.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div style={{ background: '#1d4ed8', color: '#fff', borderRadius: 18, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
              Assigned Agents
            </div>
            <div style={{ fontSize: 40, fontWeight: 700 }}>{agents.length}</div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: 24, borderBottom: '1px solid #eef2ff' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Agent roster</div>
            <div style={{ color: '#6b7280', marginTop: 6 }}>Your confirmed agents are shown here for fast management.</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#6b7280', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2 }}>
                  <th style={{ padding: '16px 18px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '16px 18px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '16px 18px', textAlign: 'left' }}>Department</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontSize: 13 }}>{agent.name}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13 }}>{agent.email}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13 }}>{agent.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ReportsPage({ proposalCount, approvedCount, delayedCount, pendingProposalCount }: ReportsPageProps) {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' }}>
          Reports
        </h1>
        <p style={{ color: '#6b7280', marginTop: 8 }}>
          Fast insights from your agents and active proposal work.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {[
          { label: 'Open proposals', value: proposalCount, accent: '#eff6ff', color: '#1d4ed8' },
          { label: 'Approved proposals', value: approvedCount, accent: '#dcfce7', color: '#166534' },
          { label: 'Delayed proposals', value: delayedCount, accent: '#fee2e2', color: '#991b1b' },
          { label: 'Pending proposals', value: pendingProposalCount, accent: '#fef2f2', color: '#b91c1c' },
        ].map((card) => (
          <div key={card.label} style={{ background: card.accent, borderRadius: 18, padding: 24, border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#64748b', marginBottom: 10 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TargetsPage({ companies, kcbJobs }: TargetsPageProps) {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' }}>
          Targets
        </h1>
        <p style={{ color: '#6b7280', marginTop: 8 }}>
          Track active company targets and event goals for your agent program.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div style={{ background: '#e0f2fe', borderRadius: 18, padding: 24, border: '1px solid #bae6fd' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#0c4a6e' }}>Target companies</div>
            <div style={{ fontSize: 34, fontWeight: 700, color: '#0c4a6e' }}>{companies.length}</div>
          </div>
          <div style={{ background: '#eef2ff', borderRadius: 18, padding: 24, border: '1px solid #c7d2fe' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#3730a3' }}>KCB workflow jobs</div>
            <div style={{ fontSize: 34, fontWeight: 700, color: '#3730a3' }}>{kcbJobs.length}</div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111' }}>Latest workflow targets</h2>
          <p style={{ color: '#6b7280', marginTop: 6 }}>Review target companies and event jobs that matter most for your current plan.</p>
          {kcbJobs.length > 0 ? (
            <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
              {kcbJobs.slice(0, 4).map((job) => (
                <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: 16, borderRadius: 14, border: '1px solid #e5e7eb', background: '#f8fafc' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{job.title}</div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{job.location} · {job.date}</div>
                  </div>
                  <span style={{ fontSize: 12, color: '#475569', alignSelf: 'center' }}>{job.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: 18, color: '#6b7280' }}>No active workflow targets are currently available.</div>
          )}
        </div>
      </div>
    </div>
  )
}
