import { useEffect, useState } from 'react'
import { Button } from '../components/ui'
import { AdminSidebar } from '../components/layout/AdminSidebar'
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

type AdminPage = 'proposals' | 'settings'

export function AdminDashboard(props?: { onLogout?: () => void }) {
  const [active, setActive] = useState<AdminPage>('proposals')
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
    <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <div>You are not authorized to view this page.</div>
      </div>
    </div>
  )

  const handleLogout = () => {
    if (props?.onLogout) {
      props.onLogout()
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      <AdminSidebar active={active} setActive={(page) => setActive(page as AdminPage)} onLogout={handleLogout} />
      
      <main style={{
        marginLeft: 280,
        flex: 1,
        padding: 32,
        minHeight: '100vh',
      }}>
        <PageContent active={active} proposals={proposals} loading={loading} title={title} setTitle={setTitle} budget={budget} setBudget={setBudget} fileName={fileName} setFileName={setFileName} onAddProposal={addProposal} onApprove={approve} onSendReminder={sendReminder} isDelayed={isDelayed} />
      </main>
    </div>
  )
}

function PageContent({ active, proposals, loading, title, setTitle, budget, setBudget, fileName, setFileName, onAddProposal, onApprove, onSendReminder, isDelayed }: any) {
  if (active === 'proposals') {
    return (
      <div>
        <h1 style={{ marginBottom: 24, fontSize: 28, fontWeight: 700, color: '#111' }}>Proposals</h1>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, background: 'white', padding: 20, borderRadius: 12 }}>
          <input placeholder="Proposal title" value={title} onChange={e => setTitle(e.target.value)} style={{ padding: 10, flex: 1, border: '1px solid #e0e0e0', borderRadius: 8 }} />
          <input placeholder="Budget" value={budget} onChange={e => setBudget(e.target.value)} style={{ padding: 10, width: 140, border: '1px solid #e0e0e0', borderRadius: 8 }} />
          <input placeholder="File name (optional)" value={fileName} onChange={e => setFileName(e.target.value)} style={{ padding: 10, width: 220, border: '1px solid #e0e0e0', borderRadius: 8 }} />
          <Button onClick={onAddProposal}>Upload</Button>
        </div>

        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #eef2ff', overflow: 'hidden' }}>
          {loading && <div style={{ color: '#6b7280', padding: 24 }}>Loading…</div>}
          {!loading && proposals.length === 0 && <div style={{ color: '#6b7280', padding: 24 }}>No proposals yet</div>}
          {proposals.map((p: any) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{p.title} <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{p.file_name ?? ''}</span></div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>Budget: KES {p.budget.toLocaleString()} · Submitted: {new Date(p.submitted_at).toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {p.status === 'approved' ? (
                  <div style={{ background: '#ecfdf5', color: '#166534', padding: '6px 12px', borderRadius: 6, fontWeight: 700, fontSize: 12 }}>Approved</div>
                ) : isDelayed(p) ? (
                  <div style={{ background: '#fff1f2', color: '#991b1b', padding: '6px 12px', borderRadius: 6, fontWeight: 700, fontSize: 12 }}>Delayed</div>
                ) : (
                  <div style={{ background: '#f8fafc', color: '#374151', padding: '6px 12px', borderRadius: 6, fontWeight: 700, fontSize: 12 }}>Pending</div>
                )}

                {p.status !== 'approved' && <Button onClick={() => onApprove(p.id)}>Mark Approved</Button>}
                {isDelayed(p) && <Button onClick={() => onSendReminder(p.id)}>Send Reminder</Button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (active === 'settings') {
    return (
      <div>
        <h1 style={{ marginBottom: 24, fontSize: 28, fontWeight: 700, color: '#111' }}>Settings</h1>
        <div style={{ background: 'white', padding: 24, borderRadius: 12, maxWidth: 600 }}>
          <p style={{ color: '#666' }}>Admin settings coming soon…</p>
        </div>
      </div>
    )
  }

  return null
}

export default AdminDashboard
