import { useEffect, useMemo, useState } from 'react'
import { format, parse } from 'date-fns'
import { CalendarClock, Mail, Phone, Search, StickyNote } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { Appointment, AppointmentStatus, Service } from '../../../types/database'
import { formatPrice, timeLabel } from '../../../utils/format'
import { PageHeader, StatusBadge } from '../ui'

const STATUSES: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all')
  const [query, setQuery] = useState('')

  async function load() {
    setLoading(true)
    const [appts, svc] = await Promise.all([
      supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: false }),
      supabase.from('services').select('*'),
    ])
    setAppointments((appts.data ?? []) as Appointment[])
    setServices((svc.data ?? []) as Service[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const svcMap = useMemo(() => new Map(services.map((s) => [s.id, s])), [services])

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false
      if (!query.trim()) return true
      const q = query.toLowerCase()
      const svc = svcMap.get(a.service_id)
      return (
        a.full_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        (svc?.name ?? '').toLowerCase().includes(q)
      )
    })
  }, [appointments, filter, query, svcMap])

  async function updateStatus(id: string, status: AppointmentStatus) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (error) {
      // rollback by reload
      await load()
    }
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: appointments.length }
    STATUSES.forEach((s) => (c[s] = appointments.filter((a) => a.status === s).length))
    return c
  }, [appointments])

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="Track and update every requested lawn care visit."
      />

      <div className="card p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="All"
            count={counts.all}
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          {STATUSES.map((s) => (
            <FilterChip
              key={s}
              label={s.charAt(0).toUpperCase() + s.slice(1)}
              count={counts[s] ?? 0}
              active={filter === s}
              onClick={() => setFilter(s)}
            />
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, service…"
            className="input pl-10"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-ink-100 text-[11px] uppercase tracking-wider text-ink-500 font-medium bg-cream-50/40">
          <div className="col-span-3">Client</div>
          <div className="col-span-3">Service</div>
          <div className="col-span-3">Date & time</div>
          <div className="col-span-3 text-right">Status</div>
        </div>

        {loading && (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-ink-50 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center text-ink-600">No appointments match this view.</div>
        )}

        <div className="divide-y divide-ink-100">
          {!loading &&
            filtered.map((a) => {
              const svc = svcMap.get(a.service_id)
              const date = parse(a.appointment_date, 'yyyy-MM-dd', new Date())
              return (
                <div key={a.id} className="px-6 py-5">
                  <div className="grid lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-3 min-w-0">
                      <div className="font-medium text-forest-900 truncate">{a.full_name}</div>
                      <div className="text-xs text-ink-500 mt-1 flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{a.email}</span>
                      </div>
                      <div className="text-xs text-ink-500 mt-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> {a.phone}
                      </div>
                    </div>
                    <div className="lg:col-span-3 min-w-0">
                      <div className="text-sm text-forest-900 font-medium truncate">
                        {svc?.name ?? '—'}
                      </div>
                      {svc && (
                        <div className="text-xs text-ink-500">
                          {svc.duration_minutes} min · {formatPrice(svc.price)}
                        </div>
                      )}
                    </div>
                    <div className="lg:col-span-3">
                      <div className="text-sm text-forest-900 font-medium flex items-center gap-2">
                        <CalendarClock className="w-3.5 h-3.5 text-forest-700" />
                        {format(date, 'EEE, MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-ink-500 mt-1">
                        {timeLabel(a.start_time)} – {timeLabel(a.end_time)}
                      </div>
                    </div>
                    <div className="lg:col-span-3 lg:text-right flex lg:justify-end items-start gap-3">
                      <StatusSelect
                        value={a.status}
                        onChange={(s) => updateStatus(a.id, s)}
                      />
                    </div>
                  </div>
                  {a.notes && (
                    <div className="mt-3 rounded-xl bg-cream-100/60 border border-ink-100 px-4 py-3 text-sm text-ink-700 flex gap-2">
                      <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0 text-forest-700" />
                      <span className="leading-relaxed">{a.notes}</span>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors border ${
        active
          ? 'bg-forest-900 border-forest-900 text-cream-50'
          : 'bg-white border-ink-100 text-ink-700 hover:border-forest-300 hover:text-forest-900'
      }`}
    >
      {label}
      <span
        className={`text-[11px] tabular-nums px-1.5 py-0.5 rounded-full ${
          active ? 'bg-cream-50/20 text-cream-50' : 'bg-cream-100 text-ink-700'
        }`}
      >
        {count}
      </span>
    </button>
  )
}

function StatusSelect({
  value,
  onChange,
}: {
  value: AppointmentStatus
  onChange: (s: AppointmentStatus) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={value} />
      <select
        className="input py-2 text-sm w-auto"
        value={value}
        onChange={(e) => onChange(e.target.value as AppointmentStatus)}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
    </div>
  )
}
