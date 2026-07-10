import { useState, useEffect } from 'react'
import { HashRouter } from 'react-router-dom'
import type { AppUser } from './types'
import { supabase } from './lib/supabase'

import { Spinner } from './components/ui'
import { LoginPage } from './components/auth/LoginPage'
import { PageRouter } from './routes'
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

const ADMIN_ERROR_MESSAGE =
  "Access denied. Please contact your administrator for account approval."

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessError, setAccessError] = useState('')

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)

      const { data: sessionData } = await supabase.auth.getSession()
      const sessionUser = sessionData?.session?.user

      if (sessionUser) {
        const email = sessionUser.email ?? ""

        if (!APPROVED_EMAILS.includes(email)) {
          await supabase.auth.signOut()
          setUser(null)
          setAccessError(ADMIN_ERROR_MESSAGE)
          setLoading(false)
          return
        }

        const appUser: AppUser = {
          ...sessionUser,
          email,
        }

        void logAuditEvent({
          action: 'login',
          entity_type: 'user',
          entity_id: email,
          user_email: email,
          metadata: { source: 'auth_init' },
        })

        setUser(appUser)
      } else {
        setUser(null)
      }

      if (window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', '/Agency-63-EMS/#/')
      }

      setLoading(false)
    }

    initAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const email = session.user.email ?? ''

          if (!APPROVED_EMAILS.includes(email)) {
            await supabase.auth.signOut()
            setUser(null)
            setAccessError(ADMIN_ERROR_MESSAGE)
            return
          }

          const appUser: AppUser = {
            ...session.user,
            email,
          }

          void logAuditEvent({
            action: 'login',
            entity_type: 'user',
            entity_id: email,
            user_email: email,
            metadata: { source: 'auth_state_change' },
          })

          setUser(appUser)
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
        fontFamily: 'Arial',
      }}>
        <div style={{
          padding: 24,
          borderRadius: 12,
          background: '#fff1f2',
          border: '1px solid #cdd9fe',
          color: '#121bbe',
          maxWidth: 420,
          textAlign: 'center',
        }}>
          <h2 style={{ marginBottom: 10 }}>Access Restricted</h2>
          <p>{accessError}</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginPage onLogin={setUser} />

  return (
    <HashRouter>
      <PageRouter user={user} onLogout={handleLogout} />
    </HashRouter>
  )
}
