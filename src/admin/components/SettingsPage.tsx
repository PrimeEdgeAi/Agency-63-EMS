import { FiAlertCircle } from 'react-icons/fi'

export function SettingsPage() {
  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 32, fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' }}>
        Settings
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 24,
      }}>
        {/* Coming Soon Card */}
        <div style={{
          background: '#fff',
          padding: 24,
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            background: '#fef3c7',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d97706',
            flexShrink: 0,
          }}>
            <FiAlertCircle size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 4px 0' }}>
              Features Coming Soon
            </h3>
            <p style={{ color: '#6b7280', margin: 0, fontSize: 14 }}>
              Admin settings and configurations will be available in the next release.
            </p>
          </div>
        </div>

        {/* System Info */}
        <div style={{
          background: '#fff',
          padding: 24,
          borderRadius: 12,
          border: '1px solid #e5e7eb',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 16 }}>
            System Information
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: 12,
              borderBottom: '1px solid #e5e7eb',
            }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Admin Portal Version</span>
              <span style={{ color: '#111', fontWeight: 700 }}>1.0.0</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: 12,
              borderBottom: '1px solid #e5e7eb',
            }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Status</span>
              <span style={{
                color: '#166534',
                fontWeight: 700,
                background: '#ecfdf5',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 12,
              }}>
                Online
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Last Updated</span>
              <span style={{ color: '#111', fontWeight: 700 }}>Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
