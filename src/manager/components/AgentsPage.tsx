import { useMemo } from 'react'
import { StatusBadge } from '../../components/ui'

export interface Proposal {
  id: string
  title: string
  budget: number
  submitted_by: string
  submitted_at: string
  file_name?: string | null
  status: 'pending' | 'approved'
}

export interface Agent {
  id: number
  emp_id: string
  role: 'finance' | 'manager' | 'agent'
  name: string
  email: string
  department: string
  manager_id: number | null
}

interface MyAgentsPageProps {
  agents: Agent[]
  proposals: Proposal[]
}

export function MyAgentsPage({ agents, proposals }: MyAgentsPageProps) {
  const agentMetrics = useMemo(() => {
    return agents.map((agent) => {
      const agentProposals = proposals.filter((proposal) => proposal.submitted_by === agent.email)
      const approved = agentProposals.filter((proposal) => proposal.status === 'approved').length
      const pending = agentProposals.length - approved
      const progress = agentProposals.length === 0 ? 0 : Math.round((approved / agentProposals.length) * 100)
      return { agent, approved, pending, progress, total: agentProposals.length }
    })
  }, [agents, proposals])

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 12, fontSize: 32, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' }}>
          Agent Progress
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Monitor assigned agents, the proposals they are working on, and completion progress.
        </p>
      </div>

      {agents.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 32, color: '#6b7280' }}>
          No agents are currently assigned to your account. When agents are assigned, their progress will appear here.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {agentMetrics.map(({ agent, approved, pending, progress, total }) => (
            <div key={agent.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{agent.name}</div>
                  <div style={{ color: '#6b7280', fontSize: 13 }}>{agent.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', fontSize: 13 }}>{agent.department}</span>
                  <StatusBadge status={total === 0 ? 'pending' : approved === total ? 'approved' : 'review'} />
                </div>
              </div>

              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 18 }}>
                  <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 10 }}>Total proposals</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#111' }}>{total}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 18 }}>
                  <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 10 }}>Approved</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#111' }}>{approved}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 18 }}>
                  <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 10 }}>Pending</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#111' }}>{pending}</div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#6b7280', fontSize: 13 }}>
                  <span>Team progress</span>
                  <span>{progress}%</span>
                </div>
                <div style={{ background: '#f3f4f6', height: 12, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, background: '#248afd', height: '100%' }} />
                </div>
              </div>

              {total > 0 && (
                <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
                  {proposals.filter((proposal) => proposal.submitted_by === agent.email).map((proposal) => (
                    <div key={proposal.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: 12, borderRadius: 12, background: '#f9fafb' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{proposal.title}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(proposal.submitted_at).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <StatusBadge status={proposal.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
