import { useMemo } from 'react'
import { getEventsData, getRecceData, getRequisitionsData, getPayRequestsData } from '../data'
import type { EventItem, PayRequest, RecceItem, RequisitionItem } from '../types'

export interface DashboardRoleData {
  events: EventItem[]
  recce: RecceItem[]
  requisitions: RequisitionItem[]
  payRequests: PayRequest[]
}

export interface DashboardMetricCard {
  label: string
  value: string
  detail: string
  tone: 'info' | 'success' | 'warning' | 'critical'
}

export interface ExecutiveDashboardViewModel {
  metrics: DashboardMetricCard[]
  activeJobs: EventItem[]
  upcomingEvents: EventItem[]
  pendingRecce: RecceItem[]
  pendingRequisitions: RequisitionItem[]
  pendingClaims: PayRequest[]
  recentEvents: EventItem[]
  completedJobs: EventItem[]
  recentPayments: PayRequest[]
  supplierSpend: RequisitionItem[]
  teamLoad: Array<{ name: string; count: number }>
}

const currency = (value: number) => `KES ${value.toLocaleString()}`

export function useExecutiveDashboard(role: 'agent' | 'manager' | 'finance', currentUserEmail?: string) {
  const data = useMemo<DashboardRoleData>(() => {
    const events = getEventsData()
    const recce = getRecceData()
    const requisitions = getRequisitionsData()
    const payRequests = getPayRequestsData()

    return {
      events,
      recce,
      requisitions,
      payRequests,
    }
  }, [])

  return useMemo<ExecutiveDashboardViewModel>(() => {
    const { events, recce, requisitions, payRequests } = data

    const upcomingEvents = [...events]
      .filter((event) => event.status !== 'completed')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6)

    const completedJobs = [...events].filter((event) => event.status === 'completed').slice(0, 6)
    const activeJobs = [...events].filter((event) => event.status === 'active' || event.status === 'planning').slice(0, 6)
    const pendingRecce = [...recce].filter((item) => item.status === 'pending').slice(0, 6)
    const pendingRequisitions = [...requisitions].filter((item) => item.status === 'pending').slice(0, 6)
    const pendingClaims = [...payRequests].filter((item) => item.status === 'pending').slice(0, 6)
    const recentPayments = [...payRequests].filter((item) => item.status !== 'pending').slice(0, 6)
    const supplierSpend = [...requisitions].sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 6)

    const teamLoad = events.reduce<Array<{ name: string; count: number }>>((acc, event) => {
      const name = event.projectAssistant || event.category || 'Unassigned'
      if (!name || name === 'Unassigned') return acc
      const match = acc.find((item) => item.name === name)
      if (match) match.count += 1
      else acc.push({ name, count: 1 })
      return acc
    }, []).sort((a, b) => b.count - a.count).slice(0, 6)

    const metrics = (() => {
      switch (role) {
        case 'agent': {
          const myEvents = events.filter((event) => {
            if (!currentUserEmail) return true
            return [event.projectAssistantEmail, event.projectAssistant].filter(Boolean).includes(currentUserEmail)
          })

          const myActiveJobs = myEvents.filter((event) => event.status === 'active' || event.status === 'planning')
          const myUpcoming = myEvents.filter((event) => event.status !== 'completed').slice(0, 4)
          const myPendingRecce = pendingRecce.filter((item) => item.requestedBy === currentUserEmail || item.requestedBy.includes(currentUserEmail ?? ''))
          const myPendingRequisitions = pendingRequisitions.filter((item) => item.requestorEmail === currentUserEmail)
          const myCompleted = myEvents.filter((event) => event.status === 'completed').slice(0, 4)

          return [
            { label: 'Active Jobs', value: String(myActiveJobs.length), detail: 'Assigned work in flight', tone: 'info' as const },
            { label: 'Upcoming Events', value: String(myUpcoming.length), detail: 'Events coming up soon', tone: 'warning' as const },
            { label: 'Pending Recce', value: String(myPendingRecce.length), detail: 'Inspections still required', tone: 'warning' as const },
            { label: 'Pending Proposal', value: '0', detail: 'No proposal data available', tone: 'info' as const },
            { label: 'Pending Requisition', value: String(myPendingRequisitions.length), detail: 'Procurement requests open', tone: 'warning' as const },
            { label: 'Completed Jobs', value: String(myCompleted.length), detail: 'Closed out successfully', tone: 'success' as const },
          ]
        }

        case 'manager': {
          const totalRevenue = events.reduce((sum, event) => sum + event.budget, 0)
          const totalExpenses = requisitions.reduce((sum, item) => sum + item.totalAmount, 0) + payRequests.reduce((sum, item) => sum + (item.status === 'pending' ? 0 : item.amount), 0)
          const completionRate = events.length ? Math.round((completedJobs.length / events.length) * 100) : 0
          return [
            { label: 'Total Jobs', value: String(events.length), detail: 'All jobs in the portfolio', tone: 'info' as const },
            { label: 'Active Jobs', value: String(activeJobs.length), detail: 'Jobs currently active', tone: 'warning' as const },
            { label: 'Completed Jobs', value: String(completedJobs.length), detail: 'Jobs closed this cycle', tone: 'success' as const },
            { label: 'Upcoming Events', value: String(upcomingEvents.length), detail: 'Events on the calendar', tone: 'info' as const },
            { label: 'Completion Rate', value: `${completionRate}%`, detail: 'Completed vs total jobs', tone: 'success' as const },
            { label: 'Revenue', value: currency(totalRevenue), detail: 'Estimated client value', tone: 'info' as const },
            { label: 'Expenses', value: currency(totalExpenses), detail: 'Procurement and claims', tone: 'warning' as const },
            { label: 'Estimated Profit', value: currency(Math.max(totalRevenue - totalExpenses, 0)), detail: 'Projected margin', tone: 'success' as const },
          ]
        }

        case 'finance': {
          const totalRevenue = events.reduce((sum, event) => sum + event.budget, 0)
          const procurementCost = requisitions.reduce((sum, item) => sum + item.totalAmount, 0)
          const staffClaims = payRequests.reduce((sum, item) => sum + (item.status === 'pending' ? 0 : item.amount), 0)
          const pendingPayments = payRequests.filter((item) => item.status === 'pending')
          const profitEstimate = Math.max(totalRevenue - procurementCost - staffClaims, 0)
          const averageEventCost = events.length ? totalRevenue / events.length : 0
          return [
            { label: 'Total Revenue', value: currency(totalRevenue), detail: 'Quoted client value', tone: 'info' as const },
            { label: 'Procurement Cost', value: currency(procurementCost), detail: 'Open and closed requisitions', tone: 'warning' as const },
            { label: 'Staff Claims', value: currency(staffClaims), detail: 'Approved claims settled', tone: 'info' as const },
            { label: 'Pending Payments', value: `${pendingPayments.length}`, detail: 'Claims awaiting cash out', tone: 'critical' as const },
            { label: 'Profit Estimate', value: currency(profitEstimate), detail: 'Projected margin', tone: 'success' as const },
            { label: 'Average Event Cost', value: currency(averageEventCost), detail: 'Per-event cost baseline', tone: 'info' as const },
          ]
        }

        default:
          return []
      }
    })()

    return {
      metrics,
      activeJobs,
      upcomingEvents,
      pendingRecce,
      pendingRequisitions,
      pendingClaims,
      recentEvents: completedJobs,
      completedJobs,
      recentPayments,
      supplierSpend,
      teamLoad,
    }
  }, [currentUserEmail, data, role])
}
