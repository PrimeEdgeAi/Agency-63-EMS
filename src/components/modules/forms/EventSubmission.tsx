import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { FiArrowLeft } from 'react-icons/fi'
import { submitEventWorkflow, generateEventJobId } from '../../../data'
import { logAuditEvent } from '../../../lib/audit'

const STATUS_OPTIONS = [
  'Project Creation',
  'Project Update',
]

const label = (text: string, required = false) => (
  <div style={{ fontSize: 11, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#888', marginBottom: 6, fontWeight: 500 }}>
    {text}{required && <span style={{ color: '#e74c3c', marginLeft: 3 }}>*</span>}
  </div>
)

const input = {
  width: '100%',
  fontSize: 13,
  padding: '9px 12px',
  borderRadius: 8,
  border: '0.5px solid rgba(0,0,0,0.15)',
  background: '#fff',
  color: '#111',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

const sectionTitle = (text: string) => (
  <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bbb', fontWeight: 600, marginBottom: 14, paddingBottom: 6, borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
    {text}
  </div>
)

type Props = {
  companyName: string
  onBack: () => void
}

export function EventSubmission({ companyName, onBack }: Props) {
  const [client, setClient] = useState('')
  const [status, setStatus] = useState('')
  const [description, setDescription] = useState('')
  const [clientLead, setClientLead] = useState('')
  const [projectLead, setProjectLead] = useState('')
  const [email, setEmail] = useState('')
  const [projectAssistant, setProjectAssistant] = useState('')
  const [projectAssistantEmail, setProjectAssistantEmail] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [generatedJobId, setGeneratedJobId] = useState('')
  const [jobId, setJobId] = useState('')
  const [error, setError] = useState('')
  const today = (() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })()

  const handleSubmit = async () => {
    if (!client || !status || !description || !clientLead || !projectLead || !email || !projectAssistant || !projectAssistantEmail || !location || !startDate || !endDate) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const result = await submitEventWorkflow({
        job_id: jobId || undefined,
        description,
        client,
        status,
        client_lead: clientLead,
        project_lead: projectLead,
        email,
        project_assistant: projectAssistant,
        project_assistant_email: projectAssistantEmail,
        where: location,
        start_date: startDate,
        end_date: endDate,
        recce_done: 'No',
        submitted_at: new Date().toISOString(),
      })
      if (!result.ok) throw new Error(result.error || 'Submission failed')
      if (result.jobId) {
        setGeneratedJobId(result.jobId)
      }

      void logAuditEvent({
        action: 'submit_event',
        entity_type: 'event',
        entity_id: result.jobId || client || null,
        metadata: {
          client,
          job_id: result.jobId,
          company: companyName,
        },
      })
      setSubmitted(true)
    } catch (error: any) {
      setError(error?.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Auto-populate email from session (hide manual input)
  useEffect(() => {
    const init = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const sessionEmail = sessionData?.session?.user?.email ?? ''
        if (sessionEmail) setEmail(sessionEmail)
      } catch (e) {
        // ignore
      }
    }
    init()
    // generate a non-editable job id for the form and reserve it
    try {
      const id = generateEventJobId()
      setJobId(id)
    } catch (e) {
      // ignore generation failure; submit will still create one server-side
    }
  }, [])

  // ── Success state ──
  if (submitted) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 6 }}>Event submitted</div>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Your event has been sent for approval.</div>
        {generatedJobId && (
          <div style={{ fontSize: 13, color: '#555', marginBottom: 24 }}>Job ID: <strong>{generatedJobId}</strong></div>
        )}
        <button
          onClick={() => { setSubmitted(false); setClient(''); setStatus(''); setDescription(''); setClientLead(''); setProjectLead(''); setEmail(''); setProjectAssistant(''); setProjectAssistantEmail(''); setLocation(''); setStartDate(''); setEndDate(''); }}
          style={{ fontSize: 13, padding: '8px 20px', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.15)', background: '#fff', color: '#333', cursor: 'pointer', marginRight: 8 }}
        >
          Submit another
        </button>
        <button
          onClick={onBack}
          style={{ fontSize: 13, padding: '8px 20px', borderRadius: 8, border: 'none', background: '#111', color: '#fff', cursor: 'pointer' }}
        >
          Back to menu
        </button>
      </div>
    )
  }

  // ── Form ──
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">

      {/* Page header */}
      <button
        type="button"
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#777', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 20 }}
      >
        <FiArrowLeft /> Back
      </button>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginBottom: 4 }}>
          {companyName}
        </div>
        <h2 className="text-2xl font-bold">
          Event <span style={{ color: '#3b7dd8', fontStyle: 'italic' }}>Submission</span>
        </h2>
        <p className="text-gray-500 mt-1" style={{ fontSize: 13 }}>Submit a new event for approval or update an existing one.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* EVENT INFO */}
        <section>
          {sectionTitle('Event Info')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              {label('Job ID')}
              <input style={{ ...input, opacity: 0.85, background: '#f6f6f6' }} readOnly value={jobId || ''} />
            </div>
            <div>
              {label('Client', true)}
              <input style={input} placeholder="e.g. Jumia" value={client} onChange={(e) => setClient(e.target.value)} />
            </div>
            <div>
              {label('Status', true)}
              <select style={{ ...input }} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Select status…</option>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              {label('Description', true)}
              <textarea
                style={{ ...input, minHeight: 90, resize: 'vertical', fontFamily: 'inherit' }}
                placeholder="e.g. KCB VS Police FC"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* CONTACTS */}
        <section>
          {sectionTitle('Contacts')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              {label('Client Lead', true)}
              <input style={input} placeholder="Name" value={clientLead} onChange={(e) => setClientLead(e.target.value)} />
            </div>
            <div>
              {label('Project Lead', true)}
              <input style={input} placeholder="Name" value={projectLead} onChange={(e) => setProjectLead(e.target.value)} />
            </div>
          </div>
          <div>
            {label('Email', true)}
            <div style={{ fontSize: 13, color: '#555' }}>Using account: <span style={{ fontWeight: 600 }}>{email}</span></div>
          </div>
        </section>

        {/* PROJECT ASSISTANT */}
        <section>
          {sectionTitle('Project Assistant')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              {label('Project Assistant', true)}
              <input style={input} placeholder="Name" value={projectAssistant} onChange={(e) => setProjectAssistant(e.target.value)} />
            </div>
            <div>
              {label('Project Assistant Email', true)}
              <input style={input} type="email" placeholder="assistant@example.com" value={projectAssistantEmail} onChange={(e) => setProjectAssistantEmail(e.target.value)} />
            </div>
          </div>
        </section>

        {/* LOCATION & DATES */}
        <section>
          {sectionTitle('Location & Dates')}
          <div style={{ marginBottom: 12 }}>
            {label('Event Location', true)}
            <input style={input} placeholder="Where is the event?" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              {label('Start Date', true)}
              <input
                style={input}
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => setStartDate(e.target.value < today ? today : e.target.value)}
              />
            </div>
            <div>
              {label('End Date', true)}
              <input
                style={input}
                type="date"
                value={endDate}
                min={today}
                onChange={(e) => setEndDate(e.target.value < today ? today : e.target.value)}
              />
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, paddingTop: 16, borderTop: '0.5px solid rgba(0,0,0,0.07)' }}>
        <span style={{ fontSize: 12, color: '#bbb' }}>* required fields</span>
        {error && <span style={{ fontSize: 12, color: '#e74c3c' }}>{error}</span>}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          style={{ fontSize: 13, padding: '10px 22px', borderRadius: 8, border: 'none', background: submitting ? '#aaa' : '#3b7dd8', color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 500 }}
        >
          {submitting ? 'Submitting…' : 'Submit Event'}
        </button>
      </div>

    </div>
  )
}