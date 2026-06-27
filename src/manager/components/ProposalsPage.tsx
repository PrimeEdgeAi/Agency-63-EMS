import { useState } from 'react'
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
}

interface ProposalsPageProps {
  proposals: Proposal[]
  loading: boolean
  onApprove: (id: string) => void
  isDelayed: (p: Proposal) => boolean
}

export function ProposalsPage({ proposals, loading, onApprove, isDelayed }: ProposalsPageProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 12, fontSize: 32, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' }}>
          Proposals
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Review proposals submitted by your agents and approve work that is ready to go.
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
                      <span>Budget: <strong>KES {proposal.budget.toLocaleString()}</strong></span>
                      <span>Submitted by: <strong>{proposal.submitted_by}</strong></span>
                      <span>Submitted: <strong>{new Date(proposal.submitted_at).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {proposal.status === 'approved' ? (
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
                <div style={{ background: '#f9fafb', padding: 20, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  {proposal.status !== 'approved' && (
                    <Button variant="primary" onClick={() => onApprove(proposal.id)}>
                      Approve Proposal
                    </Button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
