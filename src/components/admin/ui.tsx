import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-forest-900 tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-ink-600">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}) {
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [open, onClose])

  if (!open) return null
  const w = size === 'lg' ? 'max-w-3xl' : size === 'sm' ? 'max-w-md' : 'max-w-xl'
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-forest-900/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${w} bg-white rounded-3xl shadow-lift border border-ink-100 animate-fade-up`}
      >
        <div className="p-6 md:p-7 border-b border-ink-100 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg md:text-xl font-semibold text-forest-900">
              {title}
            </h3>
            {subtitle && <p className="mt-1 text-sm text-ink-600">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 grid place-items-center rounded-lg hover:bg-cream-100 text-ink-500"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 md:p-7">{children}</div>
      </div>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-800 border-amber-100',
    confirmed: 'bg-sage-100 text-sage-800 border-sage-200',
    completed: 'bg-forest-50 text-forest-800 border-forest-100',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
  }
  const cls = map[status] ?? 'bg-ink-100 text-ink-700 border-ink-200'
  return (
    <span className={`badge border ${cls} capitalize`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="card p-10 text-center">
      <h3 className="font-display text-lg font-semibold text-forest-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-ink-600">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
