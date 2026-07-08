import { useEffect, useMemo, useState } from 'react'
import { getEventsData, getRecceData, subscribeData, addRecce, completeRecce, syncSheetDataToLocalStore, fetchPendingRecceCountFromWebhook } from '../../data'
import { StatusBadge, Card, PageHeader, Button, Modal, Field, Input, Textarea, Select, Spinner } from '../ui'
import { SectionTitle, StatCard } from '../common/PageSections'

function getEventDateTimestamp(value?: string) {
  if (!value) return Number.POSITIVE_INFINITY
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed
}

export function ReccePage() {
  const [showForm, setShowForm] = useState(false)
  const [events, setEvents] = useState(() => getEventsData())
  const [recces, setRecces] = useState(() => getRecceData())
  const [isLoading, setIsLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [formData, setFormData] = useState({
    event: '',
    venue: '',
    requestedBy: '',
    date: '',
    notes: '',
  })
  const [syncMessage, setSyncMessage] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const today = (() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })()

  useEffect(() => subscribeData(() => {
    setEvents(getEventsData())
    setRecces(getRecceData())
  }), [])

  // Refresh the webhook-backed pending-count whenever data notifies or on mount
  useEffect(() => {
    let mounted = true
    const refresh = async () => {
      try {
        const c = await fetchPendingRecceCountFromWebhook()
        if (mounted) setPendingCount(c)
      } catch {
        if (mounted) setPendingCount(0)
      }
    }
    refresh()
    const unsub = subscribeData(() => {
      void refresh()
    })
    return () => {
      mounted = false
      unsub()
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setIsLoading(true)
      try {
        const result = await syncSheetDataToLocalStore()
        if (!isMounted) return
        if (!result.ok) {
          setSyncMessage(`Sheet sync failed: ${result.error}`)
          return
        }
        setSyncMessage('Recce and event data synced from Google Sheets.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [])

  const pendingEvents = useMemo(() => {
    return [...events]
      .filter((event) => {
        const recceStatus = (event.recceDone ?? 'No').toString().trim().toLowerCase()
        return recceStatus === 'no' || recceStatus === ''
      })
      .sort((a, b) => getEventDateTimestamp(a.date) - getEventDateTimestamp(b.date))
      .map((event) => ({ ...event, _sortDate: getEventDateTimestamp(event.date) }))
  }, [events])

  useEffect(() => {
    if (!pendingEvents.length) {
      setFormData((prev) => ({ ...prev, event: '' }))
      return
    }

    const selectionStillValid = pendingEvents.some((event) => event.title === formData.event)
    if (!selectionStillValid) {
      setFormData((prev) => ({ ...prev, event: pendingEvents[0].title }))
    }
  }, [pendingEvents, formData.event])

  // Large-area loader / empty-state UI shown under the step/progress area
  const MainHero = () => {
    if (isLoading) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240, margin: '18px 0' }}>
        <Spinner />
      </div>
    )

    if (!isLoading && pendingCount === 0) return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240, margin: '18px 0', color: '#6b7280', flexDirection: 'column' }}>
        <div style={{ fontSize: 36, color: '#10b981', marginBottom: 8 }}>✅</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 6 }}>0 events ready for recce</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>You are up to date — no pending recce items.</div>
      </div>
    )

    return null
  }

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
      // update pending count after adding a recce
      void fetchPendingRecceCountFromWebhook().then((c) => setPendingCount(c))
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
    // optimistic refresh of pending count after completion
    void fetchPendingRecceCountFromWebhook().then((c) => setPendingCount(c))
  }

  return (
    <div className="animate-fade-in">
      <PageHeader section="Business Modules" title="Recce Requisition">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            title="Pending recces"
            style={{
              minWidth: 36,
              height: 28,
              borderRadius: 999,
              background: pendingCount > 0 ? '#ef4444' : '#10b981',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              padding: '0 10px',
            }}
          >
            {pendingCount}
          </div>
          <Button onClick={() => setShowForm(true)}>+ New Requisition</Button>
        </div>
      </PageHeader>

      {/* Main hero area: loader or zero-state placed under the header */}
      <MainHero />

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

      {isLoading && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4b5563' }}>Loading recce events…</span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Syncing from Google Sheets</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', animation: 'pulse 1.1s ease-in-out infinite' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <SectionTitle title="All Requisitions" subtitle={`${recces.length} records`} />
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
            <div style={{ marginBottom: 8, fontSize: 12, color: '#6b7280' }}>
              {pendingEvents.length > 0 ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Closest pending event: {pendingEvents[0].title}{pendingEvents[0].date ? ` • ${pendingEvents[0].date}` : ''}</span>
                    <span style={{ background: '#ef4444', color: '#fff', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{pendingCount}</span>
                  </span>
                ) : (
                  <span>No pending events are available right now.</span>
                )}
            </div>
            <Select
              value={formData.event}
              onChange={(e) => setFormData((prev) => ({ ...prev, event: e.target.value }))}
            >
              <option value="">Choose event…</option>
              {pendingEvents.map((event) => (
                <option key={event.id} value={event.title}>
                  {event.title}{event.date ? ` — ${event.date}` : ''}
                </option>
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
                min={today}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value < today ? today : e.target.value }))}
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
