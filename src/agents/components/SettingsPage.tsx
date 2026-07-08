import { FiAlertCircle } from 'react-icons/fi'

export function SettingsPage() {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ marginBottom: 24, fontSize: 32, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' }}>
        Settings
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 24,
      }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, background: '#fef3c7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
            <FiAlertCircle size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0', color: '#111' }}>Coming Soon</h3>
            <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.7 }}>
              Manager settings and custom approvals will be available in the next release. For now, use the overview and proposals tabs to monitor progress.
            </p>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>Manager Controls</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: 14 }}>
              <span>Approval workflow</span>
              <strong style={{ color: '#111' }}>Active</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: 14 }}>
              <span>Agent tracking</span>
              <strong style={{ color: '#111' }}>Enabled</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: 14 }}>
              <span>Notifications</span>
              <strong style={{ color: '#111' }}>Email</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
