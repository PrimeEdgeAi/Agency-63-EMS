import { useEffect, useState } from 'react'
import { Button } from '../ui'

type Proposal = {
  id: string
  title: string
  budget: number
  submittedBy: string
  submittedAt: string // ISO
  fileName?: string
  status: 'pending' | 'approved'
  approvedAt?: string
  lastReminderAt?: string
}

const LS_KEY = 'admin:proposals'

function nowIso() { return new Date().toISOString() }

export function AdminDashboard() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [title, setTitle] = useState('')
  const [budget, setBudget] = useState('')
  const [fileName, setFileName] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) setProposals(JSON.parse(raw))
  }, [])

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(proposals))
  }, [proposals])

  function addProposal() {
    if (!title.trim() || !budget) return
    const p: Proposal = {
      id: 'P-' + Date.now().toString(36).toUpperCase(),
      title: title.trim(),
      budget: parseFloat(budget),
      submittedBy: 'Admin',
      submittedAt: nowIso(),
      fileName: fileName || undefined,
      status: 'pending',
    }
    setProposals((s) => [p, ...s])
    setTitle(''); setBudget(''); setFileName('')
  }

  function approve(id: string) {
    setProposals((s) => s.map(p => p.id === id ? { ...p, status: 'approved', approvedAt: nowIso() } : p))
  }

  function sendReminder(id: string) {
    setProposals((s) => s.map(p => p.id === id ? { ...p, lastReminderAt: nowIso() } : p))
    // In a real app we'd call an API / send email here
    alert('Reminder sent to proposal owner (simulated)')
  }

  function isDelayed(p: Proposal) {
    if (p.status === 'approved') return false
    const submitted = new Date(p.submittedAt).getTime()
    return Date.now() - submitted > 72 * 3600 * 1000
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Admin Dashboard</h2>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <input placeholder="Proposal title" value={title} onChange={e => setTitle(e.target.value)} style={{ padding: 8, flex: 1 }} />
        <input placeholder="Budget" value={budget} onChange={e => setBudget(e.target.value)} style={{ padding: 8, width: 140 }} />
        <input placeholder="File name (optional)" value={fileName} onChange={e => setFileName(e.target.value)} style={{ padding: 8, width: 220 }} />
        <Button onClick={addProposal}>Upload</Button>
      </div>

      <div style={{ border: '1px solid #eef2ff', borderRadius: 8, padding: 12 }}>
        {proposals.length === 0 && <div style={{ color: '#6b7280' }}>No proposals yet</div>}
        {proposals.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #f3f4f6' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{p.title} <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{p.fileName ?? ''}</span></div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Budget: KES {p.budget.toLocaleString()} · Submitted: {new Date(p.submittedAt).toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {p.status === 'approved' ? (
                <div style={{ background: '#ecfdf5', color: '#166534', padding: '6px 10px', borderRadius: 6, fontWeight: 700 }}>Approved</div>
              ) : isDelayed(p) ? (
                <div style={{ background: '#fff1f2', color: '#991b1b', padding: '6px 10px', borderRadius: 6, fontWeight: 700 }}>Delayed</div>
              ) : (
                <div style={{ background: '#f8fafc', color: '#374151', padding: '6px 10px', borderRadius: 6, fontWeight: 700 }}>Pending</div>
              )}

              {p.status !== 'approved' && <Button onClick={() => approve(p.id)}>Mark Approved</Button>}
              {isDelayed(p) && <Button onClick={() => sendReminder(p.id)}>Send Reminder</Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard
