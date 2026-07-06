import { useState } from 'react'
import { Modal, Field, Input, Textarea, Select, Button } from '../../../ui'


interface NewEventModalProps {
  onClose: () => void
}

export function NewEventModal({ onClose }: NewEventModalProps) {
  const [form, setForm] = useState({
    title: '', location: '', date: '', attendees: '', budget: '', category: '', story: '',
  })

  const categories = ['Tech', 'Corporate', 'Retreat', 'Launch', 'Community', 'Training', 'Strategy', 'Forum']
  const today = new Date().toISOString().split('T')[0]

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setForm((f) => ({ ...f, date: value && value < today ? today : value }))
  }

  return (
    <Modal title="New Event" onClose={onClose} width={580}>
      <Field label="Event Title">
        <Input value={form.title} onChange={set('title')} placeholder="e.g. Nairobi Innovation Summit" />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Location">
          <Input value={form.location} onChange={set('location')} placeholder="Venue, City" />
        </Field>
        <Field label="Date">
          <Input type="date" value={form.date} onChange={handleDateChange} min={today} />
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Expected Attendees">
          <Input type="number" value={form.attendees} onChange={set('attendees')} placeholder="0" />
        </Field>
        <Field label="Budget (KES)">
          <Input type="number" value={form.budget} onChange={set('budget')} placeholder="0" />
        </Field>
      </div>
      <Field label="Category">
        <Select value={form.category} onChange={set('category')}>
          <option value="">Select category…</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </Select>
      </Field>
      <Field label="Event Story">
        <Textarea
          rows={4}
          value={form.story}
          onChange={set('story')}
          placeholder="Describe the vision and purpose of this event…"
        />
      </Field>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <Button variant="secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</Button>
        <Button variant="primary" style={{ flex: 2 }} onClick={onClose}>Create Event</Button>
      </div>
    </Modal>
  )
}
