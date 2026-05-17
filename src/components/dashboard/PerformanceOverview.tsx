import { Card } from '../ui'

interface TargetMetric {
  label: string
  progress: number
  detail: string
  color: string
}

interface BudgetLine {
  label: string
  amount: string
  percent: string
  color: string
}

interface PerformanceOverviewProps {
  targetMetrics: TargetMetric[]
  budgetLines: BudgetLine[]
}

export function PerformanceOverview({ targetMetrics, budgetLines }: PerformanceOverviewProps) {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 32 }}>
      <Card style={{ padding: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 6 }}>Performance Overview</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Progress against this quarter's goals</div>
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          {targetMetrics.map((metric) => (
            <div key={metric.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{metric.label}</div>
                <div style={{ fontSize: 12, color: '#111', fontWeight: 700 }}>{metric.detail}</div>
              </div>
              <div style={{ width: '100%', height: 10, background: '#e5e7eb' }}>
                <div style={{ width: `${metric.progress * 100}%`, height: '100%', background: metric.color }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 6 }}>Budget Breakdown</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Where your budget is allocated</div>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          {budgetLines.map((item) => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 10, height: 10, display: 'inline-block', background: item.color }} />
                  <span style={{ fontSize: 12, color: '#111' }}>{item.label}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{item.amount}</div>
              </div>
              <div style={{ fontSize: 12, color: '#111', fontWeight: 700 }}>{item.percent}</div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
