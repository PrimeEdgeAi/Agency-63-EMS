import { useEffect, useState } from 'react'
import ModuleData from '../../components/modules/NonAlcoholic/types'
import { CompanyDetailView } from '../../components/modules/NonAlcoholic/components/CompanyDetailView'
import { CompanyListView } from '../../components/modules/NonAlcoholic/components/CompanyListView'
import type { NonAlcoholicActionId } from '../../components/modules/NonAlcoholic/actions'

interface AgentsWorkflowViewProps {
  initialAction: NonAlcoholicActionId | null
}

export function AgentsWorkflowView({ initialAction }: AgentsWorkflowViewProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null)
  const [selectedAction, setSelectedAction] = useState<NonAlcoholicActionId | null>(initialAction)

  useEffect(() => {
    if (initialAction && ModuleData.companies?.length === 1) {
      setSelectedCompanyId(ModuleData.companies[0].id)
      setSelectedAction(initialAction)
    }
  }, [initialAction])

  const selectedCompany = ModuleData.companies?.find((company) => company.id === selectedCompanyId) ?? null

  function handleBack() {
    setSelectedCompanyId(null)
    setSelectedAction(initialAction)
  }

  if (selectedCompany) {
    return (
      <CompanyDetailView
        moduleName="Agents"
        company={selectedCompany}
        action={selectedAction}
        onBack={handleBack}
        onSelectAction={setSelectedAction}
      />
    )
  }

  return (
    <CompanyListView
      companies={ModuleData.companies ?? []}
      moduleName="Agents"
      moduleDescription="Select a company to continue the workflow for events, recce, requisitions, proposals, completed items, or jobs."
      onSelectCompany={(companyId) => {
        setSelectedCompanyId(companyId)
        setSelectedAction(initialAction)
      }}
    />
  )
}
