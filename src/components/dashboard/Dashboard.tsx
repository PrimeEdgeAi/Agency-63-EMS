import { FiBell, FiSearch } from 'react-icons/fi'
import type { PageId, AppUser } from '../../types'
// import { EVENTS_DATA, PAY_REQUESTS } from '../../data'
// import { OverviewMetrics } from './OverviewMetrics'
import { BusinessModules } from './BusinessModules'
// import { PerformanceOverview } from './PerformanceOverview'
// import { RegistrationsChart } from './RegistrationsChart'
// import { UpcomingEventsList } from './UpcomingEventsList'
// import { ActivityFeed } from './ActivityFeed'

interface DashboardProps {
  user: AppUser
  setActive: (id: PageId) => void
}

export function Dashboard({ user }: DashboardProps) {
  const firstName = (user.user_metadata.full_name ?? user.email ?? 'there').split(' ')[0]
  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  // const upcoming   = EVENTS_DATA.filter((e) => e.status === 'upcoming').length
  // const totalBudget = EVENTS_DATA.reduce((a, b) => a + b.budget, 0)
  // const totalAtt   = EVENTS_DATA.reduce((a, b) => a + b.attendees, 0)
  // const pendingPay = PAY_REQUESTS.filter((p) => p.status === 'pending').length

  // const metrics = [
  //   { label: 'Total events',    value: EVENTS_DATA.length,                    sub: `${upcoming} upcoming`,      delta: 14, deltaLabel: 'vs last quarter', icon: 'calendar' as const },
  //   { label: 'Total attendees', value: totalAtt.toLocaleString(),             sub: 'across all events',         delta: 18, deltaLabel: 'vs last month',   icon: 'users'    as const },
  //   { label: 'Portfolio budget',value: `KES ${(totalBudget/1_000_000).toFixed(1)}M`, sub: 'allocated total',   delta: -4, deltaLabel: 'vs last month',   icon: 'dollar'   as const },
  //   { label: 'Pay requests',    value: pendingPay,                            sub: 'awaiting approval',         delta: 2,  deltaLabel: 'new this week',    icon: 'file'     as const },
  // ]

  const businessModules: Array<{
    label: string; icon: 'unicorn'|'oneoff'|'alcoholic'|'nonalcoholic'
    summary: string; metric: string; progress: number; accent: string
  }> = [
    { label: 'UniCorns',      icon: 'unicorn',      summary: '3 active · KES 1.8M',  metric: '8 active projects', progress: 0.85, accent: '#f5a623' },
    { label: 'One Off',       icon: 'oneoff',       summary: '2 active · KES 940K',  metric: '5 campaigns',       progress: 0.63, accent: '#248afd' },
    { label: 'Alcoholic',     icon: 'alcoholic',    summary: '4 vendors · KES 1.2M', metric: '6 contracts',       progress: 0.72, accent: '#ff4747' },
    { label: 'Non Alcoholic', icon: 'nonalcoholic', summary: '6 vendors · KES 490K', metric: '12 orders',         progress: 0.53, accent: '#71c02b' },
  ]

  // const targetMetrics = [
  //   { label: 'Events completed',   progress: 0.5,                                  detail: '2 / 4',                                               color: '#20c997' },
  //   { label: 'Attendee target',    progress: Math.min(totalAtt / 2500, 1),          detail: `${totalAtt.toLocaleString()} / 2,500`,                color: '#4f46e5' },
  //   { label: 'Revenue target',     progress: Math.min(totalBudget / 4_400_000, 1),  detail: `KES ${(totalBudget/1_000_000).toFixed(1)}M / 4.4M`,   color: '#f59e0b' },
  //   { label: 'Budget utilisation', progress: 0.7,                                   detail: '70%',                                                  color: '#ef4444' },
  // ]

  // const budgetLines = [
  //   { label: 'Venue & Logistics', amount: 'KES 1.4M', percent: '32%', color: '#10b981' },
  //   { label: 'Catering',          amount: 'KES 960K',  percent: '22%', color: '#3b82f6' },
  //   { label: 'AV & Tech',         amount: 'KES 750K',  percent: '17%', color: '#f59e0b' },
  //   { label: 'Marketing',         amount: 'KES 620K',  percent: '14%', color: '#8b5cf6' },
  //   { label: 'Contingency',       amount: 'KES 700K',  percent: '16%', color: '#ef4444' },
  // ]

  return (
    //explain where i need to reduce the top margin for the header banner and add a note about the sticky position and z-index to ensure it stays above other content when scrolling
      
    <div className="animate-fade-in" style={{ padding: 5 }}>
      {/* ── Header banner ── */}
      
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'linear-gradient(135deg, #243c8f 0%, #248afd 100%)',
        color: 'white', borderRadius: 20, padding: '20px 24px',
        boxShadow: '0 24px 58px rgba(15,23,42,0.18)', marginBottom: 24,
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ textTransform: 'uppercase', letterSpacing: 1.8, fontSize: 10, opacity: 0.6, marginBottom: 6 }}>
              Dashboard · {dateLabel}
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.1 }}>
              Hi {firstName}, welcome back
            </h1>
            <p style={{ margin: '10px 0 0', color: 'rgba(255,255,255,0.72)', fontSize: 13 }}>
              Events, budgets, and alerts — all in one workspace.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)',
              padding: '10px 14px', color: 'white', minWidth: 210,
            }}>
              <FiSearch size={14} />
              <input type="search" placeholder="Search events, vendors…" style={{
                border: 'none', background: 'transparent', outline: 'none',
                color: 'white', width: '100%', fontSize: 12,
              }} />
            </div>
            <button type="button" aria-label="Notifications" style={{
              width: 42, height: 42, borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)',
              color: 'white', cursor: 'pointer', display: 'grid', placeItems: 'center',
            }}>
              <FiBell size={16} />
            </button>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, borderRadius: 14,
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.14)',
              padding: '8px 12px',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 999, background: 'white',
                color: '#0f172a', fontWeight: 700, display: 'grid', placeItems: 'center', fontSize: 13,
              }}>
                {firstName[0] ?? 'A'}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{firstName}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Admin</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {/* <button type="button" onClick={() => setActive('events')} style={{
            border: 'none', background: '#60a5fa', color: 'white', padding: '9px 16px',
            cursor: 'pointer', borderRadius: 10, fontWeight: 700, fontSize: 12,
          }}>
            Browse Events
          </button> */}
          {/* {[`4 business modules`, `${upcoming} upcoming events`, `${pendingPay} awaiting approval`].map((label) => (
            <div key={label} style={{
              borderRadius: 10, background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.88)', padding: '9px 14px',
              fontSize: 11, fontWeight: 600, border: '1px solid rgba(255,255,255,0.12)',
            }}>
              {label}
            </div>
          ))} */}
        </div>
      </div>
       {/* ── Business modules ── */}
      <BusinessModules modules={businessModules} />

      {/* ── KPI metric cards ── */}

      {/* <OverviewMetrics metrics={metrics} /> */}

      {/* ── Chart + upcoming events ── */}
      {/* <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <RegistrationsChart />
        <UpcomingEventsList events={EVENTS_DATA} setActive={setActive} />
      </div> */}

     

      {/* ── Performance + budget ── */}
      {/* <PerformanceOverview targetMetrics={targetMetrics} budgetLines={budgetLines} /> */}

      {/* ── Activity feed ── */}
      {/* <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <ActivityFeed />
      </div> */}
    </div>
  )
}
