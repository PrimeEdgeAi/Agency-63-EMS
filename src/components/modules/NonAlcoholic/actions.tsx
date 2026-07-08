import {
  FiCalendar,
  FiMapPin,
  FiClipboard,
  FiFileText,
  FiCheckCircle,
  FiBriefcase,
} from 'react-icons/fi'

export const ACTIONS = [
  { id: 'events',       label: 'Events',       icon: <FiCalendar />,     description: 'Submit & track events'   },
  { id: 'recce',        label: 'Recce',        icon: <FiMapPin />,       description: 'Site reconnaissance'     },
  { id: 'proposals',    label: 'Proposals',    icon: <FiFileText />,     description: 'Draft proposals'         },
  { id: 'requisitions', label: 'Requisitions', icon: <FiClipboard />,    description: 'Raise a requisition'     },
  { id: 'completed',    label: 'Completed',    icon: <FiCheckCircle />,  description: 'View completed items'    },
  { id: 'jobs',         label: 'Jobs',         icon: <FiBriefcase />,    description: 'Manage job orders'       },
] as const

export type NonAlcoholicActionId = (typeof ACTIONS)[number]['id']
export type NonAlcoholicAction = (typeof ACTIONS)[number]
