import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { FiGrid, FiDollarSign, FiClipboard, FiSettings, FiLogOut } from 'react-icons/fi'

type FinancePage = 'overview' | 'pay-requests' | 'requisitions' | 'settings'

interface FinanceSidebarProps {
  active: FinancePage
  setActive: Dispatch<SetStateAction<FinancePage>>
  onLogout: () => void
}

const MENU_ITEMS: Array<{ id: FinancePage; label: string; icon: (props: { size?: number }) => ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: FiGrid },
  { id: 'pay-requests', label: 'Pay Requests', icon: FiDollarSign },
  { id: 'requisitions', label: 'Requisitions', icon: FiClipboard },
  { id: 'settings', label: 'Settings', icon: FiSettings },
]

export function FinanceSidebar({ active, setActive, onLogout }: FinanceSidebarProps) {
  return (
    <aside style={{
      width: 280,
      background: '#0f172a',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)',
    }}>
      <div style={{ padding: '24px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.7, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>
          Finance Command Center
        </div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, lineHeight: 1.1 }}>
          Finance Team
        </h2>
      </div>

      <nav style={{ flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {MENU_ITEMS.map((item) => {
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
                padding: '14px 24px',
                background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                border: 'none',
                color: isActive ? '#fff' : '#cbd5e1',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                borderLeft: isActive ? '4px solid #38bdf8' : '4px solid transparent',
                transition: 'background 0.15s ease',
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '20px 22px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '12px 18px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            borderRadius: 10,
          }}
        >
          <FiLogOut size={16} style={{ marginRight: 8 }} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
