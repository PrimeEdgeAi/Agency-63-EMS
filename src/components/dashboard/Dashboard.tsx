import type { PageId, AppUser } from '../../types'
import { EVENTS_DATA, PAY_REQUESTS } from '../../data'
import { Salutation } from './Salutation'
import { KPICards } from './KPICards'
import { BusinessModules } from './BusinessModules'
import { PerformanceOverview } from './PerformanceOverview'
import { RecentEvents } from './RecentEvents'
import { EventStories } from './EventStories'
import { PendingPayRequests } from './PendingPayRequests'

interface DashboardProps {
  user: AppUser
  setActive: (id: PageId) => void
}

export function Dashboard({ user, setActive }: DashboardProps) {
  const firstName = (user.user_metadata.full_name ?? user.email ?? 'there').split(' ')[0]
  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const upcoming = EVENTS_DATA.filter((e) => e.status === 'upcoming').length
  const totalBudget = EVENTS_DATA.reduce((a, b) => a + b.budget, 0)
  const totalAttendees = EVENTS_DATA.reduce((a, b) => a + b.attendees, 0)
  const pendingPay = PAY_REQUESTS.filter((p) => p.status === 'pending').length

  const kpiCards: Array<{
    label: string
    value: string | number
    sub: string
    icon: 'calendar' | 'users' | 'dollar' | 'file'
  }> = [
    { label: 'Total Events', value: EVENTS_DATA.length, sub: `${upcoming} upcoming`, icon: 'calendar' },
    { label: 'Total Attendees', value: totalAttendees.toLocaleString(), sub: 'across all events', icon: 'users' },
    { label: 'Total Budget', value: `KES ${(totalBudget / 1000).toFixed(0)}K`, sub: 'allocated portfolio', icon: 'dollar' },
    { label: 'Pay Requests', value: pendingPay, sub: 'awaiting approval', icon: 'file' },
  ]

  const businessModules: Array<{
    label: string
    icon: 'unicorn' | 'oneoff' | 'alcoholic' | 'nonalcoholic'
    summary: string
    metric: string
    progress: number
    accent: string
  }> = [
    { label: 'UniCorns', icon: 'unicorn', summary: '3 active events · KES 1.8M', metric: '8 active projects', progress: 0.85, accent: '#f5a623' },
    { label: 'One Off', icon: 'oneoff', summary: '2 active events · KES 940K', metric: '5 campaigns', progress: 0.63, accent: '#248afd' },
    { label: 'Alcoholic', icon: 'alcoholic', summary: '4 vendors · KES 1.2M', metric: '6 contracts', progress: 0.72, accent: '#ff4747' },
    { label: 'Non Alcoholic', icon: 'nonalcoholic', summary: '6 vendors · KES 490K', metric: '12 orders', progress: 0.53, accent: '#71c02b' },
  ]

  const targetMetrics = [
    { label: 'Events Completed', progress: 0.5, detail: '2 / 4', color: '#20c997' },
    { label: 'Attendee Target', progress: Math.min(totalAttendees / 2500, 1), detail: `${totalAttendees.toLocaleString()} / 2,500`, color: '#4f46e5' },
    { label: 'Revenue Target', progress: Math.min(totalBudget / 4400000, 1), detail: `KES ${(totalBudget / 1000000).toFixed(1)}M / 4.4M`, color: '#f59e0b' },
    { label: 'Budget Utilization', progress: 0.7, detail: '70%', color: '#ef4444' },
  ]

  const budgetLines = [
    { label: 'Venue & Logistics', amount: 'KES 1.4M', percent: '32%', color: '#10b981' },
    { label: 'Catering', amount: 'KES 960K', percent: '22%', color: '#3b82f6' },
    { label: 'AV & Tech', amount: 'KES 750K', percent: '17%', color: '#f59e0b' },
    { label: 'Marketing', amount: 'KES 620K', percent: '14%', color: '#8b5cf6' },
    { label: 'Contingency', amount: 'KES 700K', percent: '16%', color: '#ef4444' },
  ]

  return (
    <div className="animate-fade-in">
      <Salutation firstName={firstName} dateLabel={dateLabel} />
      
      <BusinessModules modules={businessModules} />
      <KPICards cards={kpiCards} />
      <PerformanceOverview targetMetrics={targetMetrics} budgetLines={budgetLines} />

      
      {/* <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        <RecentEvents events={EVENTS_DATA} setActive={setActive} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <EventStories events={EVENTS_DATA} />
          <PendingPayRequests requests={PAY_REQUESTS} setActive={setActive} />
        </div>
      </div> */}
    </div>
  )
}
