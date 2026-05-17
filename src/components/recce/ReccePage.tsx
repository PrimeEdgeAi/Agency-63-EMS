import { useState } from 'react'
import { RECCE_DATA, EVENTS_DATA } from '../../data'
import { StatusBadge, Card, PageHeader, Button, Modal, Field, Input, Textarea, Select } from '../ui'

export function ReccePage() {
  const [showForm, setShowForm] = useState(false)

  const stats = [
    { label: 'Total Recces',  value: RECCE_DATA.length,                                    icon: '⊕' },
    { label: 'Approved',      value: RECCE_DATA.filter((r) => r.status === 'approved').length, icon: '✓' },
    { label: 'Completed',     value: RECCE_DATA.filter((r) => r.status === 'completed').length, icon: '◈' },
    { label: 'Pending',       value: RECCE_DATA.filter((r) => r.status === 'pending').length,  icon: '⏳' },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader section="Business Modules" title="Recce Requisition">
        <Button onClick={() => setShowForm(true)}>+ New Requisition</Button>
      </PageHeader>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map((s) => (
          <Card key={s.label} style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#111', letterSpacing: -1, marginBottom: 4 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: '#aaa', letterSpacing: 0.3 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <div
          style={{
            padding: '20px 28px 16px',
            borderBottom: '1px solid #f7f7f7',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111' }}>All Requisitions</h3>
          <span style={{ fontSize: 12, color: '#ccc' }}>{RECCE_DATA.length} records</span>
        </div>

        {RECCE_DATA.map((r, i) => (
          <div
            key={r.id}
            style={{
              padding: '20px 28px',
              borderBottom: i < RECCE_DATA.length - 1 ? '1px solid #fafafa' : 'none',
              display: 'grid',
              gridTemplateColumns: '44px 1fr auto 80px',
              gap: 16,
              alignItems: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: '#f7f7f7',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              ⊕
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 3 }}>{r.venue}</div>
              <div style={{ fontSize: 12, color: '#aaa' }}>
                {r.event} · By {r.requestedBy} · {r.date}
              </div>
              {r.notes && (
                <div style={{ fontSize: 11, color: '#bbb', marginTop: 4, fontStyle: 'italic' }}>
                  {r.notes}
                </div>
              )}
            </div>
            <StatusBadge status={r.status} />
            <span style={{ fontSize: 11, color: '#ccc', fontWeight: 700, textAlign: 'right' }}>{r.id}</span>
          </div>
        ))}
      </Card>

      {showForm && (
        <Modal title="New Recce Requisition" onClose={() => setShowForm(false)} width={520}>
          <Field label="Select Event">
            <Select>
              <option value="">Choose event…</option>
              {EVENTS_DATA.map((e) => <option key={e.id}>{e.title}</option>)}
            </Select>
          </Field>
          <Field label="Venue Name">
            <Input placeholder="e.g. KICC Main Hall" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Recce Date">
              <Input type="date" />
            </Field>
            <Field label="Requested By">
              <Input placeholder="Full name" />
            </Field>
          </div>
          <Field label="Purpose / Notes">
            <Textarea rows={3} placeholder="Describe what needs to be inspected…" />
          </Field>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Button variant="secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" style={{ flex: 2 }} onClick={() => setShowForm(false)}>Submit Requisition</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
