import { useEffect, useState } from 'react'
import { getEventsData, getPayRequestsData, subscribeData, addPayRequest, submitPayRequestWorkflow } from '../../data'
import { logAuditEvent } from '../../lib/audit'
import { StatusBadge, Card, PageHeader, FilterPills, Button, Modal, Field, Input, Textarea, Select } from '../ui'

const FILTER_OPTIONS = ['all', 'pending', 'approved', 'review', 'rejected']

export function PayRequestPage() {
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [payRequests, setPayRequests] = useState(() => getPayRequestsData())
  const [events, setEvents] = useState(() => getEventsData())
  const [selectedEvent, setSelectedEvent] = useState('')
  const [vendor, setVendor] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return subscribeData(() => {
      setPayRequests(getPayRequestsData())
      setEvents(getEventsData())
    })
  }, [])

  const resetForm = () => {
    setSelectedEvent('')
    setVendor('')
    setCategory('')
    setAmount('')
    setDate('')
    setDescription('')
  }

  const handleSubmit = async () => {
    setMessage('')
    if (!selectedEvent || !vendor.trim() || !category || !amount || !date) {
      setMessage('Please complete all required fields.')
      return
    }

    setIsSubmitting(true)
    try {
      const newRequest = addPayRequest({
        event: selectedEvent,
        vendor: vendor.trim(),
        amount: Number(amount),
        status: 'pending',
        date,
        category,
      })

      const sheetResult = await submitPayRequestWorkflow(newRequest)
      void logAuditEvent({
        action: 'submit_pay_request',
        entity_type: 'pay_request',
        entity_id: newRequest.id,
        metadata: { vendor: newRequest.vendor, amount: newRequest.amount, event: newRequest.event },
      })
      setMessage(
        sheetResult.ok
          ? 'Pay request saved and Google Sheets sync attempted.'
          : `Pay request saved. Google Sheets sync failed: ${sheetResult.error}`
      )
      resetForm()
      setShowForm(false)
    } catch (error) {
      setMessage('Unable to save pay request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = filter === 'all' ? payRequests : payRequests.filter((p) => p.status === filter)

  const totalPending = payRequests.filter((p) => p.status === 'pending').reduce((a, b) => a + b.amount, 0)
  const totalApproved = payRequests.filter((p) => p.status === 'approved').reduce((a, b) => a + b.amount, 0)

  const summary = [
    { label: 'Total Requests', value: payRequests.length, bg: '#f7f7f7', color: '#111' },
    { label: 'Pending Approval', value: payRequests.filter((p) => p.status === 'pending').length, bg: '#fff7ed', color: '#c2410c' },
    { label: 'Pending Amount', value: `KES ${(totalPending / 1000).toFixed(0)}K`, bg: '#fff7ed', color: '#c2410c' },
    { label: 'Approved Amount', value: `KES ${(totalApproved / 1000).toFixed(0)}K`, bg: '#f0fdf4', color: '#15803d' },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader section="Finance" title="Pay Requests">
        <Button onClick={() => setShowForm(true)}>+ New Request</Button>
      </PageHeader>

      {message && (
        <div style={{ marginBottom: 24, padding: '14px 18px', borderRadius: 14, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}>
          {message}
        </div>
      )}

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        {summary.map((s) => (
          <div
            key={s.label}
            style={{
              background: s.bg,
              border: '1px solid #f0f0f0',
              borderRadius: 14,
              padding: '20px 22px',
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: -1, marginBottom: 4 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: '#aaa', letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <FilterPills options={FILTER_OPTIONS} active={filter} onChange={setFilter} />

      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              {['ID', 'Event', 'Vendor', 'Category', 'Amount', 'Date', 'Status', 'Actions'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '13px 18px',
                    textAlign: 'left',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#ccc',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((pr, i) => (
              <tr
                key={pr.id}
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid #fafafa' : 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '13px 18px', fontSize: 11, fontWeight: 700, color: '#bbb' }}>{pr.id}</td>
                <td style={{ padding: '13px 18px', maxWidth: 160 }}>
                  <div style={{ fontSize: 12, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {pr.event}
                  </div>
                </td>
                <td style={{ padding: '13px 18px', fontSize: 13, color: '#555', whiteSpace: 'nowrap' }}>{pr.vendor}</td>
                <td style={{ padding: '13px 18px', fontSize: 11, color: '#aaa' }}>{pr.category}</td>
                <td style={{ padding: '13px 18px', fontSize: 13, fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>
                  KES {pr.amount.toLocaleString()}
                </td>
                <td style={{ padding: '13px 18px', fontSize: 11, color: '#bbb', whiteSpace: 'nowrap' }}>{pr.date}</td>
                <td style={{ padding: '13px 18px' }}><StatusBadge status={pr.status} /></td>
                <td style={{ padding: '13px 18px' }}>
                  {pr.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        style={{
                          padding: '5px 10px',
                          background: '#f0fdf4',
                          color: '#15803d',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 11,
                          cursor: 'pointer',
                          fontFamily: 'Georgia, serif',
                          fontWeight: 600,
                        }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        style={{
                          padding: '5px 10px',
                          background: '#fff1f2',
                          color: '#be123c',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 11,
                          cursor: 'pointer',
                          fontFamily: 'Georgia, serif',
                          fontWeight: 600,
                        }}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: '#ddd' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {showForm && (
        <Modal title="New Pay Request" onClose={() => setShowForm(false)} width={540}>
          <Field label="Select Event">
            <Select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
              <option value="">Choose event…</option>
              {events.map((e) => (
                <option key={e.id} value={e.title}>{e.title}</option>
              ))}
            </Select>
          </Field>
          <Field label="Vendor Name">
            <Input
              value={vendor}
              placeholder="e.g. AV Solutions Ltd"
              onChange={(e) => setVendor(e.target.value)}
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Category…</option>
                {['Equipment', 'Catering', 'Venue', 'Design', 'Print', 'Transport', 'Security', 'Other'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Amount (KES)">
              <Input
                type="number"
                value={amount}
                placeholder="0"
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Payment Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Description">
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Purpose of this payment…"
            />
          </Field>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Button variant="secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit Request'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
