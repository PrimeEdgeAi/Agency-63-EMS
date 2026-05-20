import type { PageId, AppUser } from '../../types'
// import { EVENTS_DATA, PAY_REQUESTS } from '../../data'
// import { OverviewMetrics } from './OverviewMetrics'
import { BusinessModules } from './BusinessModules'
// import { PerformanceOverview } from './PerformanceOverview'
// import { RegistrationsChart } from './RegistrationsChart'
// import { UpcomingEventsList } from './UpcomingEventsList'
// import { ActivityFeed } from './ActivityFeed'

const businessModules: Array<{
    label: string; icon: 'unicorn'|'oneoff'|'alcoholic'|'nonalcoholic'
    summary: string; metric: string; progress: number; accent: string
  }> = [
    { label: 'UniCorns',      icon: 'unicorn',      summary: '3 active · KES 1.8M',  metric: '8 active projects', progress: 0.85, accent: '#f5a623' },
    { label: 'One Off',       icon: 'oneoff',       summary: '2 active · KES 940K',  metric: '5 campaigns',       progress: 0.63, accent: '#248afd' },
    { label: 'Alcoholic',     icon: 'alcoholic',    summary: '4 vendors · KES 1.2M', metric: '6 contracts',       progress: 0.72, accent: '#ff4747' },
    { label: 'Non Alcoholic', icon: 'nonalcoholic', summary: '6 vendors · KES 490K', metric: '12 orders',         progress: 0.53, accent: '#71c02b' },
  ]


interface DashboardProps {
  user: AppUser
  setActive: (id: PageId) => void
}

export function Dashboard({}: DashboardProps) {
  return (
    <div className="animate-fade-in" style={{ padding: 0 }}>
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '18px 0',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ minWidth: 0, padding: '0 24px' }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
              Home / Dashboard
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111827' }}>
              Dashboard
            </h1>
          </div>
        </div>
      </div>
      <BusinessModules modules={businessModules} />

      <div>
        <div style={{ minHeight: 'calc(100vh - 100px)' }} />
      </div>
    </div>
  )
}
