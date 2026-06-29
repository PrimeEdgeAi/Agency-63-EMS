import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { FiCheck } from 'react-icons/fi'
import { submitRecceWorkflow } from '../../../data'

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1AO-06SYVS_uVnBWkM5smUFeSoTWUeq0GbFvX7tJr3oE/export?format=csv&gid=0'

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

// ─── Shared input styles ──────────────────────────────────────────────────────
const inp: React.CSSProperties = { width: '100%', fontSize: 13, padding: '9px 12px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.15)', background: '#fff', color: '#111', outline: 'none', boxSizing: 'border-box' }
const sectionLabel = (text: string) => (
  <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#aaa', fontWeight: 600, marginBottom: 14, marginTop: 24, paddingBottom: 6, borderBottom: '0.5px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
    {text}
  </div>
)

// ─── Radio + Checkbox components ──────────────────────────────────────────────
function RadioGroup({ options, value, onChange }: { name: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `0.5px solid ${value === opt ? '#111' : 'rgba(0,0,0,0.15)'}`, background: value === opt ? '#111' : '#fff', color: value === opt ? '#fff' : '#555', cursor: 'pointer' }}>
          {opt}
        </button>
      ))}
    </div>
  )
}
function CheckGroup({ options, values, onChange }: { options: string[]; values: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) => values.includes(opt) ? onChange(values.filter(v => v !== opt)) : onChange([...values, opt])
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => toggle(opt)}
          style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `0.5px solid ${values.includes(opt) ? '#111' : 'rgba(0,0,0,0.15)'}`, background: values.includes(opt) ? '#111' : '#fff', color: values.includes(opt) ? '#fff' : '#555', cursor: 'pointer' }}>
          {opt}
        </button>
      ))}
    </div>
  )
}

// ─── Step progress bar ────────────────────────────────────────────────────────
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', flex: n < total ? 1 : undefined }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${n < current ? '#111' : n === current ? '#111' : 'rgba(0,0,0,0.15)'}`, background: n < current ? '#111' : n === current ? 'rgba(0,0,0,0.06)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: n < current ? '#fff' : '#555', flexShrink: 0 }}>
            {n < current ? <FiCheck size={12} /> : n}
          </div>
          {n < total && <div style={{ flex: 1, height: 1, background: n < current ? '#111' : 'rgba(0,0,0,0.10)', margin: '0 6px' }} />}
        </div>
      ))}
    </div>
  )
}

type Job = Record<string, string>

type Props = { companyName: string; onBack: () => void }

export function RecceForm({ companyName, onBack }: Props) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [skipStepOne, setSkipStepOne] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [ref, setRef] = useState('')

  // Step 3 — Venue
  const [recceeDate, setRecceeDate] = useState('')
  const [location, setLocation] = useState('')
  const [attendees, setAttendees] = useState('')
  const [distance, setDistance] = useState('')
  const [transport, setTransport] = useState('')

  // Step 4 — Security
  const [residential, setResidential] = useState('')
  const [perimeter, setPerimeter] = useState('')
  const [police, setPolice] = useState('')
  const [extraSecurity, setExtraSecurity] = useState('')
  const [securityNotes, setSecurityNotes] = useState('')
  const [medical, setMedical] = useState('')
  const [medicalNotes, setMedicalNotes] = useState('')
  const [amenities, setAmenities] = useState<string[]>([])
  const [otherFacilities, setOtherFacilities] = useState('')

  // Step 5 — Logistics
  const [entryExit, setEntryExit] = useState('')
  const [eventLayout, setEventLayout] = useState('')
  const [permits, setPermits] = useState('')
  const [challenges, setChallenges] = useState('')

  const [submitting, setSubmitting] = useState(false)

  // ── Step 1: find jobs ──
  async function findJobs() {
    setError(''); setLoading(true)
    try {
      const res = await fetch(SHEET_CSV_URL)
      if (!res.ok) throw new Error('Could not reach the jobs sheet.')
      const all = csvToObj(parseCSV(await res.text()))
      const matched = all.filter(r => emailMatch(email.toLowerCase(), r))
      if (!matched.length) throw new Error(`No jobs found for "${email}".`)
      setJobs(matched); setStep(2)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  // Auto-populate email from session and attempt job lookup
  useEffect(() => {
    const init = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const sessionEmail = sessionData?.session?.user?.email ?? ''
        if (sessionEmail) {
          setEmail(sessionEmail)
          setSkipStepOne(true)
          await findJobs()
        }
      } catch (e) {
        // ignore
      }
    }
    init()
  }, [])

  // ── Submit ──
  async function submit() {
    if (!challenges.trim()) { setError('Please fill in challenges & recommendations.'); return }
    setError(''); setSubmitting(true)
    const payload = {
      email, job_id: selectedJob?.['Job_ID'] || '',
      client: selectedJob?.['Client'] || '', description: selectedJob?.['Description'] || '',
      reccee_date: recceeDate, location, attendees, distance_from_town: distance,
      public_transport: transport, residential_nearby: residential, perimeter_wall: perimeter,
      police_nearby: police, extra_security: extraSecurity, security_notes: securityNotes,
      medical_nearby: medical, medical_notes: medicalNotes, amenities,
      other_facilities: otherFacilities, entry_exit: entryExit, event_layout: eventLayout,
      permits, challenges, company: companyName, submitted_at: new Date().toISOString()
    }
    try {
      const result = await submitRecceWorkflow(payload)
      if (!result.ok) throw new Error(result.error || 'Google Sheets sync failed')
      setRef('REC-' + Date.now().toString(36).toUpperCase())
      setSubmitted(true)
    } catch (error: any) {
      setError(error?.message || 'Submission failed. Please try again.')
    } finally { setSubmitting(false) }
  }

  const field = (label: string, required = false, children: React.ReactNode) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: '#555', fontWeight: 500, marginBottom: 6 }}>{label}{required && <span style={{ color: '#e74c3c', marginLeft: 3 }}>*</span>}</div>
      {children}
    </div>
  )

  const navRow = (back?: () => void, next?: () => void, nextLabel = 'Continue →', nextDisabled = false) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
      {back ? <button type="button" onClick={back} style={{ fontSize: 13, padding: '8px 16px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.15)', background: '#fff', color: '#555', cursor: 'pointer' }}>← Back</button> : <span />}
      {next && <button type="button" onClick={next} disabled={nextDisabled} style={{ fontSize: 13, padding: '9px 20px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', cursor: 'pointer', opacity: nextDisabled ? 0.5 : 1 }}>{nextLabel}</button>}
    </div>
  )

  // ── Success ──
  if (submitted) return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 6 }}>Assessment Submitted!</div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Your reccee report has been sent to the team.</div>
      <div style={{ fontSize: 12, color: '#aaa', fontFamily: 'monospace', marginBottom: 24 }}>{ref}</div>
      <button onClick={onBack} style={{ fontSize: 13, padding: '8px 20px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', cursor: 'pointer' }}>← Back to menu</button>
    </div>
  )

  return (
    <div>
      <StepBar current={step} total={6} />

      {/* Step 1 — Email */}
      {step === 1 && !skipStepOne && (
        <div>
          {sectionLabel('Project Lead Verification')}
          {field('Your Email Address', true,
            <div style={{ fontSize: 13, color: '#555' }}>Using your logged-in account email for verification: <span style={{ fontWeight: 600 }}>{email}</span></div>
          )}
          {error && <div style={{ fontSize: 12, color: '#e74c3c', marginBottom: 12 }}>{error}</div>}
              {navRow(undefined, findJobs, loading ? 'Searching…' : 'Find My Jobs →', loading)}
        </div>
      )}

      {/* Step 2 — Select job */}
      {step === 2 && (
        <div>
          {sectionLabel('Select Job to Assess')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {jobs.map((job, i) => {
              const isSelected = selectedJob?.['Job_ID'] === job['Job_ID']
              return (
                <div key={i} onClick={() => { setSelectedJob(job); setError(''); setStep(3) }} style={{ padding: '12px 16px', borderRadius: 10, border: `0.5px solid ${isSelected ? '#111' : 'rgba(0,0,0,0.12)'}`, background: isSelected ? '#f8f8f6' : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#888', fontFamily: 'monospace', marginBottom: 3 }}>{job['Job_ID']}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>{job['Description'] || '(no description)'}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{[job['Client'], job['Where']].filter(Boolean).join(' · ')}</div>
                  </div>
                  {isSelected && <FiCheck size={16} />}
                </div>
              )
            })}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <div className="animate-spin-slow" style={{ width: 18, height: 18, border: '3px solid rgba(36,138,253,0.25)', borderTop: '3px solid #248afd', borderRadius: '50%' }} />
                <div style={{ fontSize: 12, color: '#248afd' }}>Searching jobs…</div>
              </div>
            )}
          </div>
          {error && <div style={{ fontSize: 12, color: '#e74c3c', marginBottom: 12 }}>{error}</div>}
          {navRow(() => setStep(1), () => { if (!selectedJob) { setError('Please select a job.'); return } setError(''); setStep(3) })}
        </div>
      )}

      {/* Step 3 — Venue & Dates */}
      {step === 3 && (
        <div>
          {sectionLabel('Venue & Dates')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {field('Reccee Date', true, <input style={inp} type="date" value={recceeDate} onChange={e => setRecceeDate(e.target.value)} />)}
            {field('Venue / Location', true, <input style={inp} type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Where will the event take place?" />)}
          </div>
          {field('Reccee Attendees', true, <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' as const }} value={attendees} onChange={e => setAttendees(e.target.value)} placeholder="List all attendees…" />)}
          {sectionLabel('Access & Transport')}
          {field('Distance from main town', false, <RadioGroup name="distance" options={['≤ 15 min', '≤ 30 min', '≤ 45 min', '1 hr +']} value={distance} onChange={setDistance} />)}
          {field('Is public transport available?', false, <RadioGroup name="transport" options={['Yes', 'No']} value={transport} onChange={setTransport} />)}
          {error && <div style={{ fontSize: 12, color: '#e74c3c', marginBottom: 12 }}>{error}</div>}
          {navRow(() => setStep(2), () => { if (!recceeDate || !location || !attendees) { setError('Please fill all required fields.'); return } setError(''); setStep(4) })}
        </div>
      )}

      {/* Step 4 — Security */}
      {step === 4 && (
        <div>
          {sectionLabel('Security Assessment')}
          {field('Residential settlements nearby?', false, <RadioGroup name="residential" options={['Yes', 'No']} value={residential} onChange={setResidential} />)}
          {field('Well-secured perimeter wall?', false, <RadioGroup name="perimeter" options={['Yes', 'No']} value={perimeter} onChange={setPerimeter} />)}
          {field('Police station nearby?', false, <RadioGroup name="police" options={['Yes', 'No']} value={police} onChange={setPolice} />)}
          {field('Additional security needed?', false, <RadioGroup name="extra" options={['Yes', 'No']} value={extraSecurity} onChange={setExtraSecurity} />)}
          {field('Security details & notes', false, <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' as const }} value={securityNotes} onChange={e => setSecurityNotes(e.target.value)} placeholder="Access points, guard requirements, known risks…" />)}
          {sectionLabel('Medical & Facilities')}
          {field('Medical facilities within 30 min?', false, <RadioGroup name="medical" options={['Yes', 'No']} value={medical} onChange={setMedical} />)}
          {field('Medical facility details', false, <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' as const }} value={medicalNotes} onChange={e => setMedicalNotes(e.target.value)} placeholder="Name, distance, type of facility…" />)}
          {field('Available amenities', false, <CheckGroup options={['Adequate toilets', 'Water supply', '3-phase electricity points']} values={amenities} onChange={setAmenities} />)}
          {field('Other facilities needed', false, <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' as const }} value={otherFacilities} onChange={e => setOtherFacilities(e.target.value)} placeholder="Any other infrastructure requirements…" />)}
          {navRow(() => setStep(3), () => setStep(5))}
        </div>
      )}

      {/* Step 5 — Logistics */}
      {step === 5 && (
        <div>
          {sectionLabel('Event Logistics')}
          {field('Entry & Exit details', false, <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' as const }} value={entryExit} onChange={e => setEntryExit(e.target.value)} placeholder="Entry/exit points, crowd flow, vehicle access…" />)}
          {field('Event layout details', false, <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' as const }} value={eventLayout} onChange={e => setEventLayout(e.target.value)} placeholder="Stage, audience area, vendor zones, emergency routes…" />)}
          {sectionLabel('Compliance')}
          {field('Permits required', false, <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' as const }} value={permits} onChange={e => setPermits(e.target.value)} placeholder="County, noise, liquor permits…" />)}
          {sectionLabel('Summary')}
          {field('Challenges & Recommendations', true, <textarea style={{ ...inp, minHeight: 100, resize: 'vertical' as const }} value={challenges} onChange={e => setChallenges(e.target.value)} placeholder="Key issues and your recommendations…" />)}
          {error && <div style={{ fontSize: 12, color: '#e74c3c', marginBottom: 12 }}>{error}</div>}
          {navRow(() => setStep(4), () => setStep(6), 'Review & Submit →')}
        </div>
      )}

      {/* Step 6 — Review */}
      {step === 6 && (
        <div>
          {sectionLabel('Full Assessment Recap')}
          {[
            { label: 'Job ID', value: selectedJob?.['Job_ID'] },
            { label: 'Client', value: selectedJob?.['Client'] },
            { label: 'Description', value: selectedJob?.['Description'] },
            { label: 'Reccee Date', value: recceeDate },
            { label: 'Location', value: location },
            { label: 'Attendees', value: attendees },
            { label: 'Distance', value: distance },
            { label: 'Public Transport', value: transport },
            { label: 'Residential Nearby', value: residential },
            { label: 'Perimeter Wall', value: perimeter },
            { label: 'Police Nearby', value: police },
            { label: 'Extra Security', value: extraSecurity },
            { label: 'Security Notes', value: securityNotes },
            { label: 'Medical Nearby', value: medical },
            { label: 'Medical Notes', value: medicalNotes },
            { label: 'Amenities', value: amenities.join(', ') },
            { label: 'Other Facilities', value: otherFacilities },
            { label: 'Entry & Exit', value: entryExit },
            { label: 'Event Layout', value: eventLayout },
            { label: 'Permits', value: permits },
            { label: 'Challenges', value: challenges },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.07)', fontSize: 13 }}>
              <span style={{ color: '#888', minWidth: 160 }}>{label}</span>
              <span style={{ color: '#111', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value || '—'}</span>
            </div>
          ))}
          {error && <div style={{ fontSize: 12, color: '#e74c3c', margin: '12px 0' }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
            <button type="button" onClick={() => setStep(5)} style={{ fontSize: 13, padding: '8px 16px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.15)', background: '#fff', color: '#555', cursor: 'pointer' }}>← Back</button>
            <button type="button" onClick={submit} disabled={submitting} style={{ fontSize: 13, padding: '9px 20px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
              {submitting ? 'Submitting…' : '✓ Submit Assessment'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}