import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Sparkles,
  User,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type {
  Appointment,
  BlockedDate,
  BusinessHour,
  BusinessSettings,
  Service,
} from '../../types/database'
import { buildAvailableSlots, type TimeSlot } from '../../utils/availability'
import { formatDuration, formatPrice, toDateKey, toTimeKey } from '../../utils/format'
import { BOOKING_AMBIENT, getServiceImage } from '../../utils/serviceImages'

type Props = {
  settings: BusinessSettings
  preselected?: Service | null
  onPreselectedConsumed?: () => void
}

type Step = 1 | 2 | 3 | 4

type FormState = {
  full_name: string
  email: string
  phone: string
  notes: string
}

const EMPTY_FORM: FormState = { full_name: '', email: '', phone: '', notes: '' }

export default function Booking({ settings, preselected, onPreselectedConsumed }: Props) {
  const [step, setStep] = useState<Step>(1)
  const [services, setServices] = useState<Service[]>([])
  const [hours, setHours] = useState<BusinessHour[]>([])
  const [blocked, setBlocked] = useState<BlockedDate[]>([])
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [confirmation, setConfirmation] = useState<{
    service: Service
    date: Date
    slot: TimeSlot
    form: FormState
  } | null>(null)

  // initial load: services, hours, blocked
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [svc, hrs, blk] = await Promise.all([
        supabase.from('services').select('*').eq('is_active', true).order('price'),
        supabase.from('business_hours').select('*').order('weekday'),
        supabase.from('blocked_dates').select('*'),
      ])
      if (cancelled) return
      setServices((svc.data ?? []) as Service[])
      setHours((hrs.data ?? []) as BusinessHour[])
      setBlocked((blk.data ?? []) as BlockedDate[])
      setServicesLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // handle preselected from services section
  useEffect(() => {
    if (preselected) {
      setSelectedService(preselected)
      setStep(2)
      onPreselectedConsumed?.()
    }
  }, [preselected, onPreselectedConsumed])

  // load appointments for the visible month when date selection happens
  useEffect(() => {
    if (!selectedDate) return
    let cancelled = false
    setSlotsLoading(true)
    ;(async () => {
      const dateKey = toDateKey(selectedDate)
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', dateKey)
      if (cancelled) return
      setDayAppointments((data ?? []) as Appointment[])
      setSlotsLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [selectedDate])

  const slots = useMemo(() => {
    if (!selectedService || !selectedDate) return []
    return buildAvailableSlots({
      date: selectedDate,
      service: selectedService,
      hours,
      settings,
      blocked,
      appointments: dayAppointments,
    })
  }, [selectedService, selectedDate, hours, settings, blocked, dayAppointments])

  function reset() {
    setStep(1)
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedSlot(null)
    setForm(EMPTY_FORM)
    setSubmitError(null)
    setConfirmation(null)
  }

  async function handleSubmit() {
    if (!selectedService || !selectedDate || !selectedSlot) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        service_id: selectedService.id,
        appointment_date: toDateKey(selectedDate),
        start_time: toTimeKey(selectedSlot.start),
        end_time: toTimeKey(selectedSlot.end),
        status: 'pending' as const,
        notes: form.notes.trim() ? form.notes.trim() : null,
      }
      const { error } = await supabase.from('appointments').insert(payload)
      if (error) {
        setSubmitError(error.message || 'We could not submit your appointment. Please try again.')
        return
      }
      setConfirmation({
        service: selectedService,
        date: selectedDate,
        slot: selectedSlot,
        form,
      })
      setStep(4)
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="book" className="section relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-sage-50 via-cream-50 to-cream-50" />
        <div className="absolute -top-20 right-0 w-[420px] h-[420px] rounded-full bg-sage-100/40 blur-3xl" />
      </div>

      <div className="container-px mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-4">
            <span className="eyebrow">
              <CalendarIcon className="w-3.5 h-3.5" /> Book your service
            </span>
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-semibold text-forest-900 tracking-tight">
              Reserve your lawn care appointment.
            </h2>
            <p className="mt-4 text-ink-700 leading-relaxed">
              Pick a service, choose a date that works for you, and we'll handle the rest. We'll
              confirm by email and arrive on time, every time.
            </p>

            <ol className="mt-8 space-y-3">
              {[
                'Choose a lawn care service',
                'Select a date & time slot',
                'Share your details',
                'Confirmation in your inbox',
              ].map((label, i) => {
                const idx = (i + 1) as Step
                const active = step === idx
                const done = step > idx
                return (
                  <li key={label} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full grid place-items-center text-xs font-semibold transition-colors ${
                        done
                          ? 'bg-forest-700 text-cream-50'
                          : active
                          ? 'bg-forest-900 text-cream-50'
                          : 'bg-white border border-ink-200 text-ink-500'
                      }`}
                    >
                      {done ? <Check className="w-3.5 h-3.5" /> : idx}
                    </div>
                    <span
                      className={`text-sm ${
                        active ? 'text-forest-900 font-medium' : 'text-ink-700'
                      }`}
                    >
                      {label}
                    </span>
                  </li>
                )
              })}
            </ol>

            <div className="mt-10 hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-card aspect-[4/5]">
                <img
                  src={BOOKING_AMBIENT}
                  alt="Tidy front yard with healthy turf and well-trimmed hedges"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/60 via-forest-900/10 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-cream-50">
                  <div className="text-xs uppercase tracking-wider opacity-80">Promise</div>
                  <div className="mt-1 font-display text-xl font-semibold leading-snug">
                    On-time service or your next visit is on us.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="card overflow-hidden">
              <div className="p-6 md:p-8 border-b border-ink-100 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-ink-500">
                    Step {step} of 4
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-forest-900 mt-1">
                    {step === 1 && 'Choose your lawn care service'}
                    {step === 2 && 'Pick a date & time'}
                    {step === 3 && 'Your details'}
                    {step === 4 && 'Appointment requested'}
                  </h3>
                </div>
                {step > 1 && step < 4 && (
                  <button
                    onClick={() => setStep((s) => Math.max(1, (s - 1) as Step) as Step)}
                    className="btn-ghost"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                )}
              </div>

              <div className="p-6 md:p-8">
                {step === 1 && (
                  <StepService
                    services={services}
                    loading={servicesLoading}
                    selected={selectedService}
                    onSelect={(s) => {
                      setSelectedService(s)
                      setSelectedSlot(null)
                      setStep(2)
                    }}
                  />
                )}

                {step === 2 && selectedService && (
                  <StepDateTime
                    service={selectedService}
                    selectedDate={selectedDate}
                    onSelectDate={(d) => {
                      setSelectedDate(d)
                      setSelectedSlot(null)
                    }}
                    selectedSlot={selectedSlot}
                    onSelectSlot={(s) => setSelectedSlot(s)}
                    slots={slots}
                    slotsLoading={slotsLoading}
                    blocked={blocked}
                    hours={hours}
                    settings={settings}
                    onContinue={() => setStep(3)}
                  />
                )}

                {step === 3 && selectedService && selectedDate && selectedSlot && (
                  <StepDetails
                    service={selectedService}
                    date={selectedDate}
                    slot={selectedSlot}
                    form={form}
                    setForm={setForm}
                    submitting={submitting}
                    error={submitError}
                    onSubmit={handleSubmit}
                  />
                )}

                {step === 4 && confirmation && (
                  <StepSuccess
                    settings={settings}
                    service={confirmation.service}
                    date={confirmation.date}
                    slot={confirmation.slot}
                    form={confirmation.form}
                    onReset={reset}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------- STEP 1 ------------------------- */

function StepService({
  services,
  loading,
  selected,
  onSelect,
}: {
  services: Service[]
  loading: boolean
  selected: Service | null
  onSelect: (s: Service) => void
}) {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-ink-100 animate-pulse" />
        ))}
      </div>
    )
  }
  if (!services.length) {
    return (
      <div className="text-center py-12">
        <p className="text-ink-700">Services aren't available yet. Please check back soon.</p>
      </div>
    )
  }
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {services.map((s) => {
        const active = selected?.id === s.id
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className={`group text-left rounded-2xl border p-5 transition-all flex items-center gap-4 ring-focus ${
              active
                ? 'border-forest-600 bg-forest-50/40 ring-2 ring-forest-100'
                : 'border-ink-100 hover:border-forest-300 hover:bg-cream-50'
            }`}
          >
            <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden">
              <img
                src={getServiceImage(s.name)}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(s.duration_minutes)}
                <span className="text-ink-300">•</span>
                <span className="font-semibold text-forest-700">{formatPrice(s.price)}</span>
              </div>
              <div className="font-display text-base font-semibold text-forest-900 mt-1 truncate">
                {s.name}
              </div>
              {s.description && (
                <p className="text-sm text-ink-600 mt-1 line-clamp-2">{s.description}</p>
              )}
            </div>
            <div
              className={`shrink-0 w-8 h-8 rounded-full grid place-items-center transition-colors ${
                active
                  ? 'bg-forest-700 text-cream-50'
                  : 'bg-cream-100 text-forest-700 group-hover:bg-forest-100'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------- STEP 2 ------------------------- */

function StepDateTime({
  service,
  selectedDate,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
  slots,
  slotsLoading,
  blocked,
  hours,
  settings,
  onContinue,
}: {
  service: Service
  selectedDate: Date | null
  onSelectDate: (d: Date) => void
  selectedSlot: TimeSlot | null
  onSelectSlot: (s: TimeSlot) => void
  slots: TimeSlot[]
  slotsLoading: boolean
  blocked: BlockedDate[]
  hours: BusinessHour[]
  settings: BusinessSettings
  onContinue: () => void
}) {
  const [viewMonth, setViewMonth] = useState<Date>(startOfMonth(new Date()))

  const today = startOfDay(new Date())
  const blockedSet = useMemo(() => new Set(blocked.map((b) => b.blocked_date)), [blocked])
  const closedWeekdays = useMemo(() => {
    const set = new Set<number>()
    hours.forEach((h) => {
      if (!h.is_open) set.add(h.weekday)
    })
    return set
  }, [hours])

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 0 })
    const days: Date[] = []
    for (let i = 0; i < 42; i++) days.push(addDays(start, i))
    return days
  }, [viewMonth])

  function isDayDisabled(d: Date): boolean {
    if (isBefore(d, today)) return true
    if (blockedSet.has(toDateKey(d))) return true
    if (closedWeekdays.has(d.getDay())) return true
    return false
  }

  function gotoPrev() {
    const prev = addMonths(viewMonth, -1)
    if (isBefore(endOfMonth(prev), today)) return
    setViewMonth(prev)
  }
  function gotoNext() {
    setViewMonth(addMonths(viewMonth, 1))
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-500">Service</div>
            <div className="font-display text-base font-semibold text-forest-900">
              {service.name}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-ink-500">Duration</div>
            <div className="font-medium text-forest-900">
              {formatDuration(service.duration_minutes)}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={gotoPrev}
              className="w-9 h-9 rounded-full grid place-items-center hover:bg-forest-50 text-forest-800"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="font-display text-base font-semibold text-forest-900">
              {format(viewMonth, 'MMMM yyyy')}
            </div>
            <button
              onClick={gotoNext}
              className="w-9 h-9 rounded-full grid place-items-center hover:bg-forest-50 text-forest-800"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wider text-ink-400 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((d) => {
              const inMonth = d.getMonth() === viewMonth.getMonth()
              const disabled = isDayDisabled(d)
              const isSelected = selectedDate && isSameDay(d, selectedDate)
              const isToday = isSameDay(d, today)
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => !disabled && onSelectDate(d)}
                  disabled={disabled}
                  className={`relative aspect-square text-sm rounded-xl flex items-center justify-center transition-all ${
                    !inMonth ? 'text-ink-300' : 'text-ink-800'
                  } ${
                    disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:bg-forest-50 hover:text-forest-900'
                  } ${
                    isSelected
                      ? 'bg-forest-700 text-cream-50 hover:bg-forest-800 hover:text-cream-50 shadow-soft'
                      : ''
                  }`}
                >
                  {d.getDate()}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-forest-500" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <p className="mt-3 text-xs text-ink-500">
          Bookings require at least {settings.booking_notice_hours} hours notice.
        </p>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-ink-500 mb-3">
          Available time slots
        </div>
        {!selectedDate && (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-cream-50/50 p-8 text-center">
            <CalendarIcon className="w-6 h-6 text-forest-700 mx-auto mb-2" />
            <p className="text-sm text-ink-600">Pick a date to see open times.</p>
          </div>
        )}
        {selectedDate && slotsLoading && (
          <div className="rounded-2xl border border-ink-100 p-8 text-center bg-cream-50/50">
            <Loader2 className="w-5 h-5 text-forest-700 animate-spin mx-auto" />
            <p className="text-sm text-ink-600 mt-2">Loading available times…</p>
          </div>
        )}
        {selectedDate && !slotsLoading && slots.length === 0 && (
          <div className="rounded-2xl border border-ink-100 p-8 text-center bg-cream-50/50">
            <p className="text-sm text-ink-700 font-medium">No times available on this day.</p>
            <p className="text-xs text-ink-500 mt-1">Try selecting another date.</p>
          </div>
        )}
        {selectedDate && !slotsLoading && slots.length > 0 && (
          <div className="grid grid-cols-3 gap-2 max-h-[360px] overflow-y-auto pr-1">
            {slots.map((s) => {
              const active = selectedSlot?.start.getTime() === s.start.getTime()
              return (
                <button
                  key={s.start.toISOString()}
                  onClick={() => onSelectSlot(s)}
                  className={`rounded-xl py-2.5 text-sm font-medium border transition-all ${
                    active
                      ? 'bg-forest-700 border-forest-700 text-cream-50 shadow-soft'
                      : 'bg-white border-ink-100 text-forest-900 hover:border-forest-400 hover:bg-forest-50'
                  }`}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        )}

        <button
          onClick={onContinue}
          disabled={!selectedSlot}
          className="btn-primary w-full mt-6"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/* ------------------------- STEP 3 ------------------------- */

function StepDetails({
  service,
  date,
  slot,
  form,
  setForm,
  submitting,
  error,
  onSubmit,
}: {
  service: Service
  date: Date
  slot: TimeSlot
  form: FormState
  setForm: (f: FormState) => void
  submitting: boolean
  error: string | null
  onSubmit: () => void
}) {
  const canSubmit =
    form.full_name.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(form.email.trim()) &&
    form.phone.trim().length >= 7

  return (
    <div className="grid md:grid-cols-5 gap-6">
      <form
        className="md:col-span-3 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (canSubmit && !submitting) onSubmit()
        }}
      >
        <div>
          <label className="label" htmlFor="full_name">Full name</label>
          <input
            id="full_name"
            className="input mt-2"
            placeholder="Alex Johnson"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input mt-2"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              className="input mt-2"
              placeholder="(555) 555-0123"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            rows={4}
            className="input mt-2 resize-none"
            placeholder="Gate code, areas to focus on, hedge details, etc."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="btn-primary w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
            </>
          ) : (
            <>
              Confirm appointment
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        <p className="text-xs text-ink-500 text-center">
          By booking you agree to be contacted about this appointment.
        </p>
      </form>

      <aside className="md:col-span-2">
        <div className="rounded-2xl bg-forest-50/60 border border-forest-100 p-5 sticky top-24">
          <div className="text-xs uppercase tracking-wider text-forest-700 font-semibold">
            Appointment summary
          </div>
          <div className="mt-4 space-y-4">
            <SummaryRow
              icon={<Sparkles className="w-4 h-4" />}
              label="Service"
              value={service.name}
              sub={`${formatDuration(service.duration_minutes)} · ${formatPrice(service.price)}`}
            />
            <SummaryRow
              icon={<CalendarIcon className="w-4 h-4" />}
              label="Date"
              value={format(date, 'EEEE, MMMM d')}
              sub={format(date, 'yyyy')}
            />
            <SummaryRow
              icon={<Clock className="w-4 h-4" />}
              label="Time"
              value={`${format(slot.start, 'h:mm a')} – ${format(slot.end, 'h:mm a')}`}
            />
          </div>
        </div>
      </aside>
    </div>
  )
}

function SummaryRow({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white text-forest-700 grid place-items-center border border-forest-100">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-ink-500">{label}</div>
        <div className="text-sm font-semibold text-forest-900 leading-snug">{value}</div>
        {sub && <div className="text-xs text-ink-500">{sub}</div>}
      </div>
    </div>
  )
}

/* ------------------------- STEP 4 ------------------------- */

function StepSuccess({
  settings,
  service,
  date,
  slot,
  form,
  onReset,
}: {
  settings: BusinessSettings
  service: Service
  date: Date
  slot: TimeSlot
  form: FormState
  onReset: () => void
}) {
  return (
    <div className="text-center max-w-2xl mx-auto py-4">
      <div className="mx-auto w-16 h-16 rounded-full bg-forest-700 text-cream-50 grid place-items-center shadow-lift">
        <Check className="w-7 h-7" strokeWidth={2.6} />
      </div>
      <h3 className="mt-5 font-display text-2xl md:text-3xl font-semibold text-forest-900">
        Appointment requested
      </h3>
      <p className="mt-2 text-ink-700">
        Thank you, {form.full_name.split(' ')[0] || 'friend'}. We've received your request and our
        service team will confirm shortly at <span className="font-medium text-forest-900">{form.email}</span>.
      </p>

      <div className="mt-8 grid sm:grid-cols-3 gap-3 text-left">
        <SuccessTile
          icon={<Sparkles className="w-4 h-4" />}
          label="Service"
          value={service.name}
          sub={`${formatDuration(service.duration_minutes)} · ${formatPrice(service.price)}`}
        />
        <SuccessTile
          icon={<CalendarIcon className="w-4 h-4" />}
          label="Date"
          value={format(date, 'EEE, MMM d')}
          sub={format(date, 'yyyy')}
        />
        <SuccessTile
          icon={<Clock className="w-4 h-4" />}
          label="Time"
          value={format(slot.start, 'h:mm a')}
          sub={`Until ${format(slot.end, 'h:mm a')}`}
        />
      </div>

      <div className="mt-8 rounded-2xl bg-cream-100/70 border border-ink-100 p-5 text-left">
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-forest-700" />
          <div className="text-sm">
            <div className="font-medium text-forest-900">{form.full_name}</div>
            <div className="text-ink-600">{form.email} · {form.phone}</div>
          </div>
        </div>
        {form.notes && (
          <p className="mt-3 text-sm text-ink-700 leading-relaxed border-t border-ink-100 pt-3">
            <span className="font-medium text-forest-900">Notes: </span>
            {form.notes}
          </p>
        )}
        <p className="mt-3 text-xs text-ink-500">
          Need to change something? Call {settings.business_phone} and we'll take care of it.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button onClick={onReset} className="btn-secondary">Book another service</button>
        <a href="#top" className="btn-ghost">Back to top</a>
      </div>
    </div>
  )
}

function SuccessTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
      <div className="flex items-center gap-2 text-forest-700">
        {icon}
        <span className="text-[11px] uppercase tracking-wider text-ink-500">{label}</span>
      </div>
      <div className="font-display text-lg font-semibold text-forest-900 mt-1">{value}</div>
      {sub && <div className="text-xs text-ink-500">{sub}</div>}
    </div>
  )
}
