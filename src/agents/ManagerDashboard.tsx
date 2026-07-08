import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getEventsData } from '../data'
import { ManagerSidebar } from './components/ManagerSidebar'
import { AgentsWorkflowView } from './components/AgentsWorkflowView'
import { OverviewPage } from './components/OverviewPage'
import { ProposalsPage } from './components/ProposalsPage'
import ModuleData from '../components/modules/NonAlcoholic/types'
import type { NonAlcoholicActionId } from '../components/modules/NonAlcoholic/actions'
import { PayRequestPage } from '../components/finance/PayRequestPage'
import type { Proposal } from './components/ProposalsPage'

const MANAGER_EMAILS = ['ericmunene1410@gmail.com', 'theafricanpulsepod@gmail.com']
const PROPOSALS_WEBHOOK = 'https://kenmongare.app.n8n.cloud/webhook/ProposalsCheck'

type ManagerPage = 'overview' | 'events' | 'recce' | 'requisitions' | 'completed' | 'jobs' | 'payments'

interface Employee {
  id: number
  emp_id: string
  role: 'finance' | 'manager' | 'agent'
  name: string
  email: string
  department: string
  manager_id: number | null
}

export function ManagerDashboard(props?: { onLogout?: () => void }) {
  const [active, setActive] = useState<ManagerPage>('overview')
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [assignedAgents, setAssignedAgents] = useState<Employee[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [pendingProposalCount, setPendingProposalCount] = useState(0)

  const events = useMemo(() => getEventsData(), [])
  const kcbJobs = useMemo(
    () => events.filter((event) => /kcb/i.test(event.title) || /kcb/i.test(event.category) || /kcb/i.test(event.story)),
    [events]
  )
  const kcbCompanies = useMemo(
    () => ModuleData.companies?.filter((company) => /kcb/i.test(company.name)) ?? [],
    []
  )

  const managedProposalEmails = useMemo(() => new Set(assignedAgents.map((agent) => agent.email)), [assignedAgents])
  const visibleProposals = useMemo(() => {
    if (assignedAgents.length === 0) return proposals
    return proposals.filter((proposal) => managedProposalEmails.has(proposal.submitted_by))
  }, [assignedAgents, managedProposalEmails, proposals])

  async function fetchProposalsFromWebhook() {
    try {
      const response = await fetch(PROPOSALS_WEBHOOK, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) {
        throw new Error(`Failed to load proposals (${response.status})`)
      }
      const data = await response.json() as { count?: number; items?: Array<Record<string, unknown>> }
      const items = Array.isArray(data.items) ? data.items : []
      return items.map((item, index) => {
        const statusRaw = ((item['Proposal Done'] ?? item.Proposal_Done ?? item.proposal_done ?? 'No') as string).toString().trim().toLowerCase()
        const status: Proposal['status'] = statusRaw === 'yes' || statusRaw === 'approved' ? 'approved' : 'pending'
        return {
          id: String(item.Job_ID ?? item.id ?? `proposal-${index + 1}`),
          title: String(item.Description ?? item.Title ?? item.Job_ID ?? `Proposal ${index + 1}`),
          budget: Number(item.Budget ?? item.budget ?? 0) || 0,
          submitted_by: String(item.Client ?? item.Email ?? 'Unknown'),
          submitted_at: String(item['Start Date'] ?? item.End_Date ?? item.submitted_at ?? new Date().toISOString()),
          file_name: item['file_name'] as string | null ?? item.FileName as string | null ?? null,
          status,
          approved_at: status === 'approved' ? String(item['approved_at'] ?? item.Approved_At ?? new Date().toISOString()) : undefined,
        }
      })
    } catch (error) {
      console.error('Proposals webhook load failed', error)
      return []
    }
  }

  async function loadData() {
    setLoading(true)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const email = sessionData?.session?.user?.email ?? ''

      const [{ data: employeeData, error: employeeError }, webhookProposals] = await Promise.all([
        supabase.from('employees').select('*'),
        fetchProposalsFromWebhook(),
      ])

      if (employeeError) throw employeeError

      const employees = (employeeData || []) as Employee[]
      const foundManager = employees.find((item) => item.role === 'manager' && item.email === email) ?? null
      const isManagerUser = MANAGER_EMAILS.includes(email) || !!foundManager

      if (!isManagerUser) {
        setAccessDenied(true)
        return
      }

      const agents = employees.filter((item) => item.role === 'agent' && foundManager ? item.manager_id === foundManager.id : true)
      setAssignedAgents(agents)
      setProposals(webhookProposals)
      setPendingProposalCount(webhookProposals.filter((proposal) => proposal.status === 'pending').length)
    } catch (error) {
      console.error('Load manager data error', error)
      setAccessDenied(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    const onRecceComplete = () => {
      loadData()
    }

    window.addEventListener('BtlRecceCompleted', onRecceComplete)
    return () => window.removeEventListener('BtlRecceCompleted', onRecceComplete)
  }, [])

  function isDelayed(p: Proposal) {
    if (p.status === 'approved') return false
    const submitted = new Date(p.submitted_at).getTime()
    return Date.now() - submitted > 72 * 3600 * 1000
  }

  const handleLogout = () => {
    if (props?.onLogout) props.onLogout()
  }

  if (loading) return (
    <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Arial' }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Loading manager dashboard...</h2>
        <div style={{ color: '#6b7280' }}>Please wait while agent assignments and workflow data load.</div>
      </div>
    </div>
  )

  if (accessDenied) return (
    <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <div>You are not authorized to view the manager panel.</div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      <ManagerSidebar
        active={active}
        setActive={(page) => setActive(page as ManagerPage)}
        onLogout={handleLogout}
        pendingCount={pendingProposalCount}
      />

      <main style={{
        marginLeft: 280,
        flex: 1,
        minHeight: '100vh',
        maxWidth: 1400,
        padding: 24,
        background: '#f3f4f6',
      }}>
        {active === 'overview' && (
          <OverviewPage
            assignedAgentCount={assignedAgents.length}
            proposalCount={visibleProposals.length}
            approvedCount={visibleProposals.filter((proposal) => proposal.status === 'approved').length}
            delayedCount={visibleProposals.filter((proposal) => isDelayed(proposal)).length}
            companies={kcbCompanies}
            kcbJobs={kcbJobs}
          />
        )}

        {(['events', 'recce', 'requisitions', 'completed', 'jobs'] as ManagerPage[]).includes(active) && (
          <AgentsWorkflowView initialAction={active as NonAlcoholicActionId} />
        )}
        {active === 'proposals' && (
          <ProposalsPage
            proposals={visibleProposals}
            loading={loading}
            pendingCount={pendingProposalCount}
            isDelayed={isDelayed}
          />
        )}

        {active === 'payments' && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', minHeight: 680, padding: 28 }}>
            <PayRequestPage />
          </div>
        )}
      </main>
    </div>
  )
}

export default ManagerDashboard
