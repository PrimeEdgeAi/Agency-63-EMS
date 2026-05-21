import { ACTIONS } from '../actions'
import type { NonAlcoholicActionId } from '../actions'
import { tokens } from '../tokens'
import { EventSubmission } from '../../components/EventSubmission'
import { RecceForm } from '../../components/RecceForm'
import { RequisitionForm } from '../../components/RequisitionForm'

interface ActionContentProps {
  action: NonAlcoholicActionId
  companyName: string
}

export function ActionContent({ action, companyName }: ActionContentProps) {
  if (action === 'events') return <EventSubmission companyName={companyName} onBack={() => {}} />
  if (action === 'recce') return <RecceForm companyName={companyName} onBack={() => {}} />
  if (action === 'requisitions') return <RequisitionForm companyName={companyName} onBack={() => {}} />

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
      <span>This module is not yet available.</span>
    </div>
  )
}
