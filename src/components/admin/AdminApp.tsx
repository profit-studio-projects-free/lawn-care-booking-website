import { useEffect, useState } from 'react'
import { Leaf, Loader2, LogOut, ShieldAlert } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Login from './Login'
import Sidebar, { MobileTabs } from './Sidebar'
import Overview from './pages/Overview'
import Appointments from './pages/Appointments'
import ServicesAdmin from './pages/ServicesAdmin'
import BusinessHoursAdmin from './pages/BusinessHoursAdmin'
import BlockedDatesAdmin from './pages/BlockedDatesAdmin'
import BusinessSettingsAdmin from './pages/BusinessSettingsAdmin'

export type AdminPage =
  | 'overview'
  | 'appointments'
  | 'services'
  | 'hours'
  | 'blocked'
  | 'settings'

type SessionState =
  | { phase: 'loading' }
  | { phase: 'no-session' }
  | {
      phase: 'authed'
      userId: string
      email: string | null
      isAdmin: boolean | null // null = checking
    }

export default function AdminApp() {
  const [state, setState] = useState<SessionState>({ phase: 'loading' })
  const [page, setPage] = useState<AdminPage>('overview')

  // Initial bootstrap + listen to auth changes
  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        if (cancelled) return
        if (!sessionData.session) {
          setState({ phase: 'no-session' })
          return
        }
        const { data: userData } = await supabase.auth.getUser()
        if (cancelled) return
        const user = userData.user
        if (!user) {
          setState({ phase: 'no-session' })
          return
        }
        setState({
          phase: 'authed',
          userId: user.id,
          email: user.email ?? null,
          isAdmin: null,
        })
        await checkAdmin(user.id, user.email ?? null)
      } catch {
        if (!cancelled) setState({ phase: 'no-session' })
      }
    }

    async function checkAdmin(userId: string, email: string | null) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', userId)
          .maybeSingle()
        if (cancelled) return
        if (error) {
          // do NOT sign out on transient errors; treat as unknown but show dashboard pessimistically as unauthorized
          setState({ phase: 'authed', userId, email, isAdmin: false })
          return
        }
        setState({
          phase: 'authed',
          userId,
          email,
          isAdmin: !!data,
        })
      } finally {
        // ensures we never hang on loading
      }
    }

    bootstrap()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      if (!session) {
        setState({ phase: 'no-session' })
        return
      }
      const user = session.user
      setState({
        phase: 'authed',
        userId: user.id,
        email: user.email ?? null,
        isAdmin: null,
      })
      checkAdmin(user.id, user.email ?? null)
    })

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (state.phase === 'loading') {
    return <FullScreenLoader label="Loading…" />
  }
  if (state.phase === 'no-session') {
    return <Login />
  }

  if (state.isAdmin === null) {
    return <FullScreenLoader label="Verifying access…" />
  }

  if (!state.isAdmin) {
    return (
      <div className="min-h-screen bg-cream-50 grid place-items-center p-6">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 text-amber-700 grid place-items-center border border-amber-100">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-forest-900">
            You are signed in, but you are not authorized as an admin.
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            If you believe this is a mistake, contact the lawn care service team manager to be
            added to the admin team.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <button onClick={handleSignOut} className="btn-secondary">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
            <a href="#top" className="btn-ghost">← Back to website</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <Sidebar
        current={page}
        onChange={setPage}
        onSignOut={handleSignOut}
        email={state.email}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileTabs current={page} onChange={setPage} />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
            {page === 'overview' && <Overview />}
            {page === 'appointments' && <Appointments />}
            {page === 'services' && <ServicesAdmin />}
            {page === 'hours' && <BusinessHoursAdmin />}
            {page === 'blocked' && <BlockedDatesAdmin />}
            {page === 'settings' && <BusinessSettingsAdmin />}
          </div>
        </main>
      </div>
    </div>
  )
}

function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-cream-50 grid place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="grid place-items-center w-12 h-12 rounded-2xl bg-forest-700 text-cream-50">
          <Leaf className="w-6 h-6" strokeWidth={2.2} />
        </div>
        <div className="flex items-center gap-2 text-ink-700">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">{label}</span>
        </div>
      </div>
    </div>
  )
}
