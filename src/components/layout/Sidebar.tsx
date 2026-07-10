import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { FiLogOut, FiBarChart2, FiGrid, FiFileText, FiClipboard, FiBriefcase, FiCheckCircle } from 'react-icons/fi'
import { FaDatabase } from 'react-icons/fa'
import { TbMoneybag } from 'react-icons/tb'

const MENU_ITEMS: Array<{ to: string; label: string; icon: ReactNode }> = [
  { to: '/',             label: 'Overview',     icon: <FiBarChart2 /> },
  { to: '/events',       label: 'Events',       icon: <FiGrid /> },
  { to: '/recce',        label: 'Recce',        icon: <FaDatabase /> },
  { to: '/proposals',    label: 'Proposals',    icon: <FiFileText /> },
  { to: '/requisitions', label: 'Requisitions', icon: <FiClipboard /> },
  { to: '/completed',    label: 'Completed',    icon: <FiCheckCircle /> },
  { to: '/jobs',         label: 'Jobs',         icon: <FiBriefcase /> },
  { to: '/payments',     label: 'Payments',     icon: <TbMoneybag /> },
]

interface SidebarProps {
  onLogout: () => void
}

export function Sidebar({ onLogout }: SidebarProps) {

  return (
    <aside
      style={{
        width: 280,
        background: '#248afd',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        boxShadow: '0 4px 12px rgba(36, 138, 253, 0.15)',
      }}
    >
      {/* Logo */}
      <div style={{  borderBottom: '1px solid #248afd' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '28px 24px 24px', }}>
          {/* <div
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              // justifyContent: 'center',
              // background: '#248afd',
              color: 'white',
              border: '#248afd',
              borderBlock: 1,
              
              fontSize: 16,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            <img src="./images.jpg" alt=""  />
            
          </div> */}
          <div>
            <div style={{ color: 'white', fontSize: 13, fontWeight: 700, letterSpacing: 1.2 }}>
              EVENTPORTAL
            </div>
            <div style={{ color: 'white', fontSize: 11, letterSpacing: 0.5, marginTop: 1 }}>
              Management System
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, }}>
        
          <div style={{ overflow: 'hidden',
          background: '#248afd',
          color: 'white',
          border: '#248afd',
           width: 280,
           }}>
            <div
            style={{padding: '10px 24px 24px',}}>
                          
            {/* <div
              style={{
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                
               
              }}
            >
              {user.user_metadata.full_name ?? 'User'}
            </div> */}
            {/* <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
              style={{
                color: '#d8dbe1',
                fontSize: 11,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.email}
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <div
                  className={pendingCount > 0 ? 'btl-pulse' : ''}
                  title="Pending recces"
                  style={{ background: pendingCount > 0 ? '#ef4444' : '#10b981', color: '#fff', padding: '6px 10px', borderRadius: 999, fontWeight: 800, fontSize: 12 }}
                >
                  {pendingCount}
                </div>
              </div>
            </div> */}
            </div>
          </div>
        </div>
      </div>
      

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '14px 20px',
              background: isActive ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
              border: 'none',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.85)',
              fontSize: 14,
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              borderLeft: `3px solid ${isActive ? '#fff' : 'transparent'}`,
              textAlign: 'left',
              textDecoration: 'none',
            })}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, color: 'inherit' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '18px 20px', borderTop: '1px solid #e5e5e5', background: '#eef4ff', }}>
        
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '5px',
           color: '#248afd',
            border: 'none',
            
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'Georgia, serif',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8,  fontSize: 13, fontWeight: 700, }}>
            <FiLogOut /> Sign Out
          </span>
        </button>
      </div>
    </aside>
  )
}