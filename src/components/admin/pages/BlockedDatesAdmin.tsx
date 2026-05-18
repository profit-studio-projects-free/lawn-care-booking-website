import { useEffect, useState } from 'react'
import { format, parse } from 'date-fns'
import { CalendarOff, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { BlockedDate } from '../../../types/database'
import { PageHeader } from '../ui'

export default function BlockedDatesAdmin() {
  const [items, setItems] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('blocked_dates')
      .select('*')
      .order('blocked_date', { ascending: true })
    setItems((data ?? []) as BlockedDate[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function add() {
    if (!date) return
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('blocked_dates')
      .insert({ blocked_date: date, reason: reason.trim() || null })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setDate('')
    setReason('')
    load()
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((b) => b.id !== id))
    const { error } = await supabase.from('blocked_dates').delete().eq('id', id)
    if (error) load()
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div>
      <PageHeader
        title="Blocked Dates"
        subtitle="Block holidays, training days, or any day your team is unavailable."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-1 h-fit">
          <h3 className="font-display text-base font-semibold text-forest-900">
            Block a new date
          </h3>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input mt-2"
              />
            </div>
            <div>
              <label className="label">Reason (optional)</label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Holiday, training, weather…"
                className="input mt-2"
              />
            </div>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={add}
              disabled={!date || saving}
              className="btn-primary w-full mt-2"
            >
              <Plus className="w-4 h-4" /> Block this date
            </button>
          </div>
        </div>

        <div className="card lg:col-span-2 overflow-hidden">
          <div className="px-6 py-4 border-b border-ink-100 flex items-center gap-2">
            <CalendarOff className="w-4 h-4 text-forest-700" />
            <h3 className="font-display text-base font-semibold text-forest-900">
              Currently blocked
            </h3>
          </div>
          {loading && (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-ink-50 animate-pulse" />
              ))}
            </div>
          )}
          {!loading && items.length === 0 && (
            <div className="p-10 text-center text-sm text-ink-600">
              No blocked dates. Add one to keep it off the booking calendar.
            </div>
          )}
          <ul className="divide-y divide-ink-100">
            {items.map((b) => {
              const d = parse(b.blocked_date, 'yyyy-MM-dd', new Date())
              return (
                <li
                  key={b.id}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-cream-50/60 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-cream-100 text-forest-800 grid place-items-center border border-cream-200 leading-none">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase tracking-wider text-forest-600 -mb-0.5">
                          {format(d, 'MMM')}
                        </span>
                        <span className="font-display text-base font-semibold">
                          {format(d, 'd')}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-forest-900">
                        {format(d, 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="text-xs text-ink-500 truncate">
                        {b.reason || 'No reason provided'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(b.id)}
                    className="btn py-2 px-3 text-sm text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
