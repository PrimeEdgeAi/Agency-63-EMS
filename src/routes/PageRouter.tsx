import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import type { AppUser } from '../types'
import { ReccePage } from '../components/recce/ReccePage'
import { PayRequestPage } from '../components/finance/PayRequestPage'
import { SettingsPage } from '../components/settings/SettingsPage'
import { HelpPage } from '../components/help/HelpPage'
// import { Proposal } from '../admin/components/ProposalsPage'
import { Alcoholic } from '../components/modules/Alcoholic/Alcoholic'
import { NonAlcoholic } from '../components/modules/NonAlcoholic/NonAlcoholic'
import AdminDashboard from '../admin/AdminDashboard'
import AgentDashboard from '../agents/AgentsDashboard'
import ManagerDashboard from '../manager/ManagerDashboard'
import FinanceDashboard from '../finance/FinanceDashboard'
import { Sidebar } from '../components/layout/Sidebar'

interface PageRouterProps {
  user: AppUser
  onLogout: () => void
}

const ADMIN_EMAILS = [
  'kevin.n.mongare@gmail.com',
]

const MANAGER_EMAILS = [
  'primeedgeaiofficial@gmail.com',
  'theafricanpulsepod@gmail.com',
]

const FINANCE_EMAILS = [
  'kennedymongaremirambo@gmail.com',
  'emunene924@gmail.com',
]

function MainLayout({ onLogout }: { onLogout: () => void }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      <Sidebar onLogout={onLogout} />
      <main style={{ marginLeft: 280, flex: 1, padding: 0, minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  )
}

function RoleRedirect({ user }: { user: AppUser }) {
  const email = user.email.toLowerCase()
  if (ADMIN_EMAILS.includes(email)) return <Navigate to="/admin/overview" replace />
  if (FINANCE_EMAILS.includes(email)) return <Navigate to="/finance/overview" replace />
  if (MANAGER_EMAILS.includes(email)) return <Navigate to="/manager/overview" replace />
  return <Navigate to="/agent/overview" replace />
}

function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div style={{ minHeight: '100vh', padding: 32, background: '#f3f4f6' }}>
      <div style={{ maxWidth: 920, margin: '0 auto', background: '#fff', borderRadius: 18, border: '1px solid #e5e7eb', padding: 32 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, marginBottom: 16 }}>{title}</h1>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>{description ?? 'This page is being prepared and will be available soon.'}</p>
      </div>
    </div>
  )
}

export function PageRouter({ user, onLogout }: PageRouterProps) {
  return (
    <Routes>
      <Route path="/" element={<MainLayout onLogout={onLogout} />}>
        <Route index element={<RoleRedirect user={user} />} />
        <Route path="recce" element={<ReccePage />} />
        <Route path="proposals" element={<PlaceholderPage title="Proposals" description="Proposal workflows will be available here soon." />} />
        <Route path="requisitions" element={<PlaceholderPage title="Requisitions" description="Requisition tracking is coming soon." />} />
        <Route path="completed" element={<PlaceholderPage title="Completed" description="Completed jobs will be displayed here." />} />
        <Route path="jobs" element={<PlaceholderPage title="Jobs" description="Job management pages are under construction." />} />
        <Route path="payments" element={<PayRequestPage />} />
        <Route path="settings" element={<SettingsPage user={user} />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="NonAlcoholic" element={<NonAlcoholic />} />
        <Route path="Alcoholic" element={<Alcoholic />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      <Route path="agent" element={<Navigate to="/agent/overview" replace />} />
      <Route path="agent/*" element={<AgentDashboard onLogout={onLogout} />} />

      <Route path="admin" element={<Navigate to="/admin/overview" replace />} />
      <Route path="admin/overview" element={<AdminDashboard onLogout={onLogout} />} />
      <Route path="admin/proposals" element={<AdminDashboard onLogout={onLogout} />} />
      <Route path="admin/settings" element={<AdminDashboard onLogout={onLogout} />} />
      <Route path="admin/team" element={<AdminDashboard onLogout={onLogout} />} />
      <Route path="admin/billing" element={<AdminDashboard onLogout={onLogout} />} />
      <Route path="admin/db-connections" element={<AdminDashboard onLogout={onLogout} />} />
      <Route path="admin/*" element={<AdminDashboard onLogout={onLogout} />} />

      <Route path="manager" element={<Navigate to="/manager/overview" replace />} />
      <Route path="manager/overview" element={<ManagerDashboard onLogout={onLogout} />} />
      <Route path="manager/modules" element={<ManagerDashboard onLogout={onLogout} />} />
      <Route path="manager/events" element={<ManagerDashboard onLogout={onLogout} />} />
      <Route path="manager/team" element={<ManagerDashboard onLogout={onLogout} />} />
      <Route path="manager/pay-request" element={<ManagerDashboard onLogout={onLogout} />} />
      <Route path="manager/reports" element={<ManagerDashboard onLogout={onLogout} />} />
      <Route path="manager/targets" element={<ManagerDashboard onLogout={onLogout} />} />
      <Route path="manager/*" element={<ManagerDashboard onLogout={onLogout} />} />

      <Route path="finance" element={<Navigate to="/finance/overview" replace />} />
      <Route path="finance/overview" element={<FinanceDashboard user={user} onLogout={onLogout} />} />
      <Route path="finance/pay-requests" element={<FinanceDashboard user={user} onLogout={onLogout} />} />
      <Route path="finance/requisitions" element={<FinanceDashboard user={user} onLogout={onLogout} />} />
      <Route path="finance/settings" element={<FinanceDashboard user={user} onLogout={onLogout} />} />
      <Route path="finance/*" element={<FinanceDashboard user={user} onLogout={onLogout} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
