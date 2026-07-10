import { useExecutiveDashboard } from '../../hooks/useExecutiveDashboard'
import { ExecutiveDashboardShell, ExecutiveSectionCard, DashboardListItem } from './ExecutiveDashboardShell'

function formatDate(value: string) {
  if (!value) return 'TBD'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
}

export function AgentExecutiveDashboard({ currentUserEmail }: { currentUserEmail?: string }) {
  const dashboard = useExecutiveDashboard('agent', currentUserEmail)

  return (
    <ExecutiveDashboardShell
      title="Agent Executive Dashboard"
      subtitle="A focused view of your active work, pending follow-up items, and upcoming events."
      metrics={dashboard.metrics}
    >
      <div style={{ display: 'grid', gap: 20 }}>
        <ExecutiveSectionCard title="My Active Jobs" emptyMessage="No active jobs assigned to you yet.">
          {dashboard.activeJobs.length > 0 ? dashboard.activeJobs.map((job) => (
            <DashboardListItem key={job.id} title={job.title} subtitle={`${job.location} • ${formatDate(job.date)}`} badge={job.status} />
          )) : null}
        </ExecutiveSectionCard>

        <ExecutiveSectionCard title="Tasks Requiring Action" emptyMessage="No follow-up tasks right now.">
          {dashboard.pendingRecce.length > 0 ? dashboard.pendingRecce.map((item) => (
            <DashboardListItem key={item.id} title={item.event} subtitle={item.venue} badge="Pending Recce" />
          )) : null}
          {dashboard.pendingRequisitions.length > 0 ? dashboard.pendingRequisitions.map((item) => (
            <DashboardListItem key={item.id} title={item.eventDescription || item.company} subtitle={item.company} badge="Requisition" />
          )) : null}
          {dashboard.pendingClaims.length > 0 ? dashboard.pendingClaims.map((item) => (
            <DashboardListItem key={item.id} title={item.event} subtitle={`Vendor: ${item.vendor}`} badge="Claim" />
          )) : null}
        </ExecutiveSectionCard>

        <ExecutiveSectionCard title="Upcoming Schedule" emptyMessage="No upcoming events.">
          {dashboard.upcomingEvents.length > 0 ? dashboard.upcomingEvents.map((event) => (
            <DashboardListItem key={event.id} title={event.title} subtitle={`${event.location} • ${formatDate(event.date)}`} badge={event.status} />
          )) : null}
        </ExecutiveSectionCard>

        <ExecutiveSectionCard title="Recently Completed Jobs" emptyMessage="No completed jobs yet.">
          {dashboard.completedJobs.length > 0 ? dashboard.completedJobs.map((job) => (
            <DashboardListItem key={job.id} title={job.title} subtitle={`${job.location} • ${formatDate(job.date)}`} badge="Completed" />
          )) : null}
        </ExecutiveSectionCard>
      </div>
    </ExecutiveDashboardShell>
  )
}

export function ManagerExecutiveDashboard() {
  const dashboard = useExecutiveDashboard('manager')

  return (
    <ExecutiveDashboardShell
      title="Manager Executive Dashboard"
      subtitle="A broad business view covering delivery health, upcoming demand, and team workload."
      metrics={dashboard.metrics}
    >
      <div style={{ display: 'grid', gap: 20 }}>
        <ExecutiveSectionCard title="Jobs by Status">
          <div style={{ display: 'grid', gap: 12 }}>
            {['active', 'planning', 'upcoming', 'completed'].map((status) => {
              const count = dashboard.activeJobs.filter((job) => job.status === status).length + (status === 'completed' ? dashboard.completedJobs.filter((job) => job.status === 'completed').length : 0)
              return <DashboardListItem key={status} title={status} subtitle="Portfolio health" badge={`${count}`} />
            })}
          </div>
        </ExecutiveSectionCard>

        <ExecutiveSectionCard title="Team Workload">
          {dashboard.teamLoad.length > 0 ? dashboard.teamLoad.map((item) => (
            <DashboardListItem key={item.name} title={item.name} subtitle="Assigned load" badge={`${item.count}`} />
          )) : <div style={{ color: '#64748b' }}>No workload data available.</div>}
        </ExecutiveSectionCard>

        <ExecutiveSectionCard title="Recent Events">
          {dashboard.recentEvents.length > 0 ? dashboard.recentEvents.map((event) => (
            <DashboardListItem key={event.id} title={event.title} subtitle={`${event.location} • ${formatDate(event.date)}`} badge={event.status} />
          )) : <div style={{ color: '#64748b' }}>No recent events.</div>}
        </ExecutiveSectionCard>

        <ExecutiveSectionCard title="Projects Behind Schedule">
          {dashboard.upcomingEvents.length > 0 ? dashboard.upcomingEvents.filter((item) => item.status === 'planning').map((event) => (
            <DashboardListItem key={event.id} title={event.title} subtitle={`${event.location} • ${formatDate(event.date)}`} badge="Planning" />
          )) : <div style={{ color: '#64748b' }}>No projects are behind schedule.</div>}
        </ExecutiveSectionCard>
      </div>
    </ExecutiveDashboardShell>
  )
}

export function FinanceExecutiveDashboard() {
  const dashboard = useExecutiveDashboard('finance')

  return (
    <ExecutiveDashboardShell
      title="Finance Executive Dashboard"
      subtitle="Financial visibility across revenue, procurement, claims, and pending payments."
      metrics={dashboard.metrics}
    >
      <div style={{ display: 'grid', gap: 20 }}>
        <ExecutiveSectionCard title="Pending Claims">
          {dashboard.pendingClaims.length > 0 ? dashboard.pendingClaims.map((item) => (
            <DashboardListItem key={item.id} title={item.event} subtitle={item.vendor} badge={`KES ${item.amount.toLocaleString()}`} />
          )) : <div style={{ color: '#64748b' }}>No pending claims.</div>}
        </ExecutiveSectionCard>

        <ExecutiveSectionCard title="Largest Procurement Costs">
          {dashboard.supplierSpend.length > 0 ? dashboard.supplierSpend.map((item) => (
            <DashboardListItem key={item.id} title={item.company} subtitle={item.eventDescription || item.jobId} badge={`KES ${item.totalAmount.toLocaleString()}`} />
          )) : <div style={{ color: '#64748b' }}>No requisition data available.</div>}
        </ExecutiveSectionCard>

        <ExecutiveSectionCard title="Supplier Spend">
          {dashboard.supplierSpend.length > 0 ? dashboard.supplierSpend.map((item) => (
            <DashboardListItem key={item.id} title={item.company} subtitle={item.requestorName || item.requestorEmail} badge={item.status} />
          )) : <div style={{ color: '#64748b' }}>No supplier spend recorded.</div>}
        </ExecutiveSectionCard>

        <ExecutiveSectionCard title="Recent Payments">
          {dashboard.recentPayments.length > 0 ? dashboard.recentPayments.map((item) => (
            <DashboardListItem key={item.id} title={item.event} subtitle={item.vendor} badge={`KES ${item.amount.toLocaleString()}`} />
          )) : <div style={{ color: '#64748b' }}>No recent payments.</div>}
        </ExecutiveSectionCard>
      </div>
    </ExecutiveDashboardShell>
  )
}
