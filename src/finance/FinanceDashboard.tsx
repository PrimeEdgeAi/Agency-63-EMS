import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FinanceSidebar } from './components/FinanceSidebar'
import { SettingsPage } from '../components/settings/SettingsPage'
import { FinanceExecutiveDashboard } from '../components/dashboard/RoleDashboards'
import { StatusBadge, PageHeader, Button, Card, Modal, Field, Input, Select } from '../components/ui'
import {
  getPayRequestsData,
  getRequisitionsData,
  subscribeData,
  syncSheetDataToLocalStore,
  approvePayRequest,
  rejectPayRequest,
  approveRequisition,
  rejectRequisition,
} from '../data'
import type { AppUser, PayRequest, RequisitionItem } from '../types'
import { logAuditEvent } from '../lib/audit'

const FINANCE_EMAIL = ['kennedymongaremirambo@gmail.com', 'emunene924@gmail.com']
const CASH_THRESHOLD = 100000

type FinancePage = 'overview' | 'pay-requests' | 'requisitions' | 'settings'

function getFinancePage(slug: string): FinancePage | null {
  const page = slug || 'overview'
  return ['overview', 'pay-requests', 'requisitions', 'settings'].includes(page)
    ? (page as FinancePage)
    : null
}

type ApprovalTarget = {
  type: 'pay' | 'req'
  id: string
  amount: number
  reference: string
}

export default function FinanceDashboard(props: { user: AppUser; onLogout?: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const pageSlug = location.pathname.replace(/^\/finance\/?/, '')
  const active = getFinancePage(pageSlug)
  const [payRequests, setPayRequests] = useState<PayRequest[]>(() => getPayRequestsData())
  const [requisitions, setRequisitions] = useState<RequisitionItem[]>(() => getRequisitionsData())
  const [approvalTarget, setApprovalTarget] = useState<ApprovalTarget | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'cheque'>('cash')
  const [transactionId, setTransactionId] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const unsubscribe = subscribeData(() => {
      setPayRequests(getPayRequestsData())
      setRequisitions(getRequisitionsData())
    })

    void syncSheetDataToLocalStore().then(() => {
      if (!isMounted) return
      setPayRequests(getPayRequestsData())
      setRequisitions(getRequisitionsData())
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
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
        void logAuditEvent({
          action: 'approve_pay_request',
          entity_type: 'pay_request',
          entity_id: approvalTarget.id,
          metadata: { paymentMethod, transactionId: transactionId.trim() || undefined },
        })
        setMessage({ type: 'success', text: `Pay request ${approvalTarget.reference} approved.` })
      } else {
        setMessage({ type: 'error', text: `Unable to approve pay request ${approvalTarget.reference}.` })
      }
    } else {
      const updated = approveRequisition(approvalTarget.id, paymentMethod, transactionId.trim() || undefined)
      if (updated) {
        void logAuditEvent({
          action: 'approve_requisition',
          entity_type: 'requisition',
          entity_id: approvalTarget.id,
          metadata: { paymentMethod, transactionId: transactionId.trim() || undefined },
        })
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
      void logAuditEvent({ action: 'reject_pay_request', entity_type: 'pay_request', entity_id: id })
      setMessage({ type: 'success', text: `Pay request ${reference} rejected.` })
    } else {
      rejectRequisition(id)
      void logAuditEvent({ action: 'reject_requisition', entity_type: 'requisition', entity_id: id })
      setMessage({ type: 'success', text: `Requisition ${reference} rejected.` })
    }
  }

  const pageTitle = active === 'overview' ? 'Finance Overview' : active === 'pay-requests' ? 'Pay Requests' : active === 'requisitions' ? 'Requisitions' : 'Finance Settings'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      <FinanceSidebar onLogout={props?.onLogout ?? (() => {})} />

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
            <FinanceExecutiveDashboard />
          )}

          {active === 'pay-requests' && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 22 }}>
                <Button variant="secondary" onClick={() => navigate('/finance/overview')}>Back to overview</Button>
                <Button onClick={() => navigate('/finance/requisitions')}>View requisitions</Button>
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
                <Button variant="secondary" onClick={() => navigate('/finance/overview')}>Back to overview</Button>
                <Button onClick={() => navigate('/finance/pay-requests')}>View pay requests</Button>
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
