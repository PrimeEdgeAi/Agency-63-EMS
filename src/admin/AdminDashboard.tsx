import { useEffect, useState } from 'react'
// import { FiBarChart2 } from 'react-icons/fi'
import { AdminSidebar } from './components/AdminSidebar'
import { ProposalsPage, type Proposal } from './components/ProposalsPage'
import { SettingsPage } from './components/SettingsPage'
import TeamPage from './components/Team'
import BillingPage from './components/Billing'
import DBConnections from './components/DBConnections'
import { OverviewPage } from './components//OverviewPage'
import { supabase } from '../lib/supabase'
import { loadGoogleSheetsConfig } from './components/GoogleSheetsConnection'

const REMINDER_WEBHOOK = (import.meta.env.VITE_REMINDER_WEBHOOK_URL as string) || ''
const PROPOSALS_WEBHOOK = 'https://kenmongare.app.n8n.cloud/webhook/ProposalsCheck'
const ADMIN_EMAIL = 'kevin.n.mongare@gmail.com'

function nowIso() { return new Date().toISOString() }

// ── Add 'overview' to the page union ─────────────────────────────────────────
type AdminPage = 'overview' | 'proposals' | 'settings' | 'team' | 'billing' | 'db-connections'

export function AdminDashboard(props?: { onLogout?: () => void }) {
  const [active, setActive] = useState<AdminPage>('overview')   // ← default to overview
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [title, setTitle] = useState('')
  const [budget, setBudget] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  // Read the Sheets URL from the same localStorage key GoogleSheetsConnection uses
  const sheetsUrl = loadGoogleSheetsConfig().webAppUrl

  async function loadProposals() {
    setLoading(true)
    try {
      const response = await fetch(PROPOSALS_WEBHOOK, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) {
        throw new Error(`Failed to load proposals (${response.status})`)
      }
      const data = await response.json() as { count?: number; items?: any[] }
      const items = Array.isArray(data.items) ? data.items : []
      const mapped = items.map((item, index) => {
        const statusRaw = (item['Proposal Done'] ?? item.Proposal_Done ?? item.proposal_done ?? 'No').toString().trim().toLowerCase()
        const proposalStatus: Proposal['status'] = statusRaw === 'yes' || statusRaw === 'approved' ? 'approved' : 'pending'
        return {
          id: item.Job_ID || item.id || `proposal-${index + 1}`,
          title: item.Description || item.Title || item.Job_ID || `Proposal ${index + 1}`,
          budget: Number(item.Budget ?? item.budget ?? 0) || 0,
          submitted_by: item['Client'] || item.Email || item['submitted_by'] || 'Unknown',
          submitted_at: item['Start Date'] || item['submitted_at'] || nowIso(),
          file_name: item['file_name'] || item.FileName || item['Proposal File'] || null,
          status: proposalStatus,
          approved_at: proposalStatus === 'approved' ? (item['approved_at'] || item.Approved_At || nowIso()) : null,
          last_reminder_at: item['last_reminder_at'] || item.Last_Reminder_At || null,
        }
      })
      setProposals(mapped)
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
      const { data, error } = await supabase
        .from('proposals')
        .insert(payload)
        .select()
        .single()
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
      const { data, error } = await supabase
        .from('proposals')
        .update({ status: 'approved', approved_at: nowIso() })
        .eq('id', id)
        .select()
        .single()
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
      if (REMINDER_WEBHOOK) {
        await fetch(REMINDER_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proposalId: id,
            title: p.title,
            budget: p.budget,
            submitted_by: p.submitted_by,
          }),
        })
      }
      const { data, error } = await supabase
        .from('proposals')
        .update({ last_reminder_at: nowIso() })
        .eq('id', id)
        .select()
        .single()
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
    if (props?.onLogout) props.onLogout()
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      <AdminSidebar
        active={active}
        setActive={(page) => setActive(page as AdminPage)}
        onLogout={handleLogout}
      />

      <main style={{
        marginLeft: 280,
        flex: 1,
        padding: active === 'overview' ? 0 : 32,  // overview handles its own padding
        minHeight: '100vh',
        maxWidth: 1400,
      }}>
        {active === 'overview' && (
          <OverviewPage sheetsWebAppUrl={sheetsUrl || undefined} />
        )}
        {active === 'proposals' && (
          <ProposalsPage
            proposals={proposals}
            loading={loading}
            title={title}
            setTitle={setTitle}
            budget={budget}
            setBudget={setBudget}
            fileName={fileName}
            setFileName={setFileName}
            onAddProposal={addProposal}
            onApprove={approve}
            onSendReminder={sendReminder}
            isDelayed={isDelayed}
            pendingCount={proposals.filter((p) => p.status === 'pending').length}
          />
        )}
        {active === 'settings' && <SettingsPage />}
        {active === 'team' && <TeamPage />}
        {active === 'billing' && <BillingPage />}
        {active === 'db-connections' && <DBConnections />}
      </main>
    </div>
  )
}

export default AdminDashboard