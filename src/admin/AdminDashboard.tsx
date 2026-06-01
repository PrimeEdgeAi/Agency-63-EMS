import { useEffect, useState } from 'react'
import { Button } from '../components/ui'
import { supabase } from '../lib/supabase'

type Proposal = {
  id: string
  title: string
  budget: number
  submitted_by: string
  submitted_at: string // ISO
  file_name?: string | null
  status: 'pending' | 'approved'
  approved_at?: string | null
  last_reminder_at?: string | null
}

const REMINDER_WEBHOOK = (import.meta.env.VITE_REMINDER_WEBHOOK_URL as string) || '' // configure in env
const ADMIN_EMAIL = 'kevin.n.mongare@gmail.com'

function nowIso() { return new Date().toISOString() }

export function AdminDashboard() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [title, setTitle] = useState('')
  const [budget, setBudget] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  async function loadProposals() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('proposals').select('*').order('submitted_at', { ascending: false })
      if (error) throw error
      setProposals((data || []) as Proposal[])
    } catch (e: any) {
      console.error('Load proposals error', e.message || e)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const email = sessionData?.session?.user?.email ?? ''
        if (email !== ADMIN_EMAIL) {
          setAccessDenied(true)
          return
        }
        await loadProposals()
      } catch (e) {
        console.error(e)
      }
    }
    init()
  }, [])

  async function addProposal() {
    if (!title.trim() || !budget) return
    try {
      const payload = {
        title: title.trim(),
        budget: parseFloat(budget),
        submitted_by: ADMIN_EMAIL,
        submitted_at: nowIso(),
        file_name: fileName || null,
        status: 'pending',
      }
      const { data, error } = await supabase.from('proposals').insert(payload).select().single()
      if (error) throw error
      setProposals((s) => [data as Proposal, ...s])
      setTitle(''); setBudget(''); setFileName('')
    } catch (e: any) {
      console.error('Add proposal error', e.message || e)
      alert('Failed to add proposal')
    }
  }

  async function approve(id: string) {
    try {
      const { data, error } = await supabase.from('proposals').update({ status: 'approved', approved_at: nowIso() }).eq('id', id).select().single()
      if (error) throw error
      setProposals((s) => s.map(p => p.id === id ? (data as Proposal) : p))
    } catch (e: any) {
      console.error('Approve error', e.message || e)
      alert('Failed to approve')
    }
  }

  async function sendReminder(id: string) {
    try {
      const p = proposals.find(x => x.id === id)
      if (!p) return
      // call external webhook to trigger email / reminder
      if (REMINDER_WEBHOOK) {
        await fetch(REMINDER_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proposalId: id, title: p.title, budget: p.budget, submitted_by: p.submitted_by }),
        })
      }
      const { data, error } = await supabase.from('proposals').update({ last_reminder_at: nowIso() }).eq('id', id).select().single()
      if (error) throw error
      setProposals((s) => s.map(pp => pp.id === id ? (data as Proposal) : pp))
      alert('Reminder sent')
    } catch (e: any) {
      console.error('Reminder error', e.message || e)
      alert('Failed to send reminder')
    }
  }

  function isDelayed(p: Proposal) {
    if (p.status === 'approved') return false
    const submitted = new Date(p.submitted_at).getTime()
    return Date.now() - submitted > 72 * 3600 * 1000
  }

  if (accessDenied) return (
    <div style={{ padding: 24 }}>
      <h2>Access Denied</h2>
      <div>You are not authorized to view this page.</div>
    </div>
  )

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
        {loading && <div style={{ color: '#6b7280' }}>Loading…</div>}
        {!loading && proposals.length === 0 && <div style={{ color: '#6b7280' }}>No proposals yet</div>}
        {proposals.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #f3f4f6' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{p.title} <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{p.file_name ?? ''}</span></div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Budget: KES {p.budget.toLocaleString()} · Submitted: {new Date(p.submitted_at).toLocaleString()}</div>
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
