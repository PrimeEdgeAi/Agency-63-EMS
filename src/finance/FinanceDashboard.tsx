import { useEffect, useMemo, useState } from 'react'
import { FinanceSidebar } from './components/FinanceSidebar'
import { SettingsPage } from '../components/settings/SettingsPage'
import { StatusBadge, PageHeader, Button, Card, Modal, Field, Input, Select } from '../components/ui'
import {
  getPayRequestsData,
  getRequisitionsData,
  subscribeData,
  approvePayRequest,
  rejectPayRequest,
  approveRequisition,
  rejectRequisition,
} from '../data'
import type { AppUser, PayRequest, RequisitionItem } from '../types'

const FINANCE_EMAIL = 'kennedymongaremirambo@gmail.com'
const CASH_THRESHOLD = 100000

type FinancePage = 'overview' | 'pay-requests' | 'requisitions' | 'settings'

type ApprovalTarget = {
  type: 'pay' | 'req'
  id: string
  amount: number
  reference: string
}

export default function FinanceDashboard(props: { user: AppUser; onLogout?: () => void }) {
  const [active, setActive] = useState<FinancePage>('overview')
  const [payRequests, setPayRequests] = useState<PayRequest[]>(() => getPayRequestsData())
  const [requisitions, setRequisitions] = useState<RequisitionItem[]>(() => getRequisitionsData())
  const [approvalTarget, setApprovalTarget] = useState<ApprovalTarget | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'cheque'>('cash')
  const [transactionId, setTransactionId] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    return subscribeData(() => {
      setPayRequests(getPayRequestsData())
      setRequisitions(getRequisitionsData())
    })
  }, [])

  useEffect(() => {
    if (!approvalTarget) return
    if (approvalTarget.amount > CASH_THRESHOLD) {
      setPaymentMethod('cheque')
    } else {
      setPaymentMethod('cash')
    }
    setTransactionId('')
    setError('')
  }, [approvalTarget])

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [message])

  const pendingPayRequests = payRequests.filter((request) => request.status === 'pending')
  const pendingRequisitions = requisitions.filter((request) => request.status === 'pending')

  const totalPendingAmount = useMemo(
    () => payRequests.reduce((sum, request) => (request.status === 'pending' ? sum + request.amount : sum), 0),
    [payRequests]
  )

  const totalRequisitionValue = useMemo(
    () => requisitions.reduce((sum, request) => (request.status === 'pending' ? sum + request.totalAmount : sum), 0),
    [requisitions]
  )

  const openApproval = (target: ApprovalTarget) => {
    setApprovalTarget(target)
  }

  const closeModal = () => {
    setApprovalTarget(null)
    setTransactionId('')
    setError('')
  }

  const handleApprove = () => {
    if (!approvalTarget) return
    if (approvalTarget.amount > CASH_THRESHOLD && paymentMethod === 'cheque' && !transactionId.trim()) {
      setError('A transaction ID is required for cheque approvals.')
      return
    }

    if (approvalTarget.type === 'pay') {
      const updated = approvePayRequest(approvalTarget.id, paymentMethod, transactionId.trim() || undefined)
      if (updated) {
        setMessage({ type: 'success', text: `Pay request ${approvalTarget.reference} approved.` })
      } else {
        setMessage({ type: 'error', text: `Unable to approve pay request ${approvalTarget.reference}.` })
      }
    } else {
      const updated = approveRequisition(approvalTarget.id, paymentMethod, transactionId.trim() || undefined)
      if (updated) {
        setMessage({ type: 'success', text: `Requisition ${approvalTarget.reference} approved.` })
      } else {
        setMessage({ type: 'error', text: `Unable to approve requisition ${approvalTarget.reference}.` })
      }
    }
    closeModal()
  }

  const handleReject = (type: 'pay' | 'req', id: string, reference: string) => {
    if (type === 'pay') {
      rejectPayRequest(id)
      setMessage({ type: 'success', text: `Pay request ${reference} rejected.` })
    } else {
      rejectRequisition(id)
      setMessage({ type: 'success', text: `Requisition ${reference} rejected.` })
    }
  }

  const pageTitle = active === 'overview' ? 'Finance Overview' : active === 'pay-requests' ? 'Pay Requests' : active === 'requisitions' ? 'Requisitions' : 'Finance Settings'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      <FinanceSidebar active={active} setActive={setActive} onLogout={props?.onLogout ?? (() => {})} />

      <main style={{ marginLeft: 280, flex: 1, padding: active === 'overview' ? 0 : 32, minHeight: '100vh' }}>
        <div style={{ padding: active === 'overview' ? '32px' : 0 }}>
          <PageHeader section="Finance" title={pageTitle}>
            <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'right' }}>
              {FINANCE_EMAIL}
            </div>
          </PageHeader>

          {message && (
            <div style={{ marginBottom: 24, padding: '14px 18px', borderRadius: 14, background: message.type === 'success' ? '#ecfdf3' : '#fef2f2', border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`, color: message.type === 'success' ? '#166534' : '#991b1b' }}>
              {message.text}
            </div>
          )}

          {active === 'overview' && (
            <div style={{ display: 'grid', gap: 24, paddingBottom: 32 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
                {[
                  { label: 'Pending Pay Requests', value: pendingPayRequests.length, bg: '#fff', color: '#111' },
                  { label: 'Pending Requisitions', value: pendingRequisitions.length, bg: '#fff', color: '#111' },
                  { label: 'Pending Payment Value', value: `KES ${totalPendingAmount.toLocaleString()}`, bg: '#f8fafc', color: '#1e3a8a' },
                  { label: 'Pending Requisition Value', value: `KES ${totalRequisitionValue.toLocaleString()}`, bg: '#f8fafc', color: '#1e3a8a' },
                ].map((card) => (
                  <Card key={card.label} style={{ padding: 24, background: card.bg, borderRadius: 18, border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: 12, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
                      {card.label}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>
                      {card.value}
                    </div>
                  </Card>
                ))}
              </div>

              <Card style={{ padding: 24, borderRadius: 18, border: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700, marginBottom: 16 }}>Finance Approval Rules</h2>
                <div style={{ display: 'grid', gap: 12, color: '#475569', fontSize: 14, lineHeight: 1.7 }}>
                  <p>Finance team members can approve pay claims and requisitions from this dashboard.</p>
                  <p>Amounts up to KES 100,000 may be paid in cash.</p>
                  <p>Amounts above KES 100,000 require cheque payment and a transaction ID.</p>
                  <p>All approvals are logged to <strong>{FINANCE_EMAIL}</strong>.</p>
                </div>
              </Card>
            </div>
          )}

          {active === 'pay-requests' && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 22 }}>
                <Button variant="secondary" onClick={() => setActive('overview')}>Back to overview</Button>
                <Button onClick={() => setActive('requisitions')}>View requisitions</Button>
              </div>
              <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      {['ID', 'Event', 'Vendor', 'Amount', 'Date', 'Status', 'Payment', 'Txn ID', 'Actions'].map((h) => (
                        <th key={h} style={{ padding: '14px 18px', fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'left' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payRequests.map((request, idx) => (
                      <tr key={request.id} style={{ borderBottom: idx < payRequests.length - 1 ? '1px solid #f7f7f7' : 'none' }}>
                        <td style={{ padding: '14px 18px', fontSize: 12 }}>{request.id}</td>
                        <td style={{ padding: '14px 18px', fontSize: 12 }}>{request.event}</td>
                        <td style={{ padding: '14px 18px', fontSize: 12 }}>{request.vendor}</td>
                        <td style={{ padding: '14px 18px', fontSize: 12, fontWeight: 700 }}>KES {request.amount.toLocaleString()}</td>
                        <td style={{ padding: '14px 18px', fontSize: 12 }}>{request.date}</td>
                        <td style={{ padding: '14px 18px' }}><StatusBadge status={request.status} /></td>
                        <td style={{ padding: '14px 18px', fontSize: 12 }}>{request.paymentMethod ?? '—'}</td>
                        <td style={{ padding: '14px 18px', fontSize: 12 }}>{request.transactionId ?? '—'}</td>
                        <td style={{ padding: '14px 18px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {request.status === 'pending' ? (
                            <>
                              <Button variant="secondary" style={{ minWidth: 90 }} onClick={() => openApproval({ type: 'pay', id: request.id, amount: request.amount, reference: request.id })}>
                                Approve
                              </Button>
                              <Button variant="ghost" style={{ minWidth: 90 }} onClick={() => handleReject('pay', request.id, request.id)}>
                                Reject
                              </Button>
                            </>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: 12 }}>No actions</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {active === 'requisitions' && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 22 }}>
                <Button variant="secondary" onClick={() => setActive('overview')}>Back to overview</Button>
                <Button onClick={() => setActive('pay-requests')}>View pay requests</Button>
              </div>
              <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      {['ID', 'Client', 'Requester', 'Amount', 'Urgency', 'Status', 'Payment', 'Txn ID', 'Actions'].map((h) => (
                        <th key={h} style={{ padding: '14px 18px', fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'left' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {requisitions.map((request, idx) => (
                      <tr key={request.id} style={{ borderBottom: idx < requisitions.length - 1 ? '1px solid #f7f7f7' : 'none' }}>
                        <td style={{ padding: '14px 18px', fontSize: 12 }}>{request.id}</td>
                        <td style={{ padding: '14px 18px', fontSize: 12 }}>{request.client}</td>
                        <td style={{ padding: '14px 18px', fontSize: 12 }}>{request.requestorName}</td>
                        <td style={{ padding: '14px 18px', fontSize: 12, fontWeight: 700 }}>KES {request.totalAmount.toLocaleString()}</td>
                        <td style={{ padding: '14px 18px', fontSize: 12 }}>{request.urgency}</td>
                        <td style={{ padding: '14px 18px' }}><StatusBadge status={request.status} /></td>
                        <td style={{ padding: '14px 18px', fontSize: 12 }}>{request.paymentMethod ?? '—'}</td>
                        <td style={{ padding: '14px 18px', fontSize: 12 }}>{request.transactionId ?? '—'}</td>
                        <td style={{ padding: '14px 18px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {request.status === 'pending' ? (
                            <>
                              <Button variant="secondary" style={{ minWidth: 90 }} onClick={() => openApproval({ type: 'req', id: request.id, amount: request.totalAmount, reference: request.id })}>
                                Approve
                              </Button>
                              <Button variant="ghost" style={{ minWidth: 90 }} onClick={() => handleReject('req', request.id, request.id)}>
                                Reject
                              </Button>
                            </>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: 12 }}>No actions</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {active === 'settings' && <SettingsPage user={props.user} />}
        </div>

        {approvalTarget && (
          <Modal title={`Approve ${approvalTarget.reference}`} onClose={closeModal} width={520}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ fontSize: 13, color: '#475569' }}>
                {approvalTarget.amount > CASH_THRESHOLD
                  ? 'Amounts above KES 100,000 require cheque payment and a transaction ID.'
                  : 'Amounts up to KES 100,000 may be paid in cash. If you choose cheque, provide a transaction ID.'}
              </div>
              <Field label="Payment method">
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'cheque')}>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </Select>
              </Field>
              {paymentMethod === 'cheque' && (
                <Field label="Transaction ID">
                  <Input
                    value={transactionId}
                    placeholder="Enter cheque/transaction ID"
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </Field>
              )}
              {error && <div style={{ color: '#b91c1c', fontSize: 13 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button onClick={handleApprove}>Confirm Approval</Button>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </div>
  )
}
