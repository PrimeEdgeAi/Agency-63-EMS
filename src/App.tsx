import { useState, useEffect } from 'react'
import type { AppUser, PageId } from './types'
import { supabase } from './lib/supabase'

import { Spinner } from './components/ui'
import { LoginPage } from './components/auth/LoginPage'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './components/dashboard/Dashboard'
import { EventsPage } from './components/events/EventsPage'
import { ReccePage } from './components/recce/ReccePage'
import { PayRequestPage } from './components/finance/PayRequestPage'
import { SettingsPage } from './components/settings/SettingsPage'
import { HelpPage } from './components/help/HelpPage'
import { Alcoholic } from './components/modules/Alcoholic/Alcoholic'
import { NonAlcoholic } from './components/modules/NonAlcoholic/NonAlcoholic'
import AdminDashboard from './admin/AdminDashboard'
import ManagerDashboard from './agents/ManagerDashboard'
import FinanceDashboard from './finance/FinanceDashboard'
import { logAuditEvent } from './lib/audit'

const ALLOWED_EMAILS = [
  "kmongare4@gmail.com",
  "ericmunene1410@gmail.com",
  "kevin.n.mongare@gmail.com",
  "theafricanpulsepod@gmail.com",
  "kennedymongaremirambo@gmail.com",
  "primeedgeaiofficial@gmail.com",
]

const MANAGER_EMAILS = [
  "primeedgeaiofficial@gmail.com",
  "theafricanpulsepod@gmail.com",
]

const FINANCE_EMAILS = [
  "kennedymongaremirambo@gmail.com",
  "emunene924@gmail.com",
]

const APPROVED_EMAILS = Array.from(new Set([
  ...ALLOWED_EMAILS,
  ...MANAGER_EMAILS,
  ...FINANCE_EMAILS,
]))

// 🔥 NEW: admin access error state message
const ADMIN_ERROR_MESSAGE =
  "Access denied. Please contact your administrator for account approval."

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<PageId>('dashboard')

  // 🔥 NEW: store access error
  const [accessError, setAccessError] = useState('')

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)

      const { data: sessionData } = await supabase.auth.getSession()
      const sessionUser = sessionData?.session?.user

          if (sessionUser) {
            const email = sessionUser.email ?? ""

            // 🔐 BLOCK UNAUTHORIZED USERS
            if (!APPROVED_EMAILS.includes(email)) {
              await supabase.auth.signOut()
              setUser(null)

              // 🔥 NEW: show admin message
              setAccessError(ADMIN_ERROR_MESSAGE)

              setLoading(false)
              return
            }

            const appUser: AppUser = {
              ...sessionUser,
              email
            }

            void logAuditEvent({
              action: 'login',
              entity_type: 'user',
              entity_id: email,
              user_email: email,
              metadata: { source: 'auth_init' },
            })

            setUser(appUser)

            // If this is the admin or manager email, open the proper dashboard by default
            if (email === 'kevin.n.mongare@gmail.com') setActive('admin')
            else if (MANAGER_EMAILS.includes(email)) setActive('manager')
            else if (FINANCE_EMAILS.includes(email)) setActive('finance')
          } else {
            setUser(null)
          }

      // clean OAuth hash (GitHub Pages fix)
      if (window.location.hash.includes("access_token")) {
        window.history.replaceState(null, "", "/Agency-63-EMS/#/")
      }

      setLoading(false)
    }

    initAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
      if (session?.user) {
          const email = session.user.email ?? ""

          // 🔐 BLOCK UNAUTHORIZED USERS
          if (!APPROVED_EMAILS.includes(email)) {
            await supabase.auth.signOut()
            setUser(null)

            setAccessError(ADMIN_ERROR_MESSAGE)

            return
          }

          const appUser: AppUser = {
            ...session.user,
            email
          }

          void logAuditEvent({
            action: 'login',
            entity_type: 'user',
            entity_id: email,
            user_email: email,
            metadata: { source: 'auth_state_change' },
          })

          setUser(appUser)

          if (email === 'kevin.n.mongare@gmail.com') setActive('admin')
          else if (MANAGER_EMAILS.includes(email)) setActive('manager')
          else if (FINANCE_EMAILS.includes(email)) setActive('finance')
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const currentEmail = user?.email
    await supabase.auth.signOut()
    void logAuditEvent({
      action: 'logout',
      entity_type: 'user',
      entity_id: currentEmail ?? null,
      user_email: currentEmail ?? null,
    })
    setUser(null)
    setActive('dashboard')

    // clear error on logout
    setAccessError('')
  }

  if (loading) return <Spinner />

  if (!user && accessError) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial'
      }}>
        <div style={{
          padding: 24,
          borderRadius: 12,
          background: '#fff1f2',
          border: '1px solid #cdd9fe',
          color: '#121bbe',
          maxWidth: 420,
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: 10 }}>Access Restricted</h2>
          <p>{accessError}</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginPage onLogin={setUser} />

  // Admin, manager and finance dashboards have their own layout, don't show the regular sidebar for them
  if (active === 'admin' || active === 'manager' || active === 'finance') {
    return <PageRouter active={active} setActive={setActive} user={user} onLogout={handleLogout} />
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      <Sidebar active={active} setActive={setActive} user={user} onLogout={handleLogout} />
      <main style={{
        marginLeft: 280,
        flex: 1,
        padding: 0,
        minHeight: '100vh',
      }}>
        <PageRouter active={active} setActive={setActive} user={user} />
      </main>
    </div>
  )
}

function PageRouter({ active, setActive, user, onLogout }: any) {
  switch (active) {
    case 'dashboard': return <Dashboard user={user} setActive={setActive} />
    case 'admin': return <AdminDashboard onLogout={onLogout} />
    case 'manager': return <ManagerDashboard onLogout={onLogout} />
    case 'finance': return <FinanceDashboard user={user} onLogout={onLogout} />
    case 'events': return <EventsPage />
    case 'recce': return <ReccePage />
    case 'payrequest': return <PayRequestPage />
    case 'Pay Requests': return <PayRequestPage />
    case 'settings': return <SettingsPage user={user} />
    case 'help': return <HelpPage />
    case 'NonAlcoholic': return <NonAlcoholic />
    case 'Alcoholic': return <Alcoholic />
    default: return <Dashboard user={user} setActive={setActive} />
  }
}