import { useEffect, useState } from 'react'
import { getEventsData, getRecceData, subscribeData, addRecce, completeRecce, syncSheetDataToLocalStore } from '../../data'
import { StatusBadge, Card, PageHeader, Button, Modal, Field, Input, Textarea, Select } from '../ui'

export function ReccePage() {
  const [showForm, setShowForm] = useState(false)
  const [events, setEvents] = useState(() => getEventsData())
  const [recces, setRecces] = useState(() => getRecceData())
  const [formData, setFormData] = useState({
    event: events[0]?.title ?? '',
    venue: '',
    requestedBy: '',
    date: '',
    notes: '',
  })
  const [syncMessage, setSyncMessage] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeData(() => {
      setEvents(getEventsData())
      setRecces(getRecceData())
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const load = async () => {
      const result = await syncSheetDataToLocalStore()
      if (!result.ok) {
        setSyncMessage(`Sheet sync failed: ${result.error}`)
        return
      }
      setSyncMessage('Recce and event data synced from Google Sheets.')
    }
    load()
  }, [])

  const stats = [
    { label: 'Total Recces', value: recces.length, icon: '⊕' },
    { label: 'Approved', value: recces.filter((r) => r.status === 'approved').length, icon: '✓' },
    { label: 'Completed', value: recces.filter((r) => r.status === 'completed').length, icon: '◈' },
    { label: 'Pending', value: recces.filter((r) => r.status === 'pending').length, icon: '⏳' },
  ]

  const handleSubmit = async () => {
    if (!formData.event || !formData.venue || !formData.requestedBy || !formData.date) {
      alert('Please complete the recce request form before submitting.')
      return
    }

    const result = await addRecce({
      event: formData.event,
      venue: formData.venue,
      requestedBy: formData.requestedBy,
      date: formData.date,
      notes: formData.notes,
    })

    if (result.ok) {
      setToast({ type: 'success', message: 'Recce submitted and synced successfully.' })
    } else {
      setToast({ type: 'error', message: result.error ?? 'Recce was saved locally but failed to sync.' })
    }

    setFormData({
      event: events[0]?.title ?? '',
      venue: '',
      requestedBy: '',
      date: '',
      notes: '',
    })
    setShowForm(false)
  }

  const handleComplete = (id: string) => {
    completeRecce(id)
  }

  return (
    <div className="animate-fade-in">
      <PageHeader section="Business Modules" title="Recce Requisition">
        <Button onClick={() => setShowForm(true)}>+ New Requisition</Button>
      </PageHeader>

      {toast && (
        <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 12, background: toast.type === 'success' ? '#ecfdf3' : '#fef2f2', border: `1px solid ${toast.type === 'success' ? '#a7f3d0' : '#fecaca'}`, color: toast.type === 'success' ? '#166534' : '#991b1b' }}>
          {toast.message}
        </div>
      )}

      {syncMessage && (
        <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 14, background: '#eef2ff', border: '1px solid #c7d2fe', color: '#1e3a8a' }}>
          {syncMessage}
        </div>
      )}

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
          <span style={{ fontSize: 12, color: '#ccc' }}>{recces.length} records</span>
        </div>

        {recces.map((r, i) => (
          <div
            key={r.id}
            style={{
              padding: '20px 28px',
              borderBottom: i < recces.length - 1 ? '1px solid #fafafa' : 'none',
              display: 'grid',
              gridTemplateColumns: '44px 1fr auto 140px',
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
              <StatusBadge status={r.status} />
              {r.status === 'pending' ? (
                <Button variant="secondary" style={{ padding: '8px 12px', fontSize: 12 }} onClick={() => handleComplete(r.id)}>
                  Mark Completed
                </Button>
              ) : r.status === 'completed' ? (
                <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'right' }}>
                  Awaiting manager approval
                </div>
              ) : null}
            </div>
            <span style={{ fontSize: 11, color: '#ccc', fontWeight: 700, textAlign: 'right' }}>{r.id}</span>
          </div>
        ))}
      </Card>

      {showForm && (
        <Modal title="New Recce Requisition" onClose={() => setShowForm(false)} width={520}>
          <Field label="Select Event">
            <Select
              value={formData.event}
              onChange={(e) => setFormData((prev) => ({ ...prev, event: e.target.value }))}
            >
              <option value="">Choose event…</option>
              {events
                .filter((e) => e.recceDone?.toLowerCase() !== 'yes')
                .map((e) => (
                  <option key={e.id} value={e.title}>{e.title}</option>
                ))}
            </Select>
          </Field>
          <Field label="Venue Name">
            <Input
              value={formData.venue}
              placeholder="e.g. KICC Main Hall"
              onChange={(e) => setFormData((prev) => ({ ...prev, venue: e.target.value }))}
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Recce Date">
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              />
            </Field>
            <Field label="Requested By">
              <Input
                value={formData.requestedBy}
                placeholder="Full name"
                onChange={(e) => setFormData((prev) => ({ ...prev, requestedBy: e.target.value }))}
              />
            </Field>
          </div>
          <Field label="Purpose / Notes">
            <Textarea
              rows={3}
              placeholder="Describe what needs to be inspected…"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </Field>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Button variant="secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" style={{ flex: 2 }} onClick={handleSubmit}>Submit Requisition</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
