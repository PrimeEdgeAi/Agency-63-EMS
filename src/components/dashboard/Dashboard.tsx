import { useState, useMemo, useEffect } from 'react'
import type { PageId, AppUser } from '../../types'

// ─── Data ─────────────────────────────────────────────────────────────────────

const EVENTS = [
  { id: 'JOB-001', desc: 'Jumia VS KCB',          client: 'Jumia',         venue: 'Kasarani',        start: '2026-02-20', end: '2026-02-22', clientLead: 'Kevin',  projectLead: 'Eric',  status: 'Event Creation' },
  { id: 'JOB-002', desc: 'KCB VS Stanbic',         client: 'KCB',           venue: 'Nyayo Stadium',   start: '2026-02-21', end: '2026-02-21', clientLead: 'Martin', projectLead: 'Eric',  status: 'Event Creation' },
  { id: 'JOB-003', desc: 'NCBA VS KCB',            client: 'NCBA',          venue: 'KICC',            start: '2026-02-21', end: '2026-02-22', clientLead: 'Kevin',  projectLead: 'Eric',  status: 'Event Creation' },
  { id: 'JOB-004', desc: 'KTN VS NTV',             client: 'KTN',           venue: 'KICC',            start: '2026-02-27', end: '2026-02-28', clientLead: 'Eric',   projectLead: 'Kevin', status: 'Event Creation' },
  { id: 'JOB-005', desc: 'KCB Safari Rally',       client: 'Agency63',      venue: 'Naivasha',        start: '2026-03-28', end: '2026-03-29', clientLead: 'Faith',  projectLead: 'Eric',  status: 'Event Creation' },
  { id: 'JOB-006', desc: 'Safari Rally',           client: 'PrimeEdge',     venue: 'KICC',            start: '2026-03-28', end: '2026-03-29', clientLead: 'Kevin',  projectLead: 'Eric',  status: 'Event Update'   },
  { id: 'JOB-007', desc: 'Safaricom 25 Years',     client: 'Safaricom',     venue: 'Kasarani',        start: '2026-03-26', end: '2026-03-27', clientLead: 'Faith',  projectLead: 'John',  status: 'Event Creation' },
  { id: 'JOB-008', desc: 'Coke vs Pepsi',          client: 'Cocacola',      venue: 'Talanta Stadium', start: '2026-03-28', end: '2026-03-29', clientLead: 'Kevin',  projectLead: 'Eric',  status: 'Event Creation' },
  { id: 'JOB-009', desc: 'NYS VS Gor',             client: 'NYS',           venue: 'Kasarani',        start: '2026-03-28', end: '2026-03-28', clientLead: 'Kevin',  projectLead: 'John',  status: 'Event Creation' },
  { id: 'JOB-010', desc: 'KCB BIZ',               client: 'KCB',           venue: 'Mombasa',         start: '2026-03-28', end: '2026-03-30', clientLead: 'Tonny',  projectLead: 'Kevin', status: 'Event Creation' },
  { id: 'JOB-011', desc: 'Jumia Sale Launch',      client: 'Jumia',         venue: 'Kasarani',        start: '2026-04-10', end: '2026-04-12', clientLead: 'Kevin',  projectLead: 'Eric',  status: 'Event Update'   },
  { id: 'JOB-012', desc: 'Colgate Back to School', client: 'Colgate',       venue: 'Westgate Mall',   start: '2026-05-08', end: '2026-05-12', clientLead: 'Marvin', projectLead: 'Eric',  status: 'Event Creation' },
  { id: 'JOB-013', desc: 'Saf vs Airtel',          client: 'SAF VS Airtel', venue: 'KICC',            start: '2026-04-17', end: '2026-04-18', clientLead: 'Tonny',  projectLead: 'Kevin', status: 'Event Creation' },
  { id: 'JOB-014', desc: 'Agency 63 Activation',   client: 'Agency 63',     venue: 'Westgate Mall',   start: '2026-04-18', end: '2026-04-19', clientLead: 'Marvin', projectLead: 'Eric',  status: 'Event Creation' },
  { id: 'JOB-015', desc: 'Jumia Back To School',   client: 'Jumia',         venue: 'Westgate Mall',   start: '2026-04-24', end: '2026-04-26', clientLead: 'John',   projectLead: 'Eric',  status: 'Event Creation' },
  { id: 'JOB-016', desc: 'KCB Back To School',     client: 'KCB',           venue: 'Mercy',           start: '2026-04-24', end: '2026-04-26', clientLead: 'John',   projectLead: 'Eric',  status: 'Event Creation' },
]

const CLAIMS = [
  { jobId: 'JOB-2024-001', desc: 'Jumia Flash Sale Event', lead: 'Eric', days: 3, total: 6000 },
  { jobId: 'JOB-2024-001', desc: 'Jumia Flash Sale Event', lead: 'Eric', days: 3, total: 6000 },
  { jobId: 'JOB-003',      desc: 'NCBA VS KCB',            lead: 'Eric', days: 2, total: 4000 },
  { jobId: 'JOB-003',      desc: 'NCBA VS KCB',            lead: 'Eric', days: 2, total: 4000 },
  { jobId: 'JOB-014',      desc: 'Agency 63 Activation',   lead: 'Eric', days: 2, total: 4000 },
  { jobId: 'JOB-015',      desc: 'Jumia Back To School',   lead: 'Eric', days: 3, total: 6000 },
]

const REQS = [
  { jobId: 'JOB-001',    cat: 'Office Equipment', desc: 'Laptop Purchase', total: 375000 },
  { jobId: 'JOB-123',    cat: 'Venue',            desc: 'Tents',           total: 25000  },
  { jobId: 'JOB-123',    cat: 'Venue',            desc: 'Tents',           total: 25000  },
  { jobId: 'Jumia-Test', cat: '-',                desc: 'Test Item',       total: 5000   },
  { jobId: 'JOB-012',    cat: 'Staffing',         desc: 'Casuals',         total: 15000  },
  { jobId: 'JOB-012',    cat: 'Staffing',         desc: 'Casuals',         total: 15000  },
  { jobId: 'JOB-012',    cat: 'Staffing',         desc: 'Casuals',         total: 15000  },
  { jobId: 'JOB-012',    cat: 'Staffing',         desc: 'Casuals',         total: 15000  },
  { jobId: 'JOB-001',    cat: 'Logistics',        desc: 'Transport',       total: 90000  },
]

const RECCEES = [
  { jobId: 'JOB-001', client: 'Jumia',     date: '2026-02-10', location: 'Kasarani', pm: 'Kevin' },
  { jobId: 'JOB-003', client: 'NCBA',      date: '2026-02-12', location: 'KICC',     pm: 'Eric'  },
  { jobId: 'JOB-007', client: 'Safaricom', date: '2026-03-10', location: 'Kasarani', pm: 'Faith' },
  { jobId: 'JOB-005', client: 'Agency63',  date: '2026-03-15', location: 'Naivasha', pm: 'Faith' },
]

// ─── Design tokens (matches sidebar exactly) ──────────────────────────────────
const C = {
  bg:          '#ffffff',
  pageBg:      '#f5f7fa',   // very light grey — the "canvas" behind cards
  panel:       '#ffffff',
  border:      '#e5e5e5',   // sidebar border colour
  blue:        '#248afd',   // sidebar accent
  blueLight:   '#eef4ff',   // sidebar active-item bg
  blueDim:     'rgba(36,138,253,0.10)',
  blueBorder:  'rgba(36,138,253,0.25)',
  text:        '#111827',
  textMid:     '#374151',
  textMuted:   '#6b7280',
  textFaint:   '#9ca3af',
  green:       '#16a34a',
  greenLight:  '#f0fdf4',
  greenBorder: '#bbf7d0',
  amber:       '#d97706',
  amberLight:  '#fffbeb',
  amberBorder: '#fde68a',
  red:         '#dc2626',
  redLight:    '#fef2f2',
  redBorder:   '#fecaca',
  purple:      '#7c3aed',
  purpleLight: '#f5f3ff',
}

const CLIENT_COLOR: Record<string, string> = {
  Jumia: '#f59e0b', KCB: '#248afd', NCBA: '#7c3aed', KTN: '#0891b2',
  Agency63: '#248afd', PrimeEdge: '#6366f1', Safaricom: '#16a34a',
  Cocacola: '#dc2626', NYS: '#ea580c', Colgate: '#db2777',
  'SAF VS Airtel': '#0d9488', 'Agency 63': '#248afd',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

const fmtKES = (n: number) => 'KES ' + n.toLocaleString('en-KE')

// ─── Shared styles ────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: C.panel,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: '18px 20px',
}

const thS: React.CSSProperties = {
  padding: '9px 12px',
  fontSize: 11,
  fontWeight: 700,
  color: C.textMuted,
  letterSpacing: '0.6px',
  textTransform: 'uppercase',
  textAlign: 'left',
  borderBottom: `1px solid ${C.border}`,
  whiteSpace: 'nowrap',
  background: '#f9fafb',
}

const tdS: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: 13,
  color: C.textMid,
  borderBottom: `1px solid #f3f4f6`,
  verticalAlign: 'middle',
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { bg: string; color: string; border: string }> = {
  'Event Creation': { bg: C.blueLight,   color: C.blue,   border: C.blueBorder   },
  'Event Update':   { bg: C.amberLight,  color: C.amber,  border: C.amberBorder  },
  'Live':           { bg: C.greenLight,  color: C.green,  border: C.greenBorder  },
  'Completed':      { bg: '#f3f4f6',     color: '#6b7280',border: '#d1d5db'      },
  'Cancelled':      { bg: C.redLight,    color: C.red,    border: C.redBorder    },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP['Completed']
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 4, padding: '2px 8px', fontSize: 11,
      fontFamily: 'Georgia, serif', whiteSpace: 'nowrap', fontWeight: 600,
    }}>
      {status}
    </span>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent, icon }: {
  label: string; value: string; sub: string; accent: string; icon: React.ReactNode
}) {
  return (
    <div style={{
      ...card,
      flex: 1,
      borderTop: `3px solid ${accent}`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>
            {label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.text, lineHeight: 1, fontFamily: 'Georgia, serif' }}>
            {value}
          </div>
          <div style={{ fontSize: 12, color: C.textFaint, marginTop: 5 }}>{sub}</div>
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

// ─── Shortcut Card ────────────────────────────────────────────────────────────
function ShortcutCard({ label, value, sub, accent, onClick }: {
  label: string; value: string; sub: string; accent: string; onClick?: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...card,
        padding: '14px 16px',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
        border: `1px solid ${hov ? accent : C.border}`,
        background: hov ? `${accent}08` : C.panel,
        transition: 'all .15s',
        borderLeft: `4px solid ${accent}`,
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700, color: accent, fontFamily: 'Georgia, serif' }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: C.textFaint, marginTop: 2 }}>{sub}</div>
    </button>
  )
}

// ─── Kanban ───────────────────────────────────────────────────────────────────
function KanbanCard({ event }: { event: typeof EVENTS[0] }) {
  const color = CLIENT_COLOR[event.client] ?? C.blue
  const dateStr = event.start === event.end
    ? fmtDate(event.start)
    : `${fmtDate(event.start)} – ${fmtDate(event.end)}`

  return (
    <div style={{
      background: '#fafbfc',
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      padding: '11px 13px',
      marginBottom: 8,
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 3, letterSpacing: '0.3px' }}>
        {event.client}
      </div>
      <div style={{ fontSize: 13, color: C.text, marginBottom: 7, lineHeight: 1.4, fontFamily: 'Georgia, serif' }}>
        {event.desc}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
        <span style={{
          background: C.blueLight, border: `1px solid ${C.blueBorder}`,
          color: C.blue, fontSize: 10, borderRadius: 4, padding: '2px 7px', fontWeight: 600,
        }}>
          {event.venue}
        </span>
        <span style={{ fontSize: 10, color: C.textFaint }}>{dateStr}</span>
      </div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 4,
          background: C.blueLight, border: `1px solid ${C.blueBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, color: C.blue,
        }}>
          {event.projectLead.substring(0, 2).toUpperCase()}
        </div>
        <span style={{ fontSize: 11, color: C.textMuted }}>{event.projectLead}</span>
      </div>
    </div>
  )
}

function KanbanCol({ label, events, accent }: { label: string; events: typeof EVENTS; accent: string }) {
  return (
    <div style={{
      background: '#f9fafb',
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: 14,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: C.textMuted }}>
          {label}
        </span>
        <span style={{
          marginLeft: 'auto',
          background: C.panel, border: `1px solid ${C.border}`,
          borderRadius: 4, padding: '1px 7px',
          fontSize: 10, fontWeight: 700, color: C.textMuted,
        }}>
          {events.length}
        </span>
      </div>
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {events.length === 0
          ? <div style={{ color: C.textFaint, fontSize: 12, textAlign: 'center', padding: '20px 0' }}>No events</div>
          : events.map(e => <KanbanCard key={e.id} event={e} />)
        }
      </div>
    </div>
  )
}

// ─── Reccee row ───────────────────────────────────────────────────────────────
function RecceeRow({ event }: { event: typeof EVENTS[0] }) {
  const rec = RECCEES.find(r => r.jobId === event.id)
  const clientColor = CLIENT_COLOR[event.client] ?? C.blue
  return (
    <tr>
      <td style={tdS}>
        <span style={{ fontWeight: 600, color: C.text, fontFamily: 'Georgia, serif' }}>{event.desc}</span>
      </td>
      <td style={tdS}>
        <span style={{ fontWeight: 700, color: clientColor }}>{event.client}</span>
      </td>
      <td style={{ ...tdS, fontSize: 12, color: C.textMuted }}>{rec ? fmtDate(rec.date) : '—'}</td>
      <td style={{ ...tdS, color: C.textMuted }}>{rec ? rec.location : event.venue}</td>
      <td style={{ ...tdS, color: C.textMuted }}>{rec ? rec.pm : '—'}</td>
      <td style={tdS}>
        {rec
          ? <span style={{ background: C.greenLight, color: C.green, border: `1px solid ${C.greenBorder}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>Done</span>
          : <span style={{ background: C.redLight,   color: C.red,   border: `1px solid ${C.redBorder}`,  borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>Missing</span>
        }
      </td>
    </tr>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface DashboardProps {
  user: AppUser
  setActive: (id: PageId) => void
}

export function Dashboard({ setActive }: DashboardProps) {
  const [timelineFilter, setTimelineFilter] = useState<string>('All')

  const totalClaims  = useMemo(() => CLAIMS.reduce((a, c) => a + c.total, 0), [])
  const totalReq     = useMemo(() => REQS.reduce((a, r) => a + r.total, 0), [])
  const activeEvents = useMemo(() => EVENTS.filter(e => e.status === 'Event Creation').length, [])
  const recceeHit    = useMemo(() => EVENTS.filter(e => RECCEES.some(r => r.jobId === e.id)).length, [])

  const kanbanGroups = useMemo(() => ({
    creation:  EVENTS.filter(e => e.status === 'Event Creation'),
    update:    EVENTS.filter(e => e.status === 'Event Update'),
    completed: EVENTS.filter(e => e.status === 'Completed'),
  }), [])

  const filteredTimeline = useMemo(() => {
    const base = [...EVENTS].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    return timelineFilter === 'All' ? base : base.filter(e => e.status === timelineFilter)
  }, [timelineFilter])

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })

  // Proposals snapshot: read from localStorage (same key used by Admin)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin:proposals')
      if (!raw) return
      const props = JSON.parse(raw) as Array<{ status: string; submittedAt: string }>
      const approved = props.filter(p => p.status === 'approved').length
      const delayed = props.filter(p => p.status !== 'approved' && (Date.now() - new Date(p.submittedAt).getTime()) > 72 * 3600 * 1000).length
      const a = document.getElementById('approved-count')
      const d = document.getElementById('delayed-count')
      if (a) a.textContent = String(approved)
      if (d) d.textContent = String(delayed)
    } catch (e) {
      // ignore
    }
  }, [])

  return (
    <div style={{ background: C.pageBg, minHeight: '100vh', fontFamily: "'DM Sans', 'Georgia', sans-serif" }}>

      {/* ── Sticky Top Bar — identical feel to sidebar header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: C.bg,
        borderBottom: `1px solid ${C.blue}`,   // matches sidebar logo border
        padding: '0 28px',
        display: 'flex', alignItems: 'stretch', justifyContent: 'space-between',
      }}>
        {/* Left: breadcrumb + title */}
        <div style={{ padding: '16px 0 14px' }}>
          <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 3 }}>Home / Dashboard</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: 'Georgia, serif', letterSpacing: '-0.3px' }}>
            Dashboard
          </div>
        </div>

        {/* Right: date + search bar + notification */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: C.textFaint }}>{today}</span>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f9fafb', border: `1px solid ${C.border}`,
            borderRadius: 6, padding: '7px 12px', cursor: 'pointer',
          }}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={C.textFaint} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span style={{ fontSize: 12, color: C.textFaint }}>Search</span>
            <span style={{ fontSize: 10, color: C.textFaint, background: C.border, borderRadius: 3, padding: '1px 5px' }}>⌘K</span>
          </div>

          {/* Bell */}
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <div style={{ background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 6, padding: '7px 9px', display: 'flex' }}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={C.textMuted} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div style={{
              position: 'absolute', top: -4, right: -4,
              width: 16, height: 16, background: C.blue, borderRadius: '50%',
              fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700,
            }}>5</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 28px', maxWidth: 1400 }}>

        {/* ── KPI Cards ── */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
          <KpiCard label="Total Events"      value={String(EVENTS.length)} sub="All time registered"   accent={C.blue}   icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} />
          <KpiCard label="Active Events"     value={String(activeEvents)}  sub="Currently in pipeline" accent={C.green}  icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
          <KpiCard label="Total Claims"      value={fmtKES(totalClaims)}  sub="Staff payouts logged"   accent={C.amber}  icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
          <KpiCard label="Requisition Value" value={fmtKES(totalReq)}     sub="Procurement committed"  accent={C.red}    icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} />
        </div>

        {/* ── Proposals Snapshot (from Admin) ── */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
          <div style={{ ...card, minWidth: 260 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 6 }}>Proposals</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Summary</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: C.textFaint }}>Approved</div>
                <div id="approved-count" style={{ fontSize: 16, fontWeight: 700, color: C.green }}>0</div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: C.textFaint, minWidth: 82 }}>Delayed {'>'}72h</div>
              <div id="delayed-count" style={{ fontSize: 13, fontWeight: 700, color: C.red }}>0</div>
            </div>
          </div>
        </div>

        {/* ── Quick Access Shortcuts ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'Georgia, serif', letterSpacing: '-0.2px' }}>
              Quick Access
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <ShortcutCard label="Events"           value={String(EVENTS.length)}     sub="View all activations"    accent={C.blue}   onClick={() => setActive('Events' as PageId)} />
            <ShortcutCard label="Claims"           value={fmtKES(totalClaims)}       sub="Staff pay requests"      accent={C.amber}  onClick={() => setActive('Pay Requests' as PageId)} />
            <ShortcutCard label="Reccee Coverage"  value={`${recceeHit}/${EVENTS.length}`} sub="Sites scouted"    accent={C.green}  onClick={() => setActive('Reports' as PageId)} />
            <ShortcutCard label="Requisitions"     value={String(REQS.length)}       sub="Procurement lines"       accent={C.red}    onClick={() => setActive('Reports' as PageId)} />
          </div>
        </div>

        {/* ── Event Pipeline Kanban ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'Georgia, serif', letterSpacing: '-0.2px' }}>
              Event Pipeline
            </h2>
            <span style={{
              fontSize: 11, fontWeight: 700, color: C.blue,
              background: C.blueLight, border: `1px solid ${C.blueBorder}`,
              borderRadius: 4, padding: '2px 10px',
            }}>
              {EVENTS.length} EVENTS
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <KanbanCol label="Event Creation" events={kanbanGroups.creation}  accent={C.blue}  />
            <KanbanCol label="Event Update"   events={kanbanGroups.update}    accent={C.amber} />
            <KanbanCol label="Completed"      events={kanbanGroups.completed} accent={C.green} />
          </div>
        </div>

        {/* ── Upcoming Events + Reccee Coverage ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* Upcoming Events list */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'Georgia, serif' }}>Upcoming Events</h2>
              <div style={{ display: 'flex', gap: 5 }}>
                {['All', 'Event Creation', 'Event Update'].map(f => (
                  <button
                    key={f}
                    onClick={() => setTimelineFilter(f)}
                    style={{
                      background: timelineFilter === f ? C.blueLight : 'transparent',
                      border: `1px solid ${timelineFilter === f ? C.blueBorder : C.border}`,
                      color: timelineFilter === f ? C.blue : C.textMuted,
                      borderRadius: 4, padding: '3px 9px',
                      fontSize: 10, fontWeight: 700,
                      cursor: 'pointer', letterSpacing: '0.4px',
                    }}
                  >
                    {f === 'Event Creation' ? 'Active' : f === 'Event Update' ? 'Updated' : 'All'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 340, overflowY: 'auto' }}>
              {filteredTimeline.map(e => {
                const color = CLIENT_COLOR[e.client] ?? C.blue
                return (
                  <div key={e.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '9px 12px', borderRadius: 6,
                    background: '#fafbfc', border: `1px solid ${C.border}`,
                    borderLeft: `3px solid ${color}`,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
{e.client}
                      </div>
                      <div style={{ fontSize: 13, color: C.text, fontFamily: 'Georgia, serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.desc}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      <span style={{ fontSize: 11, color: C.textFaint }}>{fmtDate(e.start)}</span>
                      <StatusBadge status={e.status} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Reccee Coverage table */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'Georgia, serif' }}>Reccee Coverage</h2>
              <span style={{
                fontSize: 11, fontWeight: 700, color: C.green,
                background: C.greenLight, border: `1px solid ${C.greenBorder}`,
                borderRadius: 4, padding: '2px 10px',
              }}>
                {recceeHit}/{EVENTS.length} DONE
              </span>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 340 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Event', 'Client', 'Date', 'PM', 'Loc.', 'Status'].map(h => <th key={h} style={thS}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {EVENTS.slice(0, 10).map(e => <RecceeRow key={e.id} event={e} />)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Recent Claims ── */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'Georgia, serif' }}>Recent Claims</h2>
            <button
              onClick={() => setActive('Pay Requests' as PageId)}
              style={{
                background: C.blueLight, border: `1px solid ${C.blueBorder}`,
                color: C.blue, borderRadius: 6, padding: '5px 12px',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              View All →
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Job ID', 'Description', 'Project Lead', 'Days Worked', 'Total Pay'].map(h => <th key={h} style={thS}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {CLAIMS.map((c, i) => (
                <tr key={i}>
                  <td style={{ ...tdS, fontSize: 12, color: C.blue, fontWeight: 700 }}>{c.jobId}</td>
                  <td style={{ ...tdS, fontFamily: 'Georgia, serif' }}>{c.desc}</td>
                  <td style={tdS}>
                    <span style={{
                      background: C.blueLight, border: `1px solid ${C.blueBorder}`,
                      color: C.blue, borderRadius: 4, padding: '2px 7px',
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {c.lead}
                    </span>
                  </td>
                  <td style={{ ...tdS, color: C.textMuted, textAlign: 'center' }}>{c.days}</td>
                  <td style={{ ...tdS, fontWeight: 700, color: C.green }}>{fmtKES(c.total)}</td>
                </tr>
              ))}
              {/* Grand total row */}
              <tr style={{ borderTop: `2px solid ${C.amber}`, background: C.amberLight }}>
                <td colSpan={4} style={{ ...tdS, fontWeight: 700, fontSize: 12, color: C.amber, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Grand Total
                </td>
                <td style={{ ...tdS, fontWeight: 700, color: C.amber, fontSize: 14, fontFamily: 'Georgia, serif' }}>
                  {fmtKES(totalClaims)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}