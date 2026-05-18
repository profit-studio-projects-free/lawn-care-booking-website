import { useState } from 'react'
import { ChevronDown, ChevronUp, Info, Settings2, X } from 'lucide-react'
import { isSupabaseConfigured } from '../lib/supabase'

export default function SupabaseBanner() {
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (isSupabaseConfigured || dismissed) return null

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 z-[60] max-w-md sm:ml-auto pointer-events-none">
      <div className="pointer-events-auto rounded-2xl bg-white/95 backdrop-blur border border-amber-200 shadow-lift overflow-hidden animate-fade-up">
        <div className="flex items-start gap-3 p-4">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-50 text-amber-700 grid place-items-center border border-amber-100">
            <Info className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="badge bg-amber-50 text-amber-800 border border-amber-100">
                Demo mode
              </span>
              <span className="text-xs text-ink-500">Supabase not connected</span>
            </div>
            <p className="mt-2 text-sm text-ink-700 leading-relaxed">
              You're previewing the lawn care website with safe demo data. Add your Supabase
              credentials to enable real bookings, services, and admin access.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setOpen((v) => !v)}
                className="btn-ghost py-1.5 px-3 text-xs"
              >
                <Settings2 className="w-3.5 h-3.5" />
                {open ? 'Hide setup' : 'How to connect'}
                {open ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {open && (
              <div className="mt-3 rounded-xl bg-cream-100/80 border border-ink-100 p-3 text-xs text-ink-700 space-y-2 animate-fade-up">
                <p className="font-medium text-forest-900">Setup Supabase</p>
                <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
                  <li>
                    Open the <code className="px-1 py-0.5 rounded bg-white border border-ink-100">.env</code> file at the project root.
                  </li>
                  <li>
                    Replace the placeholder values with your real keys:
                    <pre className="mt-1 p-2 rounded-lg bg-forest-900 text-cream-50 text-[11px] overflow-x-auto leading-relaxed">{`VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-PUBLISHABLE-ANON-KEY`}</pre>
                  </li>
                  <li>
                    Save the file — Vite will reload. Once both values are valid, the app
                    automatically switches to the real Supabase backend.
                  </li>
                </ol>
              </div>
            )}
          </div>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="shrink-0 w-8 h-8 rounded-lg hover:bg-cream-100 text-ink-500 grid place-items-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
