import { useState } from 'react'
import ModuleData from './types'
import { CompanyDetailView } from './components/CompanyDetailView'
import { CompanyListView } from './components/CompanyListView'
import type { NonAlcoholicActionId } from './actions'

export function NonAlcoholic() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null)
  const [selectedAction, setSelectedAction] = useState<NonAlcoholicActionId | null>(null)

  const selectedCompany = ModuleData.companies?.find((company) => company.id === selectedCompanyId) ?? null

  function handleBack() {
    setSelectedCompanyId(null)
    setSelectedAction(null)
  }

  if (selectedCompany) {
    return (
      <CompanyDetailView
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
      moduleName={ModuleData.name}
      moduleDescription={ModuleData.description}
      onSelectCompany={(companyId) => {
        setSelectedCompanyId(companyId)
        setSelectedAction(null)
      }}
    />
  )
}
