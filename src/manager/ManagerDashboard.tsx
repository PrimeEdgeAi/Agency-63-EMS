import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getEventsData } from '../data'
import { ManagerSidebar } from './components/ManagerSidebar'
import { AgentsWorkflowView } from './components/AgentsWorkflowView'
import { ManagerExecutiveDashboard } from '../components/dashboard/RoleDashboards'
import { ModulesPage, ReportsPage, TargetsPage, TeamPage } from './components/ManagerPages'
import { ManagerProposalsPage } from './components/ManagerProposalsPage'
import ModuleData from '../components/modules/NonAlcoholic/types'
import { PayRequestPage } from '../components/finance/PayRequestPage'
import { fetchProposalsFromN8nWebhook } from '../lib/proposalWebhook'
import type { Proposal } from './components/ProposalsPage'

const MANAGER_EMAILS = ['ericmunene1410@gmail.com', 'theafricanpulsepod@gmail.com']

type ManagerPage = 'overview' | 'modules' | 'events' | 'team' | 'pay-request' | 'reports' | 'targets' | 'proposals'

function getManagerPage(slug: string): ManagerPage | null {
  const page = slug || 'overview'
  return ['overview', 'modules', 'events', 'team', 'pay-request', 'reports', 'targets', 'proposals'].includes(page)
    ? (page as ManagerPage)
    : null
}

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
  const location = useLocation()
  const pageSlug = location.pathname.replace(/^\/manager\/?/, '')
  const active = getManagerPage(pageSlug)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [assignedAgents, setAssignedAgents] = useState<Employee[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [pendingProposalCount, setPendingProposalCount] = useState(0)

  const events = useMemo(() => getEventsData(), [])
  const kcbJobs = useMemo(
    () =>
      events
        .filter((event) => /kcb/i.test(event.title) || /kcb/i.test(event.category) || /kcb/i.test(event.story))
        .map((event) => ({
          id: event.id,
          title: event.title,
          location: event.location,
          status: event.status,
          date: event.date,
        })),
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
      const items = await fetchProposalsFromN8nWebhook()
      return items.map((item) => ({
        id: item.id,
        title: item.title,
        budget: item.budget,
        submitted_by: item.submitted_by,
        submitted_at: item.submitted_at,
        file_name: item.file_name,
        status: item.status,
        approved_at: item.approved_at,
        job_id: item.job_id,
        client: item.client,
        location: item.location,
        status_label: item.status_label,
      })) as Proposal[]
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

      const [employeeResult, webhookProposals] = await Promise.allSettled([
        supabase.from('employees').select('*'),
        fetchProposalsFromWebhook(),
      ])

      const employeeError = employeeResult.status === 'rejected' ? employeeResult.reason : null
      const employeeData = employeeResult.status === 'fulfilled' ? (employeeResult.value?.data || []) : []
      const employees = (employeeData || []) as Employee[]
      const foundManager = employees.find((item) => item.role === 'manager' && item.email === email) ?? null
      const isManagerUser = MANAGER_EMAILS.includes(email) || !!foundManager

      if (employeeError) {
        console.warn('Employee lookup failed, continuing with fallback data.', employeeError)
      }

      if (!isManagerUser) {
        setAccessDenied(true)
        return
      }

      const agents = employees.filter((item) => item.role === 'agent' && foundManager ? item.manager_id === foundManager.id : true)
      setAssignedAgents(agents)
      setProposals(webhookProposals.status === 'fulfilled' ? webhookProposals.value : [])
      setPendingProposalCount((webhookProposals.status === 'fulfilled' ? webhookProposals.value : []).filter((proposal) => proposal.status === 'pending').length)
    } catch (error) {
      console.error('Load manager data error', error)
      setAccessDenied(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()

    const onRecceComplete = () => {
      void loadData()
    }

    window.addEventListener('BtlRecceCompleted', onRecceComplete)
    return () => window.removeEventListener('BtlRecceCompleted', onRecceComplete)
  }, [])

  useEffect(() => {
    if (active !== 'proposals') return
    void loadData()
  }, [active])

  function isDelayed(p: Proposal) {
    if (p.status === 'approved') return false
    const submitted = new Date(p.submitted_at).getTime()
    return Date.now() - submitted > 72 * 3600 * 1000
  }

  function handleProposalApproved(id: string) {
    setProposals((current) => current.map((proposal) => proposal.id === id ? { ...proposal, status: 'approved', approved_at: new Date().toISOString() } : proposal))
    setPendingProposalCount((current) => Math.max(0, current - 1))
  }

  const handleLogout = () => {
    if (props?.onLogout) props.onLogout()
  }

  if (active === null) return <Navigate to="/manager/overview" replace />

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
          <ManagerExecutiveDashboard />
        )}

        {active === 'modules' && <ModulesPage />}

        {active === 'events' && <AgentsWorkflowView initialAction="events" />}

        {active === 'team' && <TeamPage agents={assignedAgents} />}

        {active === 'pay-request' && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', minHeight: 680, padding: 28 }}>
            <PayRequestPage />
          </div>
        )}

        {active === 'reports' && (
          <ReportsPage
            proposalCount={visibleProposals.length}
            approvedCount={visibleProposals.filter((proposal) => proposal.status === 'approved').length}
            delayedCount={visibleProposals.filter((proposal) => isDelayed(proposal)).length}
            pendingProposalCount={pendingProposalCount}
          />
        )}

        {active === 'targets' && (
          <TargetsPage companies={kcbCompanies} kcbJobs={kcbJobs} />
        )}

        {active === 'proposals' && (
          <ManagerProposalsPage
            proposals={visibleProposals}
            loading={loading}
            pendingCount={pendingProposalCount}
            isDelayed={isDelayed}
            onApproveProposal={handleProposalApproved}
          />
        )}
      </main>
    </div>
  )
}

export default ManagerDashboard
