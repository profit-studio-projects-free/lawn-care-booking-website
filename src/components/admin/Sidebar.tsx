import {
  CalendarClock,
  CalendarOff,
  Clock4,
  LayoutDashboard,
  Leaf,
  LogOut,
  Settings,
  Sparkles,
} from 'lucide-react'
import type { AdminPage } from './AdminApp'

const NAV: { id: AdminPage; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'appointments', label: 'Appointments', icon: CalendarClock },
  { id: 'services', label: 'Services', icon: Sparkles },
  { id: 'hours', label: 'Business Hours', icon: Clock4 },
  { id: 'blocked', label: 'Blocked Dates', icon: CalendarOff },
  { id: 'settings', label: 'Business Settings', icon: Settings },
]

export default function Sidebar({
  current,
  onChange,
  onSignOut,
  email,
}: {
  current: AdminPage
  onChange: (p: AdminPage) => void
  onSignOut: () => void
  email?: string | null
}) {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-ink-100 bg-white">
      <div className="p-6 border-b border-ink-100">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-forest-700 text-cream-50 shadow-soft">
            <Leaf className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-semibold text-forest-900">Verdant</span>
            <span className="text-[11px] uppercase tracking-wider text-ink-500">Service portal</span>
          </div>
        </a>
      </div>

      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = current === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-forest-50 text-forest-900'
                  : 'text-ink-700 hover:bg-cream-100 hover:text-forest-900'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${active ? 'text-forest-700' : 'text-ink-500'}`}
                strokeWidth={2.2}
              />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-forest-700" />
              )}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-ink-100">
        <div className="rounded-xl bg-cream-100/70 px-3 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-forest-700 text-cream-50 grid place-items-center font-semibold">
            {(email || '?').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-ink-500">Signed in as</div>
            <div className="text-sm font-medium text-forest-900 truncate">{email}</div>
          </div>
          <button
            onClick={onSignOut}
            title="Sign out"
            className="w-9 h-9 rounded-lg hover:bg-white text-ink-600 hover:text-forest-900 grid place-items-center transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export function MobileTabs({
  current,
  onChange,
}: {
  current: AdminPage
  onChange: (p: AdminPage) => void
}) {
  return (
    <div className="lg:hidden overflow-x-auto border-b border-ink-100 bg-white">
      <div className="flex gap-1 px-3 py-2 min-w-max">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = current === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-forest-50 text-forest-900'
                  : 'text-ink-600 hover:text-forest-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
