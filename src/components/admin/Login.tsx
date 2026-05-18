import { useState, type FormEvent } from 'react'
import { Leaf, Loader2, Lock, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) {
      setError(error.message || 'Unable to sign in. Please check your credentials.')
      setLoading(false)
      return
    }
    // onAuthStateChange in AdminApp will pick this up
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-50 to-sage-50 grid lg:grid-cols-2">
      <div className="hidden lg:flex relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1600&q=80"
          alt="A beautifully maintained green lawn"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-forest-900/80 via-forest-900/40 to-transparent" />
        <div className="relative z-10 m-auto p-12 text-cream-50 max-w-md">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-cream-50 text-forest-900">
              <Leaf className="w-5 h-5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-2xl font-semibold tracking-tight">Verdant</span>
          </div>
          <h1 className="mt-10 font-display text-3xl md:text-4xl font-semibold leading-tight">
            Service team portal
          </h1>
          <p className="mt-4 text-cream-50/85 leading-relaxed">
            Manage appointments, services, and your business calendar. Sign in to access the
            dashboard.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white rounded-3xl border border-ink-100 shadow-card p-8 md:p-10"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-forest-700 text-cream-50">
              <Leaf className="w-5 h-5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight text-forest-900">
              Verdant
            </span>
          </div>
          <div className="text-xs uppercase tracking-wider text-ink-500 font-medium">Admin sign in</div>
          <h2 className="mt-2 font-display text-2xl md:text-3xl font-semibold text-forest-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            Sign in with your service team credentials.
          </p>

          <div className="mt-7 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="relative mt-2">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  id="email"
                  type="email"
                  className="input pl-10"
                  placeholder="admin@verdantlawn.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative mt-2">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  id="password"
                  type="password"
                  className="input pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>

          <p className="mt-6 text-xs text-ink-500 text-center">
            <a href="#top" className="hover:text-forest-800 underline-offset-2 hover:underline">
              ← Back to lawn care website
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
