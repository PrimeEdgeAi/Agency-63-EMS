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
  last_reminder_at?: string | null
}

interface ProposalsPageProps {
  proposals: Proposal[]
  loading: boolean
  pendingCount: number
  title: string
  setTitle: (val: string) => void
  budget: string
  setBudget: (val: string) => void
  fileName: string
  setFileName: (val: string) => void
  onAddProposal: () => void
  onSendReminder: (id: string) => void
  isDelayed: (p: Proposal) => boolean
}

export function ProposalsPage({
  proposals,
  loading,
  pendingCount,
  onSendReminder,
  isDelayed,
}: ProposalsPageProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProposals = proposals.filter((proposal) => {
    const search = searchTerm.trim().toLowerCase()
    if (!search) return true

    return [
      proposal.title,
      proposal.submitted_by,
      proposal.file_name,
      proposal.status,
    ]
      .filter(Boolean)
      .some((value) => value?.toString().toLowerCase().includes(search))
  })

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 24, fontSize: 32, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' }}>
          Proposals
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Manage and track all submitted proposals
          </p>
          <span style={{ background: '#b91c1c', color: '#fff', borderRadius: 999, padding: '6px 12px', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', minWidth: 80, justifyContent: 'center' }}>
            Pending {pendingCount}
          </span>
        </div>

        {/* Search Proposal */}
        <div style={{
          background: '#fff',
          padding: 24,
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          marginBottom: 32,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 12 }}>
            Search Proposals
          </h3>
          <p style={{ color: '#6b7280', margin: '0 0 16px', fontSize: 14 }}>
            Find existing proposals by title, client, file name, or status.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              placeholder="Search proposals"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                minWidth: 260,
                padding: '10px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                fontSize: 14,
                fontFamily: 'inherit',
              }}
            />
            {searchTerm && (
              <Button variant="secondary" onClick={() => setSearchTerm('')}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Proposals List */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
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
              No proposals available yet.
            </div>
          )}

          {!loading && proposals.length > 0 && filteredProposals.length === 0 && (
            <div style={{ color: '#9ca3af', padding: 32, textAlign: 'center' }}>
              No proposals match your search.
            </div>
          )}

          {!loading && filteredProposals.length > 0 && (
            <div>
              {filteredProposals.map((p, idx) => (
                <div key={p.id} style={{
                  borderBottom: idx < filteredProposals.length - 1 ? '1px solid #f3f4f6' : 'none',
                }}>
                  <button
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                    style={{
                      width: '100%',
                      padding: 20,
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f9fafb'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          marginBottom: 8,
                        }}>
                          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>
                            {p.title}
                          </h4>
                          {p.file_name && (
                            <span style={{
                              fontSize: 12,
                              color: '#9ca3af',
                              background: '#f3f4f6',
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}>
                              {p.file_name}
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontSize: 13,
                          color: '#6b7280',
                          display: 'flex',
                          gap: 20,
                        }}>
                          <span>Budget: <strong>KES {p.budget.toLocaleString()}</strong></span>
                          <span>By: <strong>{p.submitted_by}</strong></span>
                          <span>Submitted: {new Date(p.submitted_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div style={{ marginLeft: 16 }}>
                        {p.status === 'approved' ? (
                          <span style={{
                            background: '#dcfce7',
                            color: '#166534',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: 12,
                            whiteSpace: 'nowrap',
                          }}>
                            ✓ Approved
                          </span>
                        ) : isDelayed(p) ? (
                          <span style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: 12,
                            whiteSpace: 'nowrap',
                          }}>
                            ⚠ Delayed
                          </span>
                        ) : (
                          <span style={{
                            background: '#f3f4f6',
                            color: '#374151',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: 12,
                            whiteSpace: 'nowrap',
                          }}>
                            ⏳ Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedId === p.id && (
                    <div style={{
                      background: '#f9fafb',
                      padding: '16px 20px',
                      borderTop: '1px solid #e5e7eb',
                      display: 'flex',
                      gap: 8,
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}>
                      <div style={{ color: '#6b7280', fontSize: 13, flex: 1 }}>
                        Review proposals for next allocation cycles. Approvals are managed through the admin process.
                      </div>
                      {isDelayed(p) && (
                        <Button onClick={() => onSendReminder(p.id)} variant="secondary">
                          Send Reminder
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
