import { useState } from 'react'
import { FiCalendar, FiMapPin, FiClipboard, FiFileText, FiCheckCircle, FiBriefcase, FiArrowLeft } from 'react-icons/fi'
import ModuleData from './type'
import { ModuleActionGrid } from '../ModuleActionGrid'

const ACTIONS = [
  { id: 'events', label: 'Events', icon: <FiCalendar />, description: 'Plan and manage event schedules' },
  { id: 'recce', label: 'Recce', icon: <FiMapPin />, description: 'Track venue surveys and inspections' },
  { id: 'requisitions', label: 'Requisitions', icon: <FiClipboard />, description: 'Request supplies and approvals' },
  { id: 'proposals', label: 'Proposals', icon: <FiFileText />, description: 'Create and review proposals' },
  { id: 'completed', label: 'Completed', icon: <FiCheckCircle />, description: 'Review finished activities' },
  { id: 'jobs', label: 'Jobs', icon: <FiBriefcase />, description: 'Manage assignments and staffing' },
]

export function Alcoholic() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null)
  const [selectedAction, setSelectedAction] = useState(ACTIONS[0].id)

  const selectedCompany = ModuleData.companies?.find((company) => company.id === selectedCompanyId) ?? null

  if (selectedCompany) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <button
          type="button"
          onClick={() => setSelectedCompanyId(null)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 16px', borderRadius: 14, border: '1px solid #d1d5db', background: '#ffffff', color: '#111', cursor: 'pointer' }}
        >
          <FiArrowLeft /> Back to companies
        </button>

        <div style={{ marginBottom: 24 }}>
          <h2 className="text-2xl font-bold">{selectedCompany.name}</h2>
          <p className="text-gray-700 mt-2">{selectedCompany.category}</p>
        </div>

        <ModuleActionGrid
          title="Alcoholic module workflows"
          items={ACTIONS}
          active={selectedAction}
          onSelect={setSelectedAction}
        />
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div style={{ marginBottom: 16 }}>
        <h2 className="text-2xl font-bold mb-2">{ModuleData.name}</h2>
        <p className="text-gray-700">{ModuleData.description}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginTop: 24 }}>
        {ModuleData.companies?.map((company) => (
          <button
            key={company.id}
            type="button"
            onClick={() => {
              setSelectedCompanyId(company.id)
              setSelectedAction(ACTIONS[0].id)
            }}
            style={{ cursor: 'pointer', outline: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '1rem', borderRadius: 12, border: '0.5px solid rgba(0,0,0,0.10)', background: '#fff' }}
          >
            <img src={company.logo} alt={`${company.name} logo`} style={{ width: '100%' }} />
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111', textAlign: 'center' }}>{company.name}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
