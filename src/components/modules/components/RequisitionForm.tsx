import { useState, useEffect, useRef } from 'react'
import { FiCheck, FiPlus, FiTrash2 } from 'react-icons/fi'
import { supabase } from '../../../lib/supabase'

const SHEET_CSV_URL       = 'https://docs.google.com/spreadsheets/d/1AO-06SYVS_uVnBWkM5smUFeSoTWUeq0GbFvX7tJr3oE/export?format=csv&gid=0'
const REQUISITION_WEBHOOK = 'https://primeedgeai.app.n8n.cloud/webhook/requisition-request'

const CATEGORIES = ['Equipment', 'Supplies & Materials', 'Services', 'Transport & Logistics', 'Catering', 'Marketing & Print', 'Venue', 'Staffing', 'Other']
const URGENCY    = ['Low', 'Medium', 'High', 'Urgent']

// ─── CSV helpers ─────────────────────────────────────────────────────────────
function parseCSV(text: string) {
  const rows: string[][] = []; let row: string[] = [], field = '', inQ = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], nx = text[i + 1]
    if (inQ) { if (ch === '"' && nx === '"') { field += '"'; i++ } else if (ch === '"') { inQ = false } else { field += ch } }
    else { if (ch === '"') { inQ = true } else if (ch === ',') { row.push(field.trim()); field = '' } else if (ch === '\n') { row.push(field.trim()); rows.push(row); row = []; field = '' } else if (ch !== '\r') { field += ch } }
  }
  if (field || row.length) { row.push(field.trim()); rows.push(row) }
  return rows
}
function csvToObj(rows: string[][]) {
  if (rows.length < 2) return []
  const h = rows[0]
  return rows.slice(1).filter(r => r.some(c => c)).map(r => { const o: Record<string, string> = {}; h.forEach((k, i) => { o[k.trim()] = (r[i] || '').trim() }); return o })
}
function emailMatch(email: string, row: Record<string, string>) {
  const n = email.toLowerCase()
  if ((row['Email'] || '').toLowerCase().split(',').map(e => e.trim()).includes(n)) return true
  if ((row['Project Assistant Email'] || '').toLowerCase().split(',').map(e => e.trim()).includes(n)) return true
  return false
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Job = Record<string, string>
type LineItem = { id: number; description: string; supplier: string; category: string; qty: number; days: number; unitCost: number }

const inp: React.CSSProperties = { width: '100%', fontSize: 13, padding: '9px 12px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.15)', background: '#fff', color: '#111', outline: 'none', boxSizing: 'border-box' }

const sectionLabel = (text: string) => (
  <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#aaa', fontWeight: 600, marginBottom: 14, marginTop: 24, paddingBottom: 6, borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
    {text}
  </div>
)

type Props = { companyName: string; onBack: () => void }

export function RequisitionForm({ companyName, onBack }: Props) {
  // job lookup
  const [lookupEmail, setLookupEmail]   = useState('')
  const [jobs, setJobs]                 = useState<Job[]>([])
  const [selectedJob, setSelectedJob]   = useState<Job | null>(null)
  const [loadingJobs, setLoadingJobs]   = useState(false)
  const [jobMsg, setJobMsg]             = useState('')
  const [jobMsgType, setJobMsgType]     = useState<'ok' | 'err' | ''>('')
  const jobRef = useRef<HTMLDivElement | null>(null)

  // requestor
  const [reqName, setReqName]           = useState('')
  const [reqEmail, setReqEmail]         = useState('')
  const [dateRequired, setDateRequired] = useState('')

  // auto-load jobs for logged-in user
  useEffect(() => {
    const init = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const sessionEmail = sessionData?.session?.user?.email ?? ''
        if (sessionEmail) {
          setLookupEmail(sessionEmail)
          await loadJobs()
        }
      } catch (e) {
        // ignore
      }
    }
    init()
  }, [])

  // line items
  const [lineItems, setLineItems]       = useState<LineItem[]>([{ id: 1, description: '', supplier: '', category: '', qty: 1, days: 1, unitCost: 0 }])
  const [nextId, setNextId]             = useState(2)

  // justification
  const [justification, setJustification] = useState('')
  const [notes, setNotes]               = useState('')
  const [urgency, setUrgency]           = useState('')

  // submission
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState('')
  const [submitted, setSubmitted]       = useState(false)
  const [ref, setRef]                   = useState('')

  // ── Load jobs ──
  async function loadJobs() {
    setJobMsg(''); setJobMsgType(''); setJobs([]); setSelectedJob(null)
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lookupEmail)
    if (!valid) { setJobMsg('Enter a valid email first.'); setJobMsgType('err'); return }
    setLoadingJobs(true); setJobMsg('Fetching your assigned jobs…')
    try {
      const res = await fetch(SHEET_CSV_URL)
      if (!res.ok) throw new Error('Could not fetch jobs sheet.')
      const all = csvToObj(parseCSV(await res.text()))
      const matched = all.filter(r => emailMatch(lookupEmail.toLowerCase(), r))
      if (!matched.length) throw new Error(`No jobs found for "${lookupEmail}".`)
      setJobs(matched)
      setJobMsg(`${matched.length} job${matched.length !== 1 ? 's' : ''} found — tap one to select.`)
      setJobMsgType('ok')
    } catch (e: any) { setJobMsg(e.message); setJobMsgType('err') }
    finally { setLoadingJobs(false) }
  }

  // visible account label helper
  const accountLabel = lookupEmail ? (
    <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>Using account: <span style={{ fontWeight: 600 }}>{lookupEmail}</span></div>
  ) : null

  // ── Line item helpers ──
  function addLine() {
    setLineItems(prev => [...prev, { id: nextId, description: '', supplier: '', category: '', qty: 1, days: 1, unitCost: 0 }])
    setNextId(n => n + 1)
  }
  function removeLine(id: number) { setLineItems(prev => prev.filter(li => li.id !== id)) }
  function updateLine(id: number, field: keyof LineItem, value: string | number) {
    setLineItems(prev => prev.map(li => li.id === id ? { ...li, [field]: value } : li))
  }
  function lineTotal(li: LineItem) { return li.qty * li.days * li.unitCost }
  function grandTotal() { return lineItems.reduce((sum, li) => sum + lineTotal(li), 0) }
  function fmt(n: number) { return 'KES ' + n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

  // ── Submit ──
  async function submit() {
    setError('')
    if (!selectedJob) { setError('Please select a job from the lookup above.'); return }
    if (!reqName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reqEmail) || !dateRequired) { setError('Please fill in all requestor fields.'); return }
    if (!justification.trim()) { setError('Business justification is required.'); return }
    if (!urgency) { setError('Please select an urgency level.'); return }

    setSubmitting(true)
    const payload = {
      company:           companyName,
      job_id:            selectedJob['Job_ID'],
      client:            selectedJob['Client'],
      event_description: selectedJob['Description'],
      requestor_name:    reqName.trim(),
      requestor_email:   reqEmail.trim(),
      date_required:     dateRequired,
      line_items:        lineItems.map(li => ({ ...li, total: lineTotal(li) })),
      total_amount:      grandTotal(),
      justification:     justification.trim(),
      notes:             notes.trim(),
      urgency,
      submitted_at:      new Date().toISOString(),
    }
    try {
      await fetch(REQUISITION_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      setRef('REQ-' + Date.now().toString(36).toUpperCase())
      setSubmitted(true)
    } catch { setError('Submission failed. Please try again.') }
    finally { setSubmitting(false) }
  }

  // ── Success ──
  if (submitted) return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🧾</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 6 }}>Requisition Submitted!</div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Your request has been sent to the approvals team.</div>
      <div style={{ fontSize: 12, color: '#aaa', fontFamily: 'monospace', marginBottom: 4 }}>{ref}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 24 }}>{fmt(grandTotal())}</div>
      <button onClick={onBack} style={{ fontSize: 13, padding: '8px 20px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', cursor: 'pointer' }}>← Back to menu</button>
    </div>
  )

  return (
    <div>
      {/* ── Job Lookup ── */}
+      {step === 1 && (
+        <>
+          {sectionLabel('Job Lookup')}
+          <div style={{ background: 'rgba(0,0,0,0.02)', border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 10, padding: '16px', marginBottom: 8 }}>
+            {accountLabel}
+            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, alignItems: 'flex-end', marginBottom: 10 }}>
+              <button type="button" onClick={loadJobs} disabled={loadingJobs}
+                style={{ fontSize: 13, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' as const, opacity: loadingJobs ? 0.6 : 1 }}>
+                {loadingJobs ? 'Loading…' : 'Load Jobs'}
+              </button>
+            </div>
+            {jobMsg && <div style={{ fontSize: 12, color: jobMsgType === 'err' ? '#e74c3c' : '#3B6D11', marginBottom: jobs.length ? 12 : 0 }}>{jobMsg}</div>}
+            {jobs.length > 0 && (
+              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
+                {jobs.map((job, i) => {
+                  const isSelected = selectedJob?.['Job_ID'] === job['Job_ID']
+                  return (
+                    <div key={i} onClick={() => { setSelectedJob(job); setJobMsg(''); setJobMsgType('ok'); setStep(2) }}
+                      style={{ padding: '10px 14px', borderRadius: 8, border: `0.5px solid ${isSelected ? '#111' : 'rgba(0,0,0,0.12)'}`, background: isSelected ? '#f8f8f6' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
+                      <div>
+                        <div style={{ fontSize: 11, color: '#888', fontFamily: 'monospace', marginBottom: 2 }}>{job['Job_ID']}</div>
+                        <div style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{job['Description'] || '(no description)'}</div>
+                        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{[job['Client'], job['Start Date'], job['End Date']].filter(Boolean).join(' · ')}</div>
+                      </div>
+                      {isSelected && <FiCheck size={14} />}
+                    </div>
+                  )
+                })}
+              </div>
+            )}
+
+            {loadingJobs && (
+              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
+                <div className="animate-spin-slow" style={{ width: 18, height: 18, border: '3px solid rgba(36,138,253,0.25)', borderTop: '3px solid #248afd', borderRadius: '50%' }} />
+                <div style={{ fontSize: 12, color: '#248afd' }}>Fetching your assigned jobs…</div>
+              </div>
+            )}
+          </div>
+        </>
+      )}
+
+      {step === 2 && (
+        <>
+          {/* ── Job Reference (auto-filled) ── */}
+          <div style={{ marginBottom: 8 }}>
+            <button type="button" onClick={() => { setSelectedJob(null); setStep(1); setJobMsg(''); setJobMsgType('') }} style={{ fontSize: 12, padding: '6px 10px', borderRadius: 8, border: 'none', background: 'transparent', color: '#248afd', cursor: 'pointer', marginBottom: 8 }}>← Change job</button>
+          </div>
+          {sectionLabel('Job Reference')}
+          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
+            <div><div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>Job ID</div><input style={{ ...inp, opacity: 0.7, background: '#f9f9f9' }} readOnly value={selectedJob?.['Job_ID'] || ''} placeholder="Select a job above" /></div>
+            <div><div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>Client</div><input style={{ ...inp, opacity: 0.7, background: '#f9f9f9' }} readOnly value={selectedJob?.['Client'] || ''} placeholder="Auto-filled" /></div>
+          </div>
+          <div style={{ marginBottom: 16 }}>
+            <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>Event / Project Description</div>
+            <input style={{ ...inp, opacity: 0.7, background: '#f9f9f9' }} readOnly value={selectedJob?.['Description'] || ''} placeholder="Auto-filled" />
+          </div>
+        </>
+      )}
*** End Patch      {sectionLabel('Requestor Details')}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div><div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>Your Name <span style={{ color: '#e74c3c' }}>*</span></div><input style={inp} type="text" value={reqName} onChange={e => setReqName(e.target.value)} placeholder="Full name" /></div>
        <div><div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>Your Email <span style={{ color: '#e74c3c' }}>*</span></div><input style={inp} type="email" value={reqEmail} onChange={e => setReqEmail(e.target.value)} placeholder="your.email@company.com" /></div>
      </div>
      <div style={{ marginBottom: 16, maxWidth: 260 }}>
        <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>Date Required <span style={{ color: '#e74c3c' }}>*</span></div>
        <input style={inp} type="date" value={dateRequired} onChange={e => setDateRequired(e.target.value)} />
      </div>

      {/* ── Line Items ── */}
      {sectionLabel('Line Items')}
      <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Qty × Days × Unit Cost = Row Total</div>
      <div style={{ overflowX: 'auto', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.10)', marginBottom: 4 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.03)', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
              {['Description', 'Supplier', 'Category', 'Qty', 'Days', 'Unit Cost', 'Total', ''].map(h => (
                <th key={h} style={{ padding: '9px 8px', textAlign: 'left', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineItems.map(li => (
              <tr key={li.id} style={{ borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                <td style={{ padding: '6px 6px 6px 8px' }}><input style={{ ...inp, fontSize: 12, padding: '6px 8px' }} value={li.description} onChange={e => updateLine(li.id, 'description', e.target.value)} placeholder="Item or service…" /></td>
                <td style={{ padding: '6px' }}><input style={{ ...inp, fontSize: 12, padding: '6px 8px' }} value={li.supplier} onChange={e => updateLine(li.id, 'supplier', e.target.value)} placeholder="Optional" /></td>
                <td style={{ padding: '6px' }}>
                  <select style={{ ...inp, fontSize: 12, padding: '6px 8px' }} value={li.category} onChange={e => updateLine(li.id, 'category', e.target.value)}>
                    <option value="">Category…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>
                <td style={{ padding: '6px' }}><input style={{ ...inp, fontSize: 12, padding: '6px 8px', textAlign: 'center', width: 60 }} type="number" min={0} value={li.qty} onChange={e => updateLine(li.id, 'qty', parseFloat(e.target.value) || 0)} /></td>
                <td style={{ padding: '6px' }}><input style={{ ...inp, fontSize: 12, padding: '6px 8px', textAlign: 'center', width: 60 }} type="number" min={0} value={li.days} onChange={e => updateLine(li.id, 'days', parseFloat(e.target.value) || 0)} /></td>
                <td style={{ padding: '6px' }}><input style={{ ...inp, fontSize: 12, padding: '6px 8px', width: 100 }} type="number" min={0} step={0.01} value={li.unitCost || ''} onChange={e => updateLine(li.id, 'unitCost', parseFloat(e.target.value) || 0)} placeholder="0.00" /></td>
                <td style={{ padding: '6px 10px 6px 6px', fontSize: 12, color: '#555', fontFamily: 'monospace', whiteSpace: 'nowrap', textAlign: 'right', minWidth: 90 }}>{lineTotal(li) > 0 ? fmt(lineTotal(li)) : '—'}</td>
                <td style={{ padding: '6px', textAlign: 'center' }}>
                  <button type="button" onClick={() => removeLine(li.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', display: 'flex', alignItems: 'center', padding: 4 }}><FiTrash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 24, padding: '12px 16px', background: 'rgba(0,0,0,0.02)', borderTop: '0.5px solid rgba(0,0,0,0.07)' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa', marginBottom: 3 }}>Grand Total</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#111', fontFamily: 'monospace' }}>{fmt(grandTotal())}</div>
          </div>
        </div>
      </div>
      <button type="button" onClick={addLine}
        style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center', fontSize: 13, padding: '9px', borderRadius: 8, border: '0.5px dashed rgba(0,0,0,0.20)', background: '#fff', color: '#555', cursor: 'pointer', marginTop: 8, marginBottom: 4 }}>
        <FiPlus size={14} /> Add Line Item
      </button>

      {/* ── Justification ── */}
      {sectionLabel('Justification & Urgency')}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>Business Justification <span style={{ color: '#e74c3c' }}>*</span></div>
        <textarea style={{ ...inp, minHeight: 90, resize: 'vertical' as const }} value={justification} onChange={e => setJustification(e.target.value)} placeholder="Why is this procurement needed?" />
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>Additional Notes</div>
        <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' as const }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Delivery requirements, alternatives…" />
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>Urgency Level <span style={{ color: '#e74c3c' }}>*</span></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
          {URGENCY.map(u => (
            <button key={u} type="button" onClick={() => setUrgency(u)}
              style={{ fontSize: 13, padding: '7px 16px', borderRadius: 8, border: `0.5px solid ${urgency === u ? '#111' : 'rgba(0,0,0,0.15)'}`, background: urgency === u ? '#111' : '#fff', color: urgency === u ? '#fff' : '#555', cursor: 'pointer' }}>
              {u}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={{ fontSize: 12, color: '#e74c3c', marginBottom: 12, padding: '10px 14px', background: 'rgba(231,76,60,0.06)', borderRadius: 8 }}>{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
        <span style={{ fontSize: 12, color: '#bbb' }}>* required · total = qty × days × unit cost</span>
        <button type="button" onClick={submit} disabled={submitting}
          style={{ fontSize: 13, padding: '10px 22px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
          {submitting ? 'Submitting…' : 'Submit Requisition'}
        </button>
      </div>
    </div>
  )
}