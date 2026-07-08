import { useMemo } from 'react'
import { ACTIONS } from '../actions'
import type { NonAlcoholicActionId } from '../actions'
import type { EventItem } from '../../../../types'
import { tokens } from '../tokens'
import { EventSubmission } from '../../forms/EventSubmission'
import { RecceForm } from '../../forms/RecceForm'
import { RequisitionForm } from '../../forms/RequisitionForm'
import { getEventsData } from '../../../../data'

interface ActionContentProps {
  action: NonAlcoholicActionId
  companyName: string
}

export function ActionContent({ action, companyName }: ActionContentProps) {
  const events = useMemo(() => getEventsData(), []) as EventItem[]
  const companyJobs = useMemo(
    () => events.filter((event) => /kcb/i.test(event.title) || /kcb/i.test(event.category) || /kcb/i.test(event.story)),
    [events]
  )

  if (action === 'events') return <EventSubmission companyName={companyName} onBack={() => {}} />
  if (action === 'recce') return <RecceForm companyName={companyName} onBack={() => {}} />
  if (action === 'requisitions') return <RequisitionForm companyName={companyName} onBack={() => {}} />

  if (action === 'proposals') {
    return (
      <div style={{ padding: 24, color: tokens.textPrimary, fontFamily: tokens.fontBody }}>
        <h2 style={{ marginTop: 0, fontSize: 24 }}>KCB Group Proposals</h2>
        <p style={{ color: tokens.textSecondary, marginBottom: 20 }}>
          Manage proposal readiness for the KCB workflow. Use the manager proposals tab to review and approve submitted proposals.
        </p>
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ background: tokens.surfaceSecondary, border: `1px solid ${tokens.borderSubtle}`, borderRadius: tokens.radiusLg, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Proposal workstream</div>
            <div style={{ color: tokens.textSecondary }}>Review new proposals from your team and confirm budget, client, and scope before moving the event into execution.</div>
          </div>
        </div>
      </div>
    )
  }

  if (action === 'completed') {
    return (
      <div style={{ padding: 24, color: tokens.textPrimary, fontFamily: tokens.fontBody }}>
        <h2 style={{ marginTop: 0, fontSize: 24 }}>Completed KCB Work</h2>
        <p style={{ color: tokens.textSecondary, marginBottom: 20 }}>
          Completed jobs for the KCB workflow are shown here. These are pulled from the current events workflow so you can confirm delivery and handover.
        </p>
        {companyJobs.length > 0 ? (
          <div style={{ display: 'grid', gap: 14 }}>
            {companyJobs.map((job) => (
              <div key={job.id} style={{ background: tokens.surfaceSecondary, border: `1px solid ${tokens.borderSubtle}`, borderRadius: tokens.radiusLg, padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{job.title}</div>
                <div style={{ color: tokens.textSecondary, marginTop: 6 }}>{job.location} • {job.date}</div>
                <div style={{ marginTop: 8, fontSize: 13, color: tokens.textSecondary }}>Status: {job.status}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: tokens.textSecondary }}>No completed KCB jobs are available right now.</div>
        )}
      </div>
    )
  }

  if (action === 'jobs') {
    return (
      <div style={{ padding: 24, color: tokens.textPrimary, fontFamily: tokens.fontBody }}>
        <h2 style={{ marginTop: 0, fontSize: 24 }}>KCB Jobs</h2>
        <p style={{ color: tokens.textSecondary, marginBottom: 20 }}>
          View job workstreams connected to the KCB events pipeline. These items surface the same job data used by the Events workflow.
        </p>
        {companyJobs.length > 0 ? (
          <div style={{ display: 'grid', gap: 14 }}>
            {companyJobs.map((job) => (
              <div key={job.id} style={{ background: tokens.surfaceSecondary, border: `1px solid ${tokens.borderSubtle}`, borderRadius: tokens.radiusLg, padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{job.title}</div>
                <div style={{ color: tokens.textSecondary, marginTop: 6 }}>{job.location} • {job.date}</div>
                <div style={{ marginTop: 8, fontSize: 13, color: tokens.textSecondary }}>Status: {job.status}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: tokens.textSecondary }}>No KCB jobs are available yet.</div>
        )}
      </div>
    )
  }

  const activeAction = ACTIONS.find((item) => item.id === action)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '48px 0',
        color: tokens.textTertiary,
        fontFamily: tokens.fontBody,
        fontSize: 14,
      }}
    >
      <span style={{ fontSize: 22 }}>{activeAction?.icon}</span>
      <span>This workflow step is not available in the current module.</span>
    </div>
  )
}
