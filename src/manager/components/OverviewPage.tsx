interface OverviewPageProps {
  assignedAgentCount: number
  proposalCount: number
  approvedCount: number
  delayedCount: number
}

export function OverviewPage({ assignedAgentCount, proposalCount, approvedCount, delayedCount }: OverviewPageProps) {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 12, fontSize: 32, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' }}>
          Manager Overview
        </h1>
        <p style={{ color: '#6b7280', margin: 0, maxWidth: 680 }}>
          Track agent progress, review working proposals, and approve the work assigned to your team.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 20,
      }}>
        {[
          { label: 'Assigned Agents', value: assignedAgentCount, accent: '#ffffff', bg: '#1d4ed8', color: '#fff' },
          { label: 'Open Proposals', value: proposalCount, accent: '#eff6ff', bg: '#fff', color: '#111' },
          { label: 'Approved', value: approvedCount, accent: '#dcfce7', bg: '#fff', color: '#111' },
          { label: 'Delayed', value: delayedCount, accent: '#fee2e2', bg: '#fff', color: '#111' },
        ].map((tile) => (
          <div key={tile.label} style={{ background: tile.bg, borderRadius: 16, padding: 24, border: '1px solid #e5e7eb', minHeight: 140 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 10 }}>
                  {tile.label}
                </div>
                <div style={{ fontSize: 42, fontWeight: 700, color: tile.color }}>
                  {tile.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, display: 'grid', gap: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111' }}>Latest Notes</h2>
          <p style={{ color: '#6b7280', marginTop: 8 }}>As a manager, focus on approvals, agent capacity, and any proposals that remain pending after 3 days.</p>
        </div>
      </div>
    </div>
  )
}
