import { useState } from 'react'
import type { ReactNode } from 'react'
import { FiGrid, FiStar, FiZap, FiCoffee, FiDroplet, FiChevronRight, FiLogOut, FiHelpCircle } from 'react-icons/fi'
import type { PageId, AppUser } from '../../types'
import { GiMoneyStack, GiOnTarget } from 'react-icons/gi'
import { TbReportSearch } from 'react-icons/tb'
import { IoSettingsOutline } from 'react-icons/io5'

interface NavItem {
  id: PageId
  label: string
  icon: ReactNode
}

interface NavSection {
  section: string
  items: NavItem[]
}

const NAV: NavSection[] = [
  {
    section: 'Main',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: <FiGrid /> }],
  },
  {
    section: 'Business Modules',
    items: [
      { id: 'UniCorns', label: 'UniCorns', icon: <FiStar /> },
      { id: 'One Off', label: 'One Off', icon: <FiZap /> },
      { id: 'Alcoholic', label: 'Alcoholic', icon: <FiCoffee /> },
      { id: 'NonAlcoholic', label: 'Non Alcoholic', icon: <FiDroplet /> }
    ],
  },

  {
    section: 'Finance',
    items: [
      { id: 'Pay Requests', label: 'Pay Requests', icon: <GiMoneyStack /> },
      { id: 'Target', label: 'Target', icon: <GiOnTarget /> },
      { id: 'Reports', label: 'Reports', icon: <TbReportSearch /> },
    ],
  },
  // {
  //   section: 'Finance',
  //   items: [{ id: 'payrequest', label: 'Pay Request', icon: '⊟', badge: '3' }],
  // },
  {
    section: 'Settings',
    items: [
      { id: 'settings', label: 'Settings', icon: <IoSettingsOutline /> },
      { id: 'help',     label: 'Help',     icon: <FiHelpCircle /> },
    ],
  },
]

interface SidebarProps {
  active: PageId
  setActive: (id: PageId) => void
  user: AppUser
  onLogout: () => void
}

export function Sidebar({ active, setActive, user, onLogout }: SidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Business Modules': true,
  })

  const initials = (user.user_metadata.full_name ?? user.email ?? 'U')[0].toUpperCase()

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <aside
      style={{
        width: 260,
        minHeight: '100vh',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
        borderRight: '1px solid #e5e5e5',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid #e5e5e5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
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
            
          </div>
          <div>
            <div style={{ color: '#111', fontSize: 13, fontWeight: 700, letterSpacing: 1.2 }}>
              EVENTPORTAL
            </div>
            <div style={{ color: '#6b7280', fontSize: 11, letterSpacing: 0.5, marginTop: 1 }}>
              Management System
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV.map((section) => {
          const isOpen = openSections[section.section] ?? true

          return (
            <div key={section.section} style={{ marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => toggleSection(section.section)}
                style={{
                  width: '100%',
                  padding: '16px 24px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.8,
                  textTransform: 'uppercase',
                }}
              >
                <span>{section.section}</span>
                <FiChevronRight style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} />
              </button>

              {isOpen &&
                section.items.map((item) => {
                  const isActive = active === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActive(item.id)}
                      style={{
                        width: '100%',
                        padding: '12px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: isActive ? '#eef4ff' : 'transparent',
                        border: 'none',
                        borderLeft: isActive ? '4px solid #248afd' : '4px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        color: isActive ? '#111' : '#475569',
                        fontSize: 14,
                        fontFamily: 'Georgia, serif',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: 16, width: 24, textAlign: 'center', color: isActive ? '#248afd' : '#94a3b8' }}>
                        {item.icon}
                      </span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                    </button>
                  )
                })}
            </div>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '18px 20px', borderTop: '1px solid #e5e5e5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#eef4ff',
              color: '#000000',
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                color: '#111',
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.user_metadata.full_name ?? 'User'}
            </div>
            <div
              style={{
                color: '#6b7280',
                fontSize: 11,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.email}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '10px',
            background: '#248afd',
            border: 'none',
            color: 'white',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'Georgia, serif',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <FiLogOut /> Sign Out
          </span>
        </button>
      </div>
    </aside>
  )
}