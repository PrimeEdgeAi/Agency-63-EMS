import { useState } from 'react'
import { PAY_REQUESTS, EVENTS_DATA } from '../../data'
import { StatusBadge, Card, PageHeader, FilterPills, Button, Modal, Field, Input, Textarea, Select } from '../ui'


const FILTER_OPTIONS = ['all', 'pending', 'approved', 'review', 'rejected']

export function PayRequestPage() {
  const [filter,   setFilter]   = useState('all')
  const [showForm, setShowForm] = useState(false)

  const filtered =
    filter === 'all' ? PAY_REQUESTS : PAY_REQUESTS.filter((p) => p.status === filter)

  const totalPending  = PAY_REQUESTS.filter((p) => p.status === 'pending').reduce((a, b) => a + b.amount, 0)
  const totalApproved = PAY_REQUESTS.filter((p) => p.status === 'approved').reduce((a, b) => a + b.amount, 0)

  const summary = [
    { label: 'Total Requests',   value: PAY_REQUESTS.length,                                      bg: '#f7f7f7', color: '#111' },
    { label: 'Pending Approval', value: PAY_REQUESTS.filter((p) => p.status === 'pending').length, bg: '#fff7ed', color: '#c2410c' },
    { label: 'Pending Amount',   value: `KES ${(totalPending  / 1000).toFixed(0)}K`,              bg: '#fff7ed', color: '#c2410c' },
    { label: 'Approved Amount',  value: `KES ${(totalApproved / 1000).toFixed(0)}K`,              bg: '#f0fdf4', color: '#15803d' },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader section="Finance" title="Pay Requests">
        <Button onClick={() => setShowForm(true)}>+ New Request</Button>
      </PageHeader>

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
            <Select>
              <option value="">Choose event…</option>
              {EVENTS_DATA.map((e) => <option key={e.id}>{e.title}</option>)}
            </Select>
          </Field>
          <Field label="Vendor Name">
            <Input placeholder="e.g. AV Solutions Ltd" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Category">
              <Select>
                <option value="">Category…</option>
                {['Equipment', 'Catering', 'Venue', 'Design', 'Print', 'Transport', 'Security', 'Other'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Amount (KES)">
              <Input type="number" placeholder="0" />
            </Field>
          </div>
          <Field label="Payment Date">
            <Input type="date" />
          </Field>
          <Field label="Description">
            <Textarea rows={3} placeholder="Purpose of this payment…" />
          </Field>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Button variant="secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" style={{ flex: 2 }} onClick={() => setShowForm(false)}>Submit Request</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
