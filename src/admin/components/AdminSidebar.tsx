import { FiLogOut, FiFileText, FiSettings, FiBarChart2 } from 'react-icons/fi'
import { MdPeopleAlt } from 'react-icons/md'
import { TbMoneybag } from 'react-icons/tb'
import { FaDatabase } from 'react-icons/fa'

interface AdminSidebarProps {
  active: string
  setActive: (page: string) => void
  onLogout: () => void
}

export function AdminSidebar({ active, setActive, onLogout }: AdminSidebarProps) {
  const menuItems = [
    { id: 'overview',        label: 'Overview',        icon: FiBarChart2  },  // ← new
    { id: 'proposals',       label: 'Proposals',       icon: FiFileText   },
    { id: 'settings',        label: 'Settings',        icon: FiSettings   },
    { id: 'team',            label: 'Team',            icon: MdPeopleAlt  },
    { id: 'billing',         label: 'Billing',         icon: TbMoneybag   },
    { id: 'db-connections',  label: 'DB Connections',  icon: FaDatabase   },
  ]

  return (
    <aside style={{
      width: 280,
      background: '#248afd',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      boxShadow: '0 4px 12px rgba(36, 138, 253, 0.15)',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.65, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
          BTL Command Center
        </div>
        <h2 style={{
          fontSize: 18,
          fontWeight: 700,
          margin: 0,
          fontFamily: 'Georgia, serif',
        }}>
          Admin Portal
        </h2>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '16px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        {menuItems.map(item => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '11px 20px',
                background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                border: 'none',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.8)',
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                borderLeft: `3px solid ${isActive ? '#fff' : 'transparent'}`,
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent'
              }}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
      }}>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            padding: '10px 16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            borderRadius: 6,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)' }}
        >
          <FiLogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}