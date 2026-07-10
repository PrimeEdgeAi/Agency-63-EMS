import { NavLink } from 'react-router-dom'
import { FiCalendar, FiLogOut, FiStar, FiLayers, FiUsers, FiDollarSign, FiCheckSquare } from 'react-icons/fi'
import { TbReportSearch } from 'react-icons/tb'
import { GiOnTarget } from 'react-icons/gi'

interface ManagerSidebarProps {
  onLogout: () => void
  pendingCount: number
}

export function ManagerSidebar({ onLogout, pendingCount }: ManagerSidebarProps) {
  const menuItems = [
    { to: '/manager/overview',   label: 'Overview',   icon: FiStar },
    { to: '/manager/modules',    label: 'Modules',    icon: FiLayers },
    { to: '/manager/events',     label: 'Events',     icon: FiCalendar },
    { to: '/manager/team',       label: 'Team',       icon: FiUsers },
    { to: '/manager/proposals',  label: 'Proposals',  icon: FiCheckSquare },
    { to: '/manager/pay-request',label: 'Pay Request',icon: FiDollarSign },
    { to: '/manager/reports',    label: 'Reports',    icon: TbReportSearch },
    { to: '/manager/targets',    label: 'Targets',    icon: GiOnTarget },
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
          Agents Portal
        </h2>
      </div>

      <nav style={{
        flex: 1,
        padding: '16px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
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
              textDecoration: 'none',
            })}
          >
            <item.icon size={17} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {(item.to === '/manager/pay-request' || item.to === '/manager/proposals') && pendingCount > 0 && (
              <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>
                {pendingCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

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
