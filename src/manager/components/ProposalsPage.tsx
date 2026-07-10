import { useEffect, useState } from 'react'
import { Button } from '../../components/ui'

export interface Proposal {
  id: string
  title: string
  budget: number
  submitted_by: string
  submitted_at: string
  file_name?: string | null
  status: 'pending' | 'approved'
  approved_at?: string | null
  job_id?: string | null
  client?: string | null
  location?: string | null
  status_label?: string | null
}

interface ProposalsPageProps {
  proposals: Proposal[]
  loading: boolean
  pendingCount: number
  isDelayed: (p: Proposal) => boolean
  onApproveProposal?: (id: string) => void
  onUpdateBudget?: (id: string, budget: number) => void
}

export function ProposalsPage({ proposals, loading, pendingCount, isDelayed, onApproveProposal, onUpdateBudget }: ProposalsPageProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [budgetValues, setBudgetValues] = useState<Record<string, string>>({})
  const [localStatus, setLocalStatus] = useState<Record<string, 'pending' | 'approved'>>({})

  useEffect(() => {
    const values: Record<string, string> = {}
    proposals.forEach((proposal) => {
      values[proposal.id] = proposal.budget.toString()
    })
    setBudgetValues(values)
  }, [proposals])

  const handleBudgetChange = (proposalId: string, value: string) => {
    setBudgetValues((prev) => ({
      ...prev,
      [proposalId]: value,
    }))
  }

  const handleSetBudget = (proposalId: string) => {
    const value = budgetValues[proposalId] ?? ''
    const budget = Number(value)
    if (!Number.isFinite(budget) || budget < 0) return

    if (onUpdateBudget) {
      onUpdateBudget(proposalId, budget)
    }

    setBudgetValues((prev) => ({
      ...prev,
      [proposalId]: budget.toString(),
    }))
  }

  const handleApprove = (proposalId: string) => {
    if (onApproveProposal) {
      onApproveProposal(proposalId)
    }
    setLocalStatus((prev) => ({
      ...prev,
      [proposalId]: 'approved',
    }))
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' }}>
            Proposals
          </h1>
          <span style={{ background: '#b91c1c', color: '#fff', borderRadius: 999, padding: '8px 14px', fontSize: 13, fontWeight: 700 }}>
            Pending {pendingCount}
          </span>
        </div>
        <p style={{ color: '#6b7280', margin: '12px 0 0 0' }}>
          Review proposals submitted by your agents and approve budgets directly.
        </p>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
        {loading && (
          <div style={{ color: '#6b7280', padding: 32, textAlign: 'center' }}>
            Loading proposals…
          </div>
        )}

        {!loading && proposals.length === 0 && (
          <div style={{ color: '#9ca3af', padding: 32, textAlign: 'center' }}>
            No proposals available for your team yet.
          </div>
        )}

        {!loading && proposals.length > 0 && proposals.map((proposal, idx) => {
          const isOpen = expandedId === proposal.id
          const effectiveStatus = localStatus[proposal.id] ?? proposal.status
          const inputBudget = budgetValues[proposal.id] ?? proposal.budget.toString()

          return (
            <div key={proposal.id} style={{ borderBottom: idx < proposals.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <button
                onClick={() => setExpandedId(isOpen ? null : proposal.id)}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  padding: 22,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111' }}>{proposal.title}</h3>
                      {proposal.file_name && (
                        <span style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', padding: '5px 10px', borderRadius: 8 }}>
                          {proposal.file_name}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, color: '#6b7280', fontSize: 13 }}>
                      <span>Job ID: <strong>{proposal.job_id ?? proposal.id}</strong></span>
                      <span>Budget: <strong>KES {Number(inputBudget).toLocaleString()}</strong></span>
                      <span>Submitted by: <strong>{proposal.submitted_by}</strong></span>
                      <span>Client: <strong>{proposal.client ?? '—'}</strong></span>
                      <span>Location: <strong>{proposal.location ?? '—'}</strong></span>
                      <span>Submitted: <strong>{new Date(proposal.submitted_at).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {effectiveStatus === 'approved' ? (
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '8px 14px', borderRadius: 10, fontWeight: 700, fontSize: 12 }}>
                        Approved
                      </span>
                    ) : isDelayed(proposal) ? (
                      <span style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 14px', borderRadius: 10, fontWeight: 700, fontSize: 12 }}>
                        Delayed
                      </span>
                    ) : (
                      <span style={{ background: '#f3f4f6', color: '#374151', padding: '8px 14px', borderRadius: 10, fontWeight: 700, fontSize: 12 }}>
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {isOpen && (
                <div style={{ background: '#f9fafb', padding: 20, borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'grid', gap: 14, alignItems: 'center', gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div style={{ display: 'grid', gap: 8 }}>
                        <label style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>Update budget</label>
                        <input
                          type="number"
                          value={inputBudget}
                          onChange={(e) => handleBudgetChange(proposal.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 10,
                            border: '1px solid #d1d5db',
                            fontSize: 14,
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <Button onClick={() => handleSetBudget(proposal.id)} variant="secondary">
                          Set Budget
                        </Button>
                        <Button onClick={() => handleApprove(proposal.id)} disabled={effectiveStatus === 'approved'}>
                          {effectiveStatus === 'approved' ? 'Approved' : 'Approve'}
                        </Button>
                      </div>
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6 }}>
                      Approve proposals after confirming budget details. Use the budget control to adjust the requested amount before approval.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
