import { FiLogOut } from 'react-icons/fi'

interface AdminSidebarProps {
  active: string
  setActive: (page: string) => void
  onLogout: () => void
}

export function AdminSidebar({ active, setActive, onLogout }: AdminSidebarProps) {
  const menuItems = [
    { id: 'proposals', label: 'Proposals', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <aside style={{
      width: 280,
      height: '100vh',
      background: '#111',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 0',
      position: 'fixed',
      left: 0,
      top: 0,
      boxShadow: '4px 0 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
    }}>
      {/* Header */}
      <div style={{ padding: '0 24px', marginBottom: 32 }}>
        <div style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 4,
          letterSpacing: -1,
          fontFamily: 'Georgia, serif',
        }}>
          Admin
        </div>
        <div style={{ fontSize: 11, color: '#888', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Control Panel
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflow: 'auto', paddingBottom: 32 }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: active === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none',
              borderLeft: active === item.id ? '3px solid #fff' : '3px solid transparent',
              color: active === item.id ? '#fff' : '#999',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: active === item.id ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (active !== item.id) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.color = '#bbb'
              }
            }}
            onMouseLeave={(e) => {
              if (active !== item.id) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#999'
              }
            }}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '0 24px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: 16,
      }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'rgba(231, 76, 60, 0.1)',
            border: '1px solid rgba(231, 76, 60, 0.3)',
            color: '#e74c3c',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(231, 76, 60, 0.15)'
            e.currentTarget.style.borderColor = 'rgba(231, 76, 60, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(231, 76, 60, 0.1)'
            e.currentTarget.style.borderColor = 'rgba(231, 76, 60, 0.3)'
          }}
        >
          <FiLogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
