import { useEffect, useState, type ReactNode } from 'react'
import { format, parse } from 'date-fns'
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { Appointment, Service } from '../../../types/database'
import { formatPrice, timeLabel, toDateKey } from '../../../utils/format'
import { PageHeader, StatusBadge } from '../ui'

export default function Overview() {
  const [loading, setLoading] = useState(true)
  const [upcoming, setUpcoming] = useState<(Appointment & { service?: Service })[]>([])
  const [stats, setStats] = useState({
    upcoming: 0,
    pending: 0,
    completed: 0,
    activeServices: 0,
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const today = toDateKey(new Date())
      const [appts, svc] = await Promise.all([
        supabase.from('appointments').select('*').order('appointment_date').order('start_time'),
        supabase.from('services').select('*'),
      ])
      if (cancelled) return
      const allAppointments = (appts.data ?? []) as Appointment[]
      const services = (svc.data ?? []) as Service[]
      const svcMap = new Map(services.map((s) => [s.id, s]))

      const upcomingList = allAppointments
        .filter(
          (a) =>
            a.appointment_date >= today &&
            a.status !== 'cancelled' &&
            a.status !== 'completed'
        )
        .slice(0, 6)
        .map((a) => ({ ...a, service: svcMap.get(a.service_id) }))

      setUpcoming(upcomingList)
      setStats({
        upcoming: allAppointments.filter(
          (a) =>
            a.appointment_date >= today &&
            a.status !== 'cancelled' &&
            a.status !== 'completed'
        ).length,
        pending: allAppointments.filter((a) => a.status === 'pending').length,
        completed: allAppointments.filter((a) => a.status === 'completed').length,
        activeServices: services.filter((s) => s.is_active).length,
      })
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Today's snapshot across your lawn care service."
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <Metric
          icon={<CalendarClock className="w-4 h-4" />}
          label="Upcoming"
          value={stats.upcoming}
          tone="forest"
        />
        <Metric
          icon={<CalendarCheck className="w-4 h-4" />}
          label="Pending requests"
          value={stats.pending}
          tone="amber"
        />
        <Metric
          icon={<CheckCircle2 className="w-4 h-4" />}
          label="Completed visits"
          value={stats.completed}
          tone="sage"
        />
        <Metric
          icon={<Sparkles className="w-4 h-4" />}
          label="Active services"
          value={stats.activeServices}
          tone="cream"
        />
      </div>

      <div className="card">
        <div className="px-6 py-5 border-b border-ink-100 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-forest-900">
              Upcoming appointments
            </h3>
            <p className="text-xs text-ink-500 mt-1">
              Next requests scheduled for your service team.
            </p>
          </div>
        </div>
        <div className="divide-y divide-ink-100">
          {loading && (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-ink-50 animate-pulse" />
              ))}
            </div>
          )}
          {!loading && upcoming.length === 0 && (
            <div className="p-10 text-center text-ink-600 text-sm">
              No upcoming appointments yet.
            </div>
          )}
          {!loading &&
            upcoming.map((a) => {
              const date = parse(a.appointment_date, 'yyyy-MM-dd', new Date())
              return (
                <div
                  key={a.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-cream-50/60 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-800 grid place-items-center font-display text-base font-semibold border border-forest-100 leading-none">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase tracking-wider text-forest-600 -mb-0.5">
                          {format(date, 'MMM')}
                        </span>
                        <span>{format(date, 'd')}</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-forest-900 truncate">
                        {a.full_name}
                      </div>
                      <div className="text-xs text-ink-500 truncate">
                        {a.service?.name ?? 'Lawn care service'} ·{' '}
                        {timeLabel(a.start_time)} – {timeLabel(a.end_time)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={a.status} />
                    {a.service && (
                      <span className="hidden sm:inline text-sm font-medium text-forest-800">
                        {formatPrice(a.service.price)}
                      </span>
                    )}
                    <ArrowUpRight className="w-4 h-4 text-ink-400" />
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

function Metric({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode
  label: string
  value: number
  tone: 'forest' | 'amber' | 'sage' | 'cream'
}) {
  const tones = {
    forest: 'bg-forest-700 text-cream-50',
    amber: 'bg-amber-50 text-amber-800 border border-amber-100',
    sage: 'bg-sage-100 text-sage-900 border border-sage-200',
    cream: 'bg-cream-100 text-forest-900 border border-cream-200',
  } as const
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl grid place-items-center ${tones[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wider text-ink-500">{label}</div>
        <div className="font-display text-3xl font-semibold text-forest-900 mt-1 leading-none">
          {value}
        </div>
      </div>
    </div>
  )
}
