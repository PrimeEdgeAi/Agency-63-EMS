import React from 'react'
import type { DashboardMetricCard } from '../../hooks/useExecutiveDashboard'

interface ExecutiveDashboardShellProps {
  title: string
  subtitle: string
  metrics: DashboardMetricCard[]
  loading?: boolean
  children?: React.ReactNode
}

const toneStyles: Record<DashboardMetricCard['tone'], { background: string; border: string; color: string }> = {
  info: { background: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
  success: { background: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
  warning: { background: '#fff7ed', border: '#fed7aa', color: '#c2410c' },
  critical: { background: '#fef2f2', border: '#fecaca', color: '#b91c1c' },
}

export function ExecutiveDashboardShell({ title, subtitle, metrics, loading = false, children }: ExecutiveDashboardShellProps) {
  return (
    <div style={{ padding: 32, background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 8, fontSize: 30, fontWeight: 700, color: '#0f172a' }}>{title}</h1>
        <p style={{ margin: 0, color: '#64748b', maxWidth: 760, lineHeight: 1.6 }}>{subtitle}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 18, minHeight: 112 }}>
                <div style={{ height: 14, width: '55%', background: '#e2e8f0', borderRadius: 999, marginBottom: 10 }} />
                <div style={{ height: 28, width: '40%', background: '#f1f5f9', borderRadius: 999, marginBottom: 8 }} />
                <div style={{ height: 12, width: '70%', background: '#f8fafc', borderRadius: 999 }} />
              </div>
            ))
          : metrics.map((metric) => {
              const style = toneStyles[metric.tone]
              return (
                <div key={metric.label} style={{ background: '#fff', border: `1px solid ${style.border}`, borderRadius: 16, padding: 18, minHeight: 112 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.2 }}>{metric.label}</div>
                    <div style={{ padding: '4px 8px', borderRadius: 999, background: style.background, color: style.color, fontSize: 12, fontWeight: 700 }}>{metric.tone}</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{metric.value}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{metric.detail}</div>
                </div>
              )
            })}
      </div>

      <div>{children}</div>
    </div>
  )
}

export function ExecutiveSectionCard({ title, children, emptyMessage }: { title: string; children: React.ReactNode; emptyMessage?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20, boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>{title}</div>
      {children && React.Children.count(children) > 0 ? children : <div style={{ color: '#64748b' }}>{emptyMessage ?? 'No data available.'}</div>}
    </div>
  )
}

export function DashboardTableRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>{children}</div>
}

export function DashboardListItem({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{subtitle}</div>
      </div>
      {badge ? <span style={{ padding: '4px 10px', borderRadius: 999, background: '#eff6ff', color: '#1d4ed8', fontSize: 12, fontWeight: 700 }}>{badge}</span> : null}
    </div>
  )
}
