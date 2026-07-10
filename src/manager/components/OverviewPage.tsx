interface OverviewPageProps {
  assignedAgentCount: number
  proposalCount: number
  approvedCount: number
  delayedCount: number
  companies: Array<{ id: number; name: string; category: string; status: string }>
  kcbJobs: Array<{ id: number; title: string; location: string; status: string; date: string }>
}

export function OverviewPage({ assignedAgentCount, proposalCount, approvedCount, delayedCount, companies, kcbJobs }: OverviewPageProps) {
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

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 700, color: '#111' }}>KCB Company Breakdown</h2>
          {companies.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {companies.map((company) => (
                <div key={company.id} style={{ background: '#f8fafc', borderRadius: 14, padding: 18, border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{company.category}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{company.name}</div>
                  <div style={{ marginTop: 10, fontSize: 13, color: '#475569' }}>Status: {company.status}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#6b7280' }}>No KCB companies are currently assigned in this module.</div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 700, color: '#111' }}>KCB Jobs in Events Workflow</h2>
          {kcbJobs.length > 0 ? (
            <div style={{ display: 'grid', gap: 14 }}>
              {kcbJobs.map((job) => (
                <div key={job.id} style={{ padding: 16, borderRadius: 14, border: '1px solid #f3f4f6', background: '#f8fafc' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{job.title}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>{job.location} • {job.date}</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>Status: {job.status}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#6b7280' }}>No KCB jobs are currently present in the events workflow.</div>
          )}
        </div>
      </div>
    </div>
  )
}
