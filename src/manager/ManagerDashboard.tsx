import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ManagerSidebar } from './components/ManagerSidebar'
import { OverviewPage } from './components/OverviewPage'
import { MyAgentsPage } from './components/AgentsPage'
import { ProposalsPage, type Proposal } from './components/ProposalsPage'
import { SettingsPage } from './components/SettingsPage'

const MANAGER_EMAILS = ['ericmunene1410@gmail.com', 'theafricanpulsepod@gmail.com']

function nowIso() { return new Date().toISOString() }

type ManagerPage = 'overview' | 'agents' | 'proposals' | 'settings'

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

  const managedProposalEmails = useMemo(() => new Set(assignedAgents.map((agent) => agent.email)), [assignedAgents])
  const visibleProposals = useMemo(() => {
    if (assignedAgents.length === 0) return proposals
    return proposals.filter((proposal) => managedProposalEmails.has(proposal.submitted_by))
  }, [assignedAgents, managedProposalEmails, proposals])

  async function loadData() {
    setLoading(true)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const email = sessionData?.session?.user?.email ?? ''

      const [{ data: employeeData, error: employeeError }, { data: proposalData, error: proposalError }] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('proposals').select('*').order('submitted_at', { ascending: false }),
      ])

      if (employeeError) throw employeeError
      if (proposalError) throw proposalError

      const employees = (employeeData || []) as Employee[]
      const foundManager = employees.find((item) => item.role === 'manager' && item.email === email) ?? null
      const isManagerUser = MANAGER_EMAILS.includes(email) || !!foundManager

      if (!isManagerUser) {
        setAccessDenied(true)
        return
      }

      const agents = employees.filter((item) => item.role === 'agent' && foundManager ? item.manager_id === foundManager.id : true)
      setAssignedAgents(agents)
      setProposals((proposalData || []) as Proposal[])
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

  async function approveProposal(id: string) {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .update({ status: 'approved', approved_at: nowIso() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setProposals((prev) => prev.map((proposal) => proposal.id === id ? (data as Proposal) : proposal))
    } catch (e: any) {
      console.error('Approve proposal error', e.message || e)
      alert('Failed to approve proposal')
    }
  }

  function isDelayed(p: Proposal) {
    if (p.status === 'approved') return false
    const submitted = new Date(p.submitted_at).getTime()
    return Date.now() - submitted > 72 * 3600 * 1000
  }

  const handleLogout = () => {
    if (props?.onLogout) props.onLogout()
  }

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
      />

      <main style={{
        marginLeft: 280,
        flex: 1,
        padding: active === 'overview' ? 0 : 32,
        minHeight: '100vh',
        maxWidth: 1400,
      }}>
        {active === 'overview' && (
          <OverviewPage
            assignedAgentCount={assignedAgents.length}
            proposalCount={visibleProposals.length}
            approvedCount={visibleProposals.filter((p) => p.status === 'approved').length}
            delayedCount={visibleProposals.filter(isDelayed).length}
          />
        )}
        {active === 'agents' && (
          <MyAgentsPage
            agents={assignedAgents}
            proposals={proposals}
          />
        )}
        {active === 'proposals' && (
          <ProposalsPage
            proposals={visibleProposals}
            loading={loading}
            onApprove={approveProposal}
            isDelayed={isDelayed}
          />
        )}
        {active === 'settings' && <SettingsPage />}
      </main>
    </div>
  )
}

export default ManagerDashboard
