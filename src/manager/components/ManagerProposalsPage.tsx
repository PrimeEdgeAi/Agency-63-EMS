import { useState, useEffect } from 'react'
import { Button } from '../../components/ui'
import type { Proposal } from '../components/ProposalsPage'
import { sendProposalApprovalWebhook } from '../../lib/proposalWebhook'

export function ManagerProposalsPage({
  proposals,
  loading,
  isDelayed,
  onApproveProposal,
}: {
  proposals: Proposal[]
  loading: boolean
  pendingCount: number
  isDelayed: (p: Proposal) => boolean
  onApproveProposal?: (id: string) => void
}) {
  const [expandedApprovalId, setExpandedApprovalId] = useState<string | null>(null)
  const [approvalBudget, setApprovalBudget] = useState<Record<string, string>>({})
  const [approvalLoading, setApprovalLoading] = useState<Record<string, boolean>>({})
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!notification) return
    const timer = window.setTimeout(() => setNotification(null), 4000)
    return () => window.clearTimeout(timer)
  }, [notification])

  async function handleApproveProposal(proposal: Proposal) {
    const budget = approvalBudget[proposal.id]?.trim()
    if (!budget || Number(budget) <= 0) {
      setNotification({ type: 'error', text: 'Please enter a valid budget.' })
      return
    }

    setApprovalLoading((s) => ({ ...s, [proposal.id]: true }))
    try {
      const result = await sendProposalApprovalWebhook(
        proposal.id,
        proposal.title,
        Number(budget),
        proposal.submitted_by,
        {
          client: proposal.client,
          location: proposal.location,
          statusLabel: proposal.status_label,
          submittedAt: proposal.submitted_at,
        }
      )

      if (!result.success) {
        throw new Error(result.error || 'Failed to approve proposal')
      }

      onApproveProposal?.(proposal.id)
      setNotification({ type: 'success', text: `Proposal "${proposal.title}" approved with budget KES ${Number(budget).toLocaleString()}.` })
      setApprovalBudget((s) => {
        const updated = { ...s }
        delete updated[proposal.id]
        return updated
      })
      setExpandedApprovalId(null)
    } catch (error) {
      console.error('Approval error:', error)
      setNotification({ type: 'error', text: 'Failed to approve proposal. Please try again.' })
    } finally {
      setApprovalLoading((s) => ({ ...s, [proposal.id]: false }))
    }
  }

  const jobStatusColor = (status: 'approved' | 'pending') => {
    return status === 'approved'
      ? { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' }
      : { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' }
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 24, fontSize: 32, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' }}>
          Manage Proposals
        </h1>
        <p style={{ color: '#6b7280', margin: '0 0 24px', maxWidth: 680 }}>
          Review, approve, and allocate budgets to proposals. All approvals are synced to the workflow system.
        </p>

        {notification && (
          <div
            style={{
              marginBottom: 24,
              padding: '14px 18px',
              borderRadius: 14,
              background: notification.type === 'success' ? '#ecfdf3' : '#fef2f2',
              border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              color: notification.type === 'success' ? '#166534' : '#991b1b',
              fontSize: 13,
            }}
          >
            {notification.text}
          </div>
        )}

        {/* Proposals List with Approval Controls */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
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

          {!loading && proposals.length > 0 && (
            <div>
              {proposals.map((p, idx) => {
                const statusColors = jobStatusColor(p.status)
                const isApprovalExpanded = expandedApprovalId === p.id
                return (
                  <div key={p.id} style={{ borderBottom: idx < proposals.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div
                      style={{
                        padding: 20,
                        background: 'transparent',
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>{p.title}</h4>
                            {p.file_name && (
                              <span style={{ fontSize: 12, color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>
                                {p.file_name}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                            <span>
                              Job ID: <strong>{p.job_id ?? p.id}</strong>
                            </span>
                            <span>
                              Budget: <strong>KES {p.budget.toLocaleString()}</strong>
                            </span>
                            <span>
                              By: <strong>{p.submitted_by}</strong>
                            </span>
                            <span>Client: <strong>{p.client ?? '—'}</strong></span>
                            <span>Location: <strong>{p.location ?? '—'}</strong></span>
                            <span>Submitted: {new Date(p.submitted_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Job Status Badge */}
                        <div>
                          <div
                            style={{
                              background: statusColors.bg,
                              color: statusColors.color,
                              border: `1px solid ${statusColors.border}`,
                              padding: '6px 12px',
                              borderRadius: 6,
                              fontWeight: 700,
                              fontSize: 12,
                              whiteSpace: 'nowrap',
                              textAlign: 'center',
                            }}
                          >
                            {p.status === 'approved' ? '✓ Approved' : isDelayed(p) ? '⚠ Delayed' : '⏳ Pending'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approval Panel */}
                    {p.status === 'pending' && (
                      <div style={{ background: '#f9fafb', padding: '16px 20px', borderTop: '1px solid #e5e7eb' }}>
                        <button
                          onClick={() => setExpandedApprovalId(isApprovalExpanded ? null : p.id)}
                          style={{
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            padding: '12px 16px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#111',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f3f4f6'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fff'
                          }}
                        >
                          {isApprovalExpanded ? '−' : '+'} Approve & Set Budget
                        </button>

                        {isApprovalExpanded && (
                          <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                Approved Budget (KES)
                              </label>
                              <input
                                type="number"
                                placeholder="Enter budget"
                                value={approvalBudget[p.id] ?? ''}
                                onChange={(e) => setApprovalBudget((s) => ({ ...s, [p.id]: e.target.value }))}
                                style={{
                                  padding: '10px 12px',
                                  border: '1px solid #e0e0e0',
                                  borderRadius: 8,
                                  fontSize: 13,
                                  fontFamily: 'inherit',
                                  minWidth: 200,
                                }}
                              />
                            </div>
                            <Button
                              onClick={() => handleApproveProposal(p)}
                              style={{
                                whiteSpace: 'nowrap',
                                background: '#10b981',
                              }}
                              disabled={approvalLoading[p.id] || !approvalBudget[p.id]}
                            >
                              {approvalLoading[p.id] ? 'Approving...' : 'Approve & Sync'}
                            </Button>
                            {isDelayed(p) && (
                              <span style={{ fontSize: 12, color: '#b91c1c', fontWeight: 600 }}>⚠ This proposal is overdue for approval</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
