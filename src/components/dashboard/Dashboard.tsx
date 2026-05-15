import { FiBell, FiSearch } from 'react-icons/fi'
import type { PageId, AppUser } from '../../types'
import { EVENTS_DATA, PAY_REQUESTS } from '../../data'
import { KPICards } from './KPICards'
import { BusinessModules } from './BusinessModules'
import { PerformanceOverview } from './PerformanceOverview'

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

  const viewEvents = () => setActive('events')

  return (
    <div className="animate-fade-in" style={{ padding: 20 }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'linear-gradient(135deg, #243c8f 0%, #0f172a 100%)',
          color: 'white',
          borderRadius: 24,
          padding: '22px 24px',
          boxShadow: '0 24px 58px rgba(15, 23, 42, 0.18)',
          marginBottom: 24,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0, flex: 1, maxWidth: 640 }}>
            <div style={{ textTransform: 'uppercase', letterSpacing: 1.8, fontSize: 11, opacity: 0.75, marginBottom: 12 }}>
              Dashboard
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.05 }}>
                Hi {firstName}, welcome back
              </h1>
              <div
                style={{
                  whiteSpace: 'nowrap',
                  padding: '10px 14px',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                {dateLabel}
              </div>
            </div>
            <p style={{ margin: '14px 0 0', color: 'rgba(255,255,255,0.78)', maxWidth: 560, fontSize: 14 }}>
              Events, budgets, and alerts are all visible in one clean workspace.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.08)',
                padding: '12px 16px',
                color: 'white',
                minWidth: 220,
                flex: '1 1 220px',
              }}
            >
              <FiSearch size={16} />
              <input
                type="search"
                placeholder="Search events, vendors, budgets..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  color: 'white',
                  width: '100%',
                  fontSize: 13,
                }}
              />
            </div>

            <button
              type="button"
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <FiBell size={18} />
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderRadius: 18,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.14)',
                padding: '10px 14px',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  background: 'white',
                  color: '#0f172a',
                  fontWeight: 700,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {firstName[0] ?? 'A'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{firstName}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Profile</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18, alignItems: 'center' }}>
          <button
            type="button"
            style={{
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.08)',
              color: 'white',
              padding: '11px 18px',
              cursor: 'pointer',
              borderRadius: 14,
              fontWeight: 700,
            }}
          >
            Export Report
          </button>

          <button
            type="button"
            onClick={viewEvents}
            style={{
              border: 'none',
              background: '#60a5fa',
              color: 'white',
              padding: '11px 18px',
              cursor: 'pointer',
              borderRadius: 14,
              fontWeight: 700,
            }}
          >
            Browse Events
          </button>

          <div
            style={{
              borderRadius: 14,
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.88)',
              padding: '10px 14px',
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            4 active business modules
          </div>

          <div
            style={{
              borderRadius: 14,
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.88)',
              padding: '10px 14px',
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {upcoming} upcoming events
          </div>

          <div
            style={{
              borderRadius: 14,
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.88)',
              padding: '10px 14px',
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {pendingPay} awaiting approval
          </div>
        </div>
      </div>

      <KPICards cards={kpiCards} />
      <BusinessModules modules={businessModules} />
      <PerformanceOverview targetMetrics={targetMetrics} budgetLines={budgetLines} />
    </div>
  )
}
