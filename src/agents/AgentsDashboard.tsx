import { useEffect, useState } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { AgentSidebar } from './components/AdminSidebar'
import { ProposalsPage, type Proposal } from './components/ProposalsPage'
import { AgentExecutiveDashboard } from '../components/dashboard/RoleDashboards'
// import { NonAlcoholic } from '../components/modules/NonAlcoholic/NonAlcoholic'
import { EventSubmission } from '../components/modules/forms/EventSubmission'
import { RecceForm } from '../components/modules/forms/RecceForm'
import { RequisitionForm } from '../components/modules/forms/RequisitionForm'
import { ActionContent } from '../components/modules/NonAlcoholic/components/ActionContent'
import { PayRequestPage } from '../components/finance/PayRequestPage'
import { supabase } from '../lib/supabase'
import { fetchProposalsFromN8nWebhook } from '../lib/proposalWebhook'

const REMINDER_WEBHOOK = (import.meta.env.VITE_REMINDER_WEBHOOK_URL as string) || ''
const ADMIN_EMAIL = 'kmongare4@gmail.com'

function nowIso() { return new Date().toISOString() }

// ── Add 'overview' and workflow pages to the page union ───────────────────────
type AgentPage =
  | 'overview'
  | 'events'
  | 'recce'
  | 'proposals'
  | 'requisitions'
  | 'jobs'
  | 'completed'
  | 'pay-requests'
  | 'settings'
  // | 'team'
  // | 'billing'
  // | 'db-connections'

function getAgentPage(slug: string): AgentPage | null {
  const page = slug || 'overview'
  return [
    'overview',
    'events',
    'recce',
    'proposals',
    'requisitions',
    'jobs',
    'completed',
    'pay-requests',
    'settings',
    'team',
    'billing',
    'db-connections',
  ].includes(page)
    ? (page as AgentPage)
    : null
}

export function AgentDashboard(props?: { onLogout?: () => void }) {
  const location = useLocation()
  const pageSlug = location.pathname.replace(/^\/agent\/?/, '')
  const active = getAgentPage(pageSlug)

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [title, setTitle] = useState('')
  const [budget, setBudget] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadProposals() {
    setLoading(true)
    try {
      const mapped = await fetchProposalsFromN8nWebhook()
      setProposals(mapped as Proposal[])
    } catch (e: any) {
      console.error('Load proposals error', e.message || e)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    if (active !== 'proposals') return
    void loadProposals()
  }, [active])

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

  if (active === null) return <Navigate to="/agent/overview" replace />


  const handleLogout = () => {
    if (props?.onLogout) props.onLogout()
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      <AgentSidebar onLogout={handleLogout} />

      <main style={{
        marginLeft: 280,
        flex: 1,
        padding: active === 'overview' ? 0 : 32,
        minHeight: '100vh',
        maxWidth: 1400,
      }}>
        {active === 'overview' && (
          <AgentExecutiveDashboard currentUserEmail={undefined} />
        )}
        {active === 'events' && (
          <EventSubmission companyName={''} onBack={() => {}} />
        )}
        {active === 'recce' && (
          <RecceForm companyName={''} onBack={() => {}} />
        )}
        {active === 'requisitions' && (
          <RequisitionForm companyName={''} onBack={() => {}} />
        )}
        {active === 'completed' && (
          <ActionContent action={'completed'} companyName={''} />
        )}
        {active === 'jobs' && (
          <ActionContent action={'jobs'} companyName={''} />
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
            onSendReminder={sendReminder}
            isDelayed={isDelayed}
            pendingCount={proposals.filter((p) => p.status === 'pending').length}
          />
        )}
        {active === 'pay-requests' && (
          <PayRequestPage />
        )}
        {/* {active === 'settings' && <SettingsPage />}
        {active === 'team' && <TeamPage />}
        {active === 'billing' && <BillingPage />}
        {active === 'db-connections' && <DBConnections />} */}
      </main>
    </div>
  )
}

export default AgentDashboard