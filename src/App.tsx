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

const ALLOWED_EMAILS = [
  "kmongare4@gmail.com",
  "ericmunene1410@gmail.com"
]

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
        if (!ALLOWED_EMAILS.includes(email)) {
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

        setUser(appUser)
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
          if (!ALLOWED_EMAILS.includes(email)) {
            await supabase.auth.signOut()
            setUser(null)

            setAccessError(ADMIN_ERROR_MESSAGE)

            return
          }

          const appUser: AppUser = {
            ...session.user,
            email
          }

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
    await supabase.auth.signOut()
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#ffffff' }}>
      <Sidebar active={active} setActive={setActive} user={user} onLogout={handleLogout} />
      <main style={{ marginLeft: 280, flex: 1, padding: '18px 22px', minHeight: '100vh' }}>
        <PageRouter active={active} setActive={setActive} user={user} />
      </main>
    </div>
  )
}

function PageRouter({ active, setActive, user }: any) {
  switch (active) {
    case 'dashboard': return <Dashboard user={user} setActive={setActive} />
    case 'events': return <EventsPage />
    case 'recce': return <ReccePage />
    case 'payrequest': return <PayRequestPage />
    case 'settings': return <SettingsPage user={user} />
    case 'help': return <HelpPage />
    case 'NonAlcoholic': return <NonAlcoholic />
    case 'Alcoholic': return <Alcoholic />
    default: return <Dashboard user={user} setActive={setActive} />
  }
}