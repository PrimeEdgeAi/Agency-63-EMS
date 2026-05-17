import { FiStar, FiZap, FiCoffee, FiDroplet } from 'react-icons/fi'
import { Card } from '../ui'

interface BusinessModule {
  label: string
  icon: 'unicorn' | 'oneoff' | 'alcoholic' | 'nonalcoholic'
  summary: string
  metric: string
  progress: number
  accent: string
}

interface BusinessModulesProps {
  modules: BusinessModule[]
}

const ICONS = {
  unicorn: FiStar,
  oneoff: FiZap,
  alcoholic: FiCoffee,
  nonalcoholic: FiDroplet,
}

export function BusinessModules({ modules }: BusinessModulesProps) {
  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginBottom: 16 }}>
        <div>
          <p style={{ color: '#7d7d7d', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 8px', fontWeight: 600 }}>
            Business Modules
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>
            Performance at a glance
          </h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {modules.map((module) => {
          const Icon = ICONS[module.icon]
          return (
            <Card key={module.label} style={{ padding: 24, borderTop: `4px solid ${module.accent}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `${module.accent}1a`,
                      color: module.accent,
                      fontSize: 18,
                    }}
                  >
                    <Icon />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{module.label}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{module.summary}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{Math.round(module.progress * 100)}%</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{module.metric}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{module.summary.split(' · ')[0]}</div>
              </div>

              <div style={{ width: '100%', height: 8, background: '#e5e7eb' }}>
                <div style={{ width: `${module.progress * 100}%`, height: '100%', background: module.accent }} />
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
