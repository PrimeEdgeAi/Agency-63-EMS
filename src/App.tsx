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

export default function App() {
  const [user,    setUser]    = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [active,  setActive]  = useState<PageId>('dashboard')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setActive('dashboard')
  }

  if (loading) return <Spinner />
  if (!user)   return <LoginPage onLogin={setUser} />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#eef4ff' }}>
      <Sidebar active={active} setActive={setActive} user={user} onLogout={handleLogout} />
      <main style={{ marginLeft: 280, flex: 1, padding: '48px 52px', minHeight: '100vh' }}>
        <PageRouter active={active} setActive={setActive} user={user} />
      </main>
    </div>
  )
}

interface RouterProps {
  active: PageId
  setActive: (id: PageId) => void
  user: AppUser
}

function PageRouter({ active, setActive, user }: RouterProps) {
  switch (active) {
    case 'dashboard':  return <Dashboard user={user} setActive={setActive} />
    case 'events':     return <EventsPage />
    case 'recce':      return <ReccePage />
    case 'payrequest': return <PayRequestPage />
    case 'settings':   return <SettingsPage user={user} />
    case 'help':       return <HelpPage />
    case 'NonAlcoholic': return <NonAlcoholic />
    case 'Alcoholic': return <Alcoholic />
    default:           return <Dashboard user={user} setActive={setActive} />
  }
}
