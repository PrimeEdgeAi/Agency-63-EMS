import { useState, useMemo } from 'react'
import type { PageId, AppUser } from '../../types'

// ─── Data ────────────────────────────────────────────────────────────────────

const EVENTS = [
  { id: 'JOB-001', desc: 'Jumia VS KCB',          client: 'Jumia',        venue: 'Kasarani',       start: '2026-02-20', end: '2026-02-22', clientLead: 'Kevin', projectLead: 'Eric',  status: 'Event Creation' },
  { id: 'JOB-002', desc: 'KCB VS Stanbic',         client: 'KCB',          venue: 'Nyayo Stadium',  start: '2026-02-21', end: '2026-02-21', clientLead: 'Martin',projectLead: 'Eric',  status: 'Event Creation' },
  { id: 'JOB-003', desc: 'NCBA VS KCB',            client: 'NCBA',         venue: 'KICC',           start: '2026-02-21', end: '2026-02-22', clientLead: 'Kevin', projectLead: 'Eric',  status: 'Event Creation' },
  { id: 'JOB-004', desc: 'KTN VS NTV',             client: 'KTN',          venue: 'KICC',           start: '2026-02-27', end: '2026-02-28', clientLead: 'Eric',  projectLead: 'Kevin', status: 'Event Creation' },
  { id: 'JOB-005', desc: 'KCB Safari Rally',       client: 'Agency63',     venue: 'Naivasha',       start: '2026-03-28', end: '2026-03-29', clientLead: 'Faith', projectLead: 'Eric',  status: 'Event Creation' },
  { id: 'JOB-006', desc: 'Safari Rally',           client: 'PrimeEdge',    venue: 'KICC',           start: '2026-03-28', end: '2026-03-29', clientLead: 'Kevin', projectLead: 'Eric',  status: 'Event Update'   },
  { id: 'JOB-007', desc: 'Safaricom 25 Years',     client: 'Safaricom',    venue: 'Kasarani',       start: '2026-03-26', end: '2026-03-27', clientLead: 'Faith', projectLead: 'John',  status: 'Event Creation' },
  { id: 'JOB-008', desc: 'Coke vs Pepsi',          client: 'Cocacola',     venue: 'Talanta Stadium',start: '2026-03-28', end: '2026-03-29', clientLead: 'Kevin', projectLead: 'Eric',  status: 'Event Creation' },
  { id: 'JOB-009', desc: 'NYS VS Gor',             client: 'NYS',          venue: 'Kasarani',       start: '2026-03-28', end: '2026-03-28', clientLead: 'Kevin', projectLead: 'John',  status: 'Event Creation' },
  { id: 'JOB-010', desc: 'KCB BIZ',               client: 'KCB',          venue: 'Mombasa',        start: '2026-03-28', end: '2026-03-30', clientLead: 'Tonny', projectLead: 'Kevin', status: 'Event Creation' },
  { id: 'JOB-011', desc: 'Jumia Sale Launch',      client: 'Jumia',        venue: 'Kasarani',       start: '2026-04-10', end: '2026-04-12', clientLead: 'Kevin', projectLead: 'Eric',  status: 'Event Update'   },
  { id: 'JOB-012', desc: 'Colgate Back to School', client: 'Colgate',      venue: 'Westgate Mall',  start: '2026-05-08', end: '2026-05-12', clientLead: 'Marvin',projectLead: 'Eric',  status: 'Event Creation' },
  { id: 'JOB-013', desc: 'Saf vs Airtel',          client: 'SAF VS Airtel',venue: 'KICC',           start: '2026-04-17', end: '2026-04-18', clientLead: 'Tonny', projectLead: 'Kevin', status: 'Event Creation' },
  { id: 'JOB-014', desc: 'Agency 63 Activation',   client: 'Agency 63',    venue: 'Westgate Mall',  start: '2026-04-18', end: '2026-04-19', clientLead: 'Marvin',projectLead: 'Eric',  status: 'Event Creation' },
  { id: 'JOB-015', desc: 'Jumia Back To School',   client: 'Jumia',        venue: 'Westgate Mall',  start: '2026-04-24', end: '2026-04-26', clientLead: 'John',  projectLead: 'Eric',  status: 'Event Creation' },
  { id: 'JOB-016', desc: 'KCB Back To School',     client: 'KCB',          venue: 'Mercy',          start: '2026-04-24', end: '2026-04-26', clientLead: 'John',  projectLead: 'Eric',  status: 'Event Creation' },
]

const CLAIMS = [
  { jobId: 'JOB-2024-001', desc: 'Jumia Flash Sale Event',  lead: 'Eric', days: 3, total: 6000 },
  { jobId: 'JOB-2024-001', desc: 'Jumia Flash Sale Event',  lead: 'Eric', days: 3, total: 6000 },
  { jobId: 'JOB-003',      desc: 'NCBA VS KCB',             lead: 'Eric', days: 2, total: 4000 },
  { jobId: 'JOB-003',      desc: 'NCBA VS KCB',             lead: 'Eric', days: 2, total: 4000 },
  { jobId: 'JOB-014',      desc: 'Agency 63 Activation',    lead: 'Eric', days: 2, total: 4000 },
  { jobId: 'JOB-015',      desc: 'Jumia Back To School',    lead: 'Eric', days: 3, total: 6000 },
]

const REQS = [
  { jobId: 'JOB-001',      cat: 'Office Equipment', desc: 'Laptop Purchase', total: 375000 },
  { jobId: 'JOB-123',      cat: 'Venue',            desc: 'Tents',           total: 25000  },
  { jobId: 'JOB-123',      cat: 'Venue',            desc: 'Tents',           total: 25000  },
  { jobId: 'Jumia-Test',   cat: '-',                desc: 'Test Item',       total: 5000   },
  { jobId: 'JOB-012',      cat: 'Staffing',         desc: 'Casuals',         total: 15000  },
  { jobId: 'JOB-012',      cat: 'Staffing',         desc: 'Casuals',         total: 15000  },
  { jobId: 'JOB-012',      cat: 'Staffing',         desc: 'Casuals',         total: 15000  },
  { jobId: 'JOB-012',      cat: 'Staffing',         desc: 'Casuals',         total: 15000  },
  { jobId: 'JOB-001',      cat: 'Logistics',        desc: 'Transport',       total: 90000  },
]

const RECCEES = [
  { jobId: 'JOB-001', client: 'Jumia',    date: '2026-02-10', location: 'Kasarani', pm: 'Kevin' },
  { jobId: 'JOB-003', client: 'NCBA',     date: '2026-02-12', location: 'KICC',     pm: 'Eric'  },
  { jobId: 'JOB-007', client: 'Safaricom',date: '2026-03-10', location: 'Kasarani', pm: 'Faith' },
  { jobId: 'JOB-005', client: 'Agency63', date: '2026-03-15', location: 'Naivasha', pm: 'Faith' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

const fmtKES = (n: number) =>
  'KES ' + n.toLocaleString('en-KE')

const CLIENT_COLOR: Record<string, string> = {
  Jumia: '#F59E0B', KCB: '#3B82F6', NCBA: '#8B5CF6', KTN: '#06B6D4',
  Agency63: '#248afd', PrimeEdge: '#6366F1', Safaricom: '#22C55E',
  Cocacola: '#EF4444', NYS: '#F97316', Colgate: '#EC4899',
  'SAF VS Airtel': '#14B8A6', 'Agency 63': '#248afd',
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  'Event Creation': { bg: 'rgba(36,138,253,0.12)', color: '#60a5fa', border: 'rgba(36,138,253,0.3)' },
  'Event Update':   { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  'Live':           { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80', border: 'rgba(34,197,94,0.3)'  },
  'Completed':      { bg: 'rgba(100,116,139,0.2)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)'},
  'Cancelled':      { bg: 'rgba(239,68,68,0.12)',  color: '#f87171', border: 'rgba(239,68,68,0.3)'  },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE['Completed']
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 4, padding: '2px 8px', fontSize: 11,
      fontFamily: "'DM Mono', monospace", letterSpacing: '0.4px',
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  )
}

function KpiCard({ label, value, sub, accent, icon }: {
  label: string; value: string; sub: string; accent: string; icon: React.ReactNode
}) {
  return (
    <div style={{
      background: '#0F1623', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 8, padding: '20px 20px 16px', position: 'relative', overflow: 'hidden', flex: 1,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 10, color: '#4A5568', fontFamily: "'DM Mono', monospace", letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
            {label}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 26, fontWeight: 500, color: '#F0F4FF', lineHeight: 1 }}>
            {value}
          </div>
          <div style={{ fontSize: 11, color: '#4A5568', marginTop: 6 }}>{sub}</div>
        </div>
        <div style={{ color: accent, opacity: 0.6, marginTop: 2 }}>{icon}</div>
      </div>
    </div>
  )
}

function KanbanCard({ event }: { event: typeof EVENTS[0] }) {
  const color = CLIENT_COLOR[event.client] ?? '#4A5568'
  const dateStr = event.start === event.end
    ? fmtDate(event.start)
    : `${fmtDate(event.start)} → ${fmtDate(event.end)}`

  return (
    <div style={{
      background: '#0F1623', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 6, padding: '12px 14px', marginBottom: 8,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 3, letterSpacing: '0.3px' }}>
        {event.client}
      </div>
      <div style={{ fontSize: 13, color: '#F0F4FF', marginBottom: 8, lineHeight: 1.4 }}>
        {event.desc}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <span style={{
          background: 'rgba(36,138,253,0.1)', border: '1px solid rgba(36,138,253,0.22)',
          color: '#60a5fa', fontSize: 10, fontFamily: "'DM Mono', monospace",
          borderRadius: 4, padding: '2px 7px',
        }}>
          {event.venue}
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#4A5568' }}>
          {dateStr}
        </span>
      </div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 4, background: `${color}22`,
          border: `1px solid ${color}44`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 9, fontFamily: "'DM Mono', monospace", color,
        }}>
          {event.projectLead.substring(0, 2).toUpperCase()}
        </div>
        <span style={{ fontSize: 11, color: '#4A5568' }}>{event.projectLead}</span>
      </div>
    </div>
  )
}

function KanbanCol({ label, events, accent }: { label: string; events: typeof EVENTS; accent: string }) {
  return (
    <div style={{
      background: '#0B1120', border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 8, padding: 14, minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent, flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: '1px', textTransform: 'uppercase', color: '#94a3b8' }}>
          {label}
        </span>
        <span style={{
          marginLeft: 'auto', background: 'rgba(255,255,255,0.05)',
          borderRadius: 4, padding: '1px 7px', fontSize: 10,
          fontFamily: "'DM Mono', monospace", color: '#4A5568',
        }}>
          {events.length}
        </span>
      </div>
      <div style={{ maxHeight: 420, overflowY: 'auto' }}>
        {events.length === 0
          ? <div style={{ color: '#4A5568', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>No events</div>
          : events.map(e => <KanbanCard key={e.id} event={e} />)
        }
      </div>
    </div>
  )
}

function RecceeRow({ event }: { event: typeof EVENTS[0] }) {
  const rec = RECCEES.find(r => r.jobId === event.id)
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <td style={tdStyle}>{event.desc}</td>
      <td style={{ ...tdStyle, color: CLIENT_COLOR[event.client] ?? '#F0F4FF', fontWeight: 600 }}>{event.client}</td>
      <td style={{ ...tdStyle, fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#94a3b8' }}>
        {rec ? fmtDate(rec.date) : '—'}
      </td>
      <td style={{ ...tdStyle, color: '#94a3b8' }}>{rec ? rec.location : event.venue}</td>
      <td style={{ ...tdStyle, color: '#94a3b8' }}>{rec ? rec.pm : '—'}</td>
      <td style={tdStyle}>
        {rec
          ? <span style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontFamily: "'DM Mono', monospace" }}>Done</span>
          : <span style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontFamily: "'DM Mono', monospace" }}>Missing</span>
        }
      </td>
    </tr>
  )
}

const tdStyle: React.CSSProperties = {
  padding: '11px 12px', color: '#F0F4FF', fontSize: 13, verticalAlign: 'middle',
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px', color: '#4A5568', fontSize: 10,
  fontFamily: "'DM Mono', monospace", letterSpacing: '1px',
  textTransform: 'uppercase', textAlign: 'left',
  borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap',
}

// ─── Shortcut Card ────────────────────────────────────────────────────────────

function ShortcutCard({ label, value, sub, accent, onClick }: {
  label: string; value: string; sub: string; accent: string; onClick?: () => void
}) {
  return (
    <button onClick={onClick} style={{
      background: '#0F1623', border: `1px solid rgba(255,255,255,0.06)`,
      borderRadius: 8, padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
      width: '100%', transition: 'border-color .15s, background .15s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = `${accent}55`; (e.currentTarget as HTMLButtonElement).style.background = `${accent}08` }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.background = '#0F1623' }}
    >
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 500, color: accent }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#F0F4FF', marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#4A5568', marginTop: 2 }}>{sub}</div>
    </button>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

interface DashboardProps {
  user: AppUser
  setActive: (id: PageId) => void
}

export function Dashboard({ setActive }: DashboardProps) {
  const [kanbanFilter, setKanbanFilter] = useState<string>('All')

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
    if (kanbanFilter === 'All') return base
    return base.filter(e => e.status === kanbanFilter)
  }, [kanbanFilter])

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#080C14', color: '#F0F4FF' }}>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        .kb-row:hover td{background:rgba(36,138,253,0.05)!important}
      `}</style>

      {/* ── Sticky Top Bar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: '#080C14', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <div style={{ width: 5, height: 20, background: '#248afd', borderRadius: 2 }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500, color: '#F0F4FF', letterSpacing: '0.5px' }}>
              BTL <span style={{ color: '#248afd' }}>Command</span> Center
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#4A5568', fontFamily: "'DM Mono', monospace", letterSpacing: '0.5px' }}>
            {today}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Notification bell */}
          <div style={{ position: 'relative', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '7px 9px', display: 'flex' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: '#248afd', borderRadius: '50%', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono', monospace" }}>5</div>
          </div>
          {/* Search shortcut */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4A5568" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span style={{ fontSize: 12, color: '#4A5568', fontFamily: "'DM Mono', monospace" }}>Search</span>
            <span style={{ fontSize: 10, color: '#4A5568', background: 'rgba(255,255,255,0.06)', borderRadius: 3, padding: '1px 5px', fontFamily: "'DM Mono', monospace" }}>⌘K</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 28px', maxWidth: 1400 }}>

        {/* ── KPI Strip ── */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
          <KpiCard
            label="Total Events" value={String(EVENTS.length)} sub="All time registered" accent="#248afd"
            icon={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          />
          <KpiCard
            label="Active Events" value={String(activeEvents)} sub="Currently in pipeline" accent="#22C55E"
            icon={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          />
          <KpiCard
            label="Total Claims" value={fmtKES(totalClaims)} sub="Staff payouts logged" accent="#F5A623"
            icon={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          />
          <KpiCard
            label="Requisition Value" value={fmtKES(totalReq)} sub="Procurement committed" accent="#EF4444"
            icon={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
          />
        </div>

        {/* ── Quick Access Shortcuts ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: '#F0F4FF', letterSpacing: '0.5px' }}>
              Quick Access
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <ShortcutCard label="Events" value={String(EVENTS.length)} sub="View all events" accent="#248afd" onClick={() => setActive('Events' as PageId)} />
            <ShortcutCard label="Claims" value={fmtKES(totalClaims)} sub="Staff pay claims" accent="#F5A623" onClick={() => setActive('Pay Requests' as PageId)} />
            <ShortcutCard label="Reccee Coverage" value={`${recceeHit}/${EVENTS.length}`} sub="Sites scouted" accent="#22C55E" onClick={() => setActive('Reports' as PageId)} />
            <ShortcutCard label="Requisitions" value={`${REQS.length}`} sub="Procurement lines" accent="#EF4444" onClick={() => setActive('Reports' as PageId)} />
          </div>
        </div>

        {/* ── Kanban Pipeline ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: '#F0F4FF', letterSpacing: '0.5px' }}>
              Event Pipeline
            </span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#248afd', background: 'rgba(36,138,253,0.1)', border: '1px solid rgba(36,138,253,0.2)', borderRadius: 4, padding: '2px 8px' }}>
              {EVENTS.length} TOTAL
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            <KanbanCol label="Event Creation" events={kanbanGroups.creation}  accent="#248afd" />
            <KanbanCol label="Event Update"   events={kanbanGroups.update}    accent="#F59E0B" />
            <KanbanCol label="Completed"      events={kanbanGroups.completed} accent="#22C55E" />
          </div>
        </div>

        {/* ── Timeline + Reccee split ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* Upcoming Timeline */}
          <div style={{ background: '#0F1623', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: '#F0F4FF' }}>Upcoming Events</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['All', 'Event Creation', 'Event Update'].map(f => (
                  <button key={f} onClick={() => setKanbanFilter(f)} style={{
                    background: kanbanFilter === f ? 'rgba(36,138,253,0.15)' : 'transparent',
                    border: `1px solid ${kanbanFilter === f ? 'rgba(36,138,253,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    color: kanbanFilter === f ? '#60a5fa' : '#4A5568',
                    borderRadius: 4, padding: '3px 10px', fontSize: 10, cursor: 'pointer',
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {f === 'All' ? 'All' : f === 'Event Creation' ? 'Active' : 'Updated'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 340, overflowY: 'auto' }}>
              {filteredTimeline.map(e => {
                const color = CLIENT_COLOR[e.client] ?? '#4A5568'
                return (
                  <div key={e.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '9px 12px', borderRadius: 6,
                    background: `${color}0D`, border: `1px solid ${color}22`,
                  }}>
                    <div style={{ width: 3, height: 36, background: color, borderRadius: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.client}
                      </div>
                      <div style={{ fontSize: 12, color: '#F0F4FF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.desc}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#4A5568' }}>{fmtDate(e.start)}</div>
                      <div style={{ marginTop: 4 }}><StatusBadge status={e.status} /></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Reccee Coverage */}
          <div style={{ background: '#0F1623', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: '#F0F4FF' }}>Reccee Coverage</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#22C55E', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 4, padding: '2px 8px' }}>
                {recceeHit}/{EVENTS.length} DONE
              </span>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 340 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Event', 'Client', 'Reccee Date', 'PM', 'Status'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EVENTS.slice(0, 10).map(e => <RecceeRow key={e.id} event={e} />)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Recent Claims ── */}
        <div style={{ background: '#0F1623', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: '#F0F4FF' }}>Recent Claims</span>
            <button
              onClick={() => setActive('Pay Requests' as PageId)}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '5px 12px', color: '#4A5568', fontSize: 11, cursor: 'pointer', fontFamily: "'DM Mono', monospace' }" }}
            >
              View All →
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Job ID', 'Description', 'Lead', 'Days', 'Total Pay'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLAIMS.map((c, i) => (
                <tr key={i} className="kb-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ ...tdStyle, fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#248afd' }}>{c.jobId}</td>
                  <td style={tdStyle}>{c.desc}</td>
                  <td style={tdStyle}>
                    <span style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.2)', color: '#F5A623', borderRadius: 4, padding: '2px 7px', fontSize: 10, fontFamily: "'DM Mono', monospace" }}>
                      {c.lead}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: "'DM Mono', monospace", color: '#94a3b8' }}>{c.days}</td>
                  <td style={{ ...tdStyle, fontFamily: "'DM Mono', monospace", color: '#4ade80', fontWeight: 500 }}>{fmtKES(c.total)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid rgba(245,166,35,0.4)', background: 'rgba(245,166,35,0.04)' }}>
                <td colSpan={4} style={{ ...tdStyle, color: '#F5A623', fontFamily: "'DM Mono', monospace", fontWeight: 600, fontSize: 11, letterSpacing: '1px' }}>GRAND TOTAL</td>
                <td style={{ ...tdStyle, color: '#F5A623', fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{fmtKES(totalClaims)}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}