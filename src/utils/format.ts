import { format, parse } from 'date-fns'

export function formatPrice(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(n)) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n)
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rem = minutes % 60
  if (rem === 0) return `${hours} hr`
  return `${hours} hr ${rem} min`
}

export function toDateKey(date: Date): string {
  // yyyy-MM-dd in local time
  return format(date, 'yyyy-MM-dd')
}

export function toTimeKey(date: Date): string {
  // HH:mm:ss in local time
  return format(date, 'HH:mm:ss')
}

export function timeLabel(time: string): string {
  // Convert 'HH:mm:ss' or 'HH:mm' to '9:30 AM'
  const clean = time.length >= 5 ? time.slice(0, 5) : time
  const d = parse(clean, 'HH:mm', new Date())
  return format(d, 'h:mm a')
}

export function combineDateAndTime(date: Date, hours: number, minutes: number): Date {
  const d = new Date(date)
  d.setHours(hours, minutes, 0, 0)
  return d
}
