import React from 'react'
import type { EventStatus, PayStatus, RecceStatus } from '../../types'

// ─── Status Badge ─────────────────────────────────────────────────────────────

type AnyStatus = EventStatus | PayStatus | RecceStatus | string

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  upcoming:  { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
  completed: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  planning:  { bg: '#fefce8', color: '#a16207', border: '#fef08a' },
  active:    { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
  pending:   { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  approved:  { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  review:    { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' },
  rejected:  { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
}

interface StatusBadgeProps {
  status: AnyStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.5,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
      <div className="text-center">
        <div
          className="animate-spin-slow mx-auto mb-4"
          style={{
            width: 48,
            height: 48,
            border: '3px solid #e5e5e5',
            borderTop: '3px solid #111',
            borderRadius: '50%',
          }}
        />
        <p style={{ color: '#888', fontSize: 13, letterSpacing: 2 }}>LOADING</p>
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  width?: number
}

export function Modal({ title, onClose, children, width = 540 }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in-fast"
        style={{
          background: 'white',
          borderRadius: 20,
          width,
          maxWidth: '95vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 36,
          boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-7">
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 400, color: '#111' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#bbb', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Form Field ───────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  children: React.ReactNode
}

export function Field({ label, children }: FieldProps) {
  return (
    <div className="mb-4">
      <label
        style={{
          display: 'block',
          fontSize: 10,
          color: '#aaa',
          letterSpacing: 0.8,
          marginBottom: 6,
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid #e5e5e5',
  borderRadius: 10,
  fontSize: 13,
  fontFamily: 'Georgia, serif',
  outline: 'none',
  boxSizing: 'border-box',
  background: 'white',
  color: '#111',
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input(props: InputProps) {
  return <input style={inputStyle} {...props} />
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea(props: TextareaProps) {
  return (
    <textarea
      style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties}
      {...props}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

export function Select({ children, ...props }: SelectProps) {
  return (
    <select style={inputStyle} {...props}>
      {children}
    </select>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: React.ReactNode
}

export function Button({ variant = 'primary', children, style, ...props }: ButtonProps) {
  const base: React.CSSProperties = {
    padding: '11px 20px',
    borderRadius: 10,
    fontSize: 13,
    fontFamily: 'Georgia, serif',
    cursor: 'pointer',
    fontWeight: variant === 'primary' ? 600 : 400,
    transition: 'all 0.15s',
  }

  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: '#111', color: 'white', border: 'none' },
    secondary: { background: 'white', color: '#888', border: '1.5px solid #e5e5e5' },
    ghost:     { background: 'transparent', color: '#888', border: 'none' },
  }

  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...props}>
      {children}
    </button>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  onClick?: () => void
  hover?: boolean
}

export function Card({ children, style, onClick, hover }: CardProps) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <div
      className='transition-all, duration-200 ease-in-out shadow-lg'
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: 'white',
        borderRadius: 0,
        // border: hovered ?  : '1px solid #e5e5e5',
        cursor: onClick ? 'pointer' : undefined,
        transition: 'all 0.2s',
        transform: hovered ? 'translateY(-1px)' : undefined,
        // boxShadow: 'none',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Page Header ──────────────────────────────────────────────────────────────

interface PageHeaderProps {
  section: string
  title: string
  children?: React.ReactNode
}

export function PageHeader({ section, title, children }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-end mb-8">
      <div>
        <p style={{ color: '#aaa', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 8px', fontWeight: 600 }}>
          {section}
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 400, color: '#111', letterSpacing: -1, margin: 0 }}>
          {title}
        </h1>
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  )
}

// ─── Filter Pills ─────────────────────────────────────────────────────────────

interface FilterPillsProps {
  options: string[]
  active: string
  onChange: (v: string) => void
}

export function FilterPills({ options, active, onChange }: FilterPillsProps) {
  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          style={{
            padding: '7px 18px',
            borderRadius: 20,
            border: '1.5px solid',
            borderColor: active === o ? '#111' : '#e5e5e5',
            background: active === o ? '#111' : 'white',
            color: active === o ? 'white' : '#888',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'Georgia, serif',
            textTransform: 'capitalize',
            fontWeight: active === o ? 600 : 400,
            transition: 'all 0.15s',
          }}
        >
          {o}
        </button>
      ))}
    </div>
  )
}
