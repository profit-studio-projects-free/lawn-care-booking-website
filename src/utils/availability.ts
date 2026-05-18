import { addMinutes, format } from 'date-fns'
import type {
  Appointment,
  BlockedDate,
  BusinessHour,
  BusinessSettings,
  Service,
} from '../types/database'
import { combineDateAndTime, toDateKey } from './format'

export type TimeSlot = {
  start: Date
  end: Date
  label: string
}

function parseHHMM(t: string): { h: number; m: number } {
  const [h, m] = t.split(':').map((n) => parseInt(n, 10))
  return { h: h || 0, m: m || 0 }
}

/**
 * Build candidate slots for a given date based on:
 *  - business_hours for that weekday
 *  - selected service duration (in minutes)
 *  - business_settings.slot_interval_minutes
 *  - business_settings.booking_notice_hours
 *  - blocked dates
 *  - existing non-cancelled appointments (for overlap check)
 */
export function buildAvailableSlots(params: {
  date: Date
  service: Service
  hours: BusinessHour[]
  settings: BusinessSettings | null
  blocked: BlockedDate[]
  appointments: Appointment[]
  now?: Date
}): TimeSlot[] {
  const { date, service, hours, settings, blocked, appointments, now } = params
  if (!service || !date) return []

  const dateKey = toDateKey(date)
  if (blocked.some((b) => b.blocked_date === dateKey)) return []

  const weekday = date.getDay()
  const dayHours = hours.find((h) => h.weekday === weekday)
  if (!dayHours || !dayHours.is_open) return []

  const slotInterval = settings?.slot_interval_minutes ?? 30
  const noticeHours = settings?.booking_notice_hours ?? 0
  const duration = service.duration_minutes
  const nowDate = now ?? new Date()
  const noticeCutoff = addMinutes(nowDate, noticeHours * 60)

  const { h: startH, m: startM } = parseHHMM(dayHours.start_time)
  const { h: endH, m: endM } = parseHHMM(dayHours.end_time)

  const dayStart = combineDateAndTime(date, startH, startM)
  const dayEnd = combineDateAndTime(date, endH, endM)

  // Pre-compute existing busy windows for this date
  const busy: { start: Date; end: Date }[] = appointments
    .filter((a) => a.appointment_date === dateKey && a.status !== 'cancelled')
    .map((a) => {
      const s = parseHHMM(a.start_time)
      const e = parseHHMM(a.end_time)
      return {
        start: combineDateAndTime(date, s.h, s.m),
        end: combineDateAndTime(date, e.h, e.m),
      }
    })

  const slots: TimeSlot[] = []
  let cursor = new Date(dayStart)

  while (true) {
    const slotEnd = addMinutes(cursor, duration)
    if (slotEnd.getTime() > dayEnd.getTime()) break

    if (cursor.getTime() < noticeCutoff.getTime()) {
      cursor = addMinutes(cursor, slotInterval)
      continue
    }

    const overlaps = busy.some(
      (b) => cursor.getTime() < b.end.getTime() && slotEnd.getTime() > b.start.getTime()
    )

    if (!overlaps) {
      slots.push({
        start: new Date(cursor),
        end: new Date(slotEnd),
        label: format(cursor, 'h:mm a'),
      })
    }

    cursor = addMinutes(cursor, slotInterval)
  }

  return slots
}
