import { useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'

type DashboardTheme = {
  bg: string
  pageBg: string
  panel: string
  border: string
  blue: string
  blueLight: string
  blueBorder: string
  text: string
  textMid: string
  textMuted: string
  textFaint: string
  green: string
  greenLight: string
  greenBorder: string
  amber: string
  amberLight: string
  amberBorder: string
  red: string
  redLight: string
  redBorder: string
}

type KpiCardProps = {
  label: string
  value: string
  sub: string
  accent: string
  icon: ReactNode
  theme: DashboardTheme
}

export function KpiCard({ label, value, sub, accent, icon, theme }: KpiCardProps) {
  const card: CSSProperties = {
    background: theme.panel,
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    padding: '18px 20px',
    flex: 1,
    borderTop: `3px solid ${accent}`,
    position: 'relative',
    overflow: 'hidden',
  }

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>
            {label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: theme.text, lineHeight: 1, fontFamily: 'Georgia, serif' }}>
            {value}
          </div>
          <div style={{ fontSize: 12, color: theme.textFaint, marginTop: 5 }}>{sub}</div>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: 8,
          background: `${accent}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

type ShortcutCardProps = {
  label: string
  value: string
  sub: string
  accent: string
  onClick?: () => void
  theme: DashboardTheme
}

export function ShortcutCard({ label, value, sub, accent, onClick, theme }: ShortcutCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 8,
        padding: '14px 16px',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
        border: `1px solid ${hovered ? accent : theme.border}`,
        background: hovered ? `${accent}08` : theme.panel,
        transition: 'all .15s',
        borderLeft: `4px solid ${accent}`,
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700, color: accent, fontFamily: 'Georgia, serif' }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: theme.textFaint, marginTop: 2 }}>{sub}</div>
    </button>
  )
}

type DashboardHeaderProps = {
  title: string
  subtitle: string
  dateLabel: string
  theme: DashboardTheme
}

export function DashboardHeader({ title, subtitle, dateLabel, theme }: DashboardHeaderProps) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: theme.bg,
      borderBottom: `1px solid ${theme.blue}`,
      padding: '0 28px',
      display: 'flex', alignItems: 'stretch', justifyContent: 'space-between',
    }}>
      <div style={{ padding: '16px 0 14px' }}>
        <div style={{ fontSize: 11, color: theme.textFaint, marginBottom: 3 }}>{subtitle}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: theme.text, fontFamily: 'Georgia, serif', letterSpacing: '-0.3px' }}>
          {title}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: theme.textFaint }}>{dateLabel}</span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#f9fafb', border: `1px solid ${theme.border}`,
          borderRadius: 6, padding: '7px 12px', cursor: 'pointer',
        }}>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={theme.textFaint} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span style={{ fontSize: 12, color: theme.textFaint }}>Search</span>
          <span style={{ fontSize: 10, color: theme.textFaint, background: theme.border, borderRadius: 3, padding: '1px 5px' }}>⌘K</span>
        </div>

        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <div style={{ background: '#f9fafb', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '7px 9px', display: 'flex' }}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={theme.textMuted} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 16, height: 16, background: theme.blue, borderRadius: '50%',
            fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700,
          }}>5</div>
        </div>
      </div>
    </div>
  )
}

type SectionHeaderProps = {
  title: string
  action?: ReactNode
  theme: DashboardTheme
}

export function SectionHeader({ title, action, theme }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: theme.text, fontFamily: 'Georgia, serif', letterSpacing: '-0.2px' }}>
        {title}
      </h2>
      {action}
    </div>
  )
}
