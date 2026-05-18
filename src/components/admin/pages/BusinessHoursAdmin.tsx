import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { BusinessHour } from '../../../types/database'
import { PageHeader } from '../ui'

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function trimSeconds(t: string): string {
  return t?.length >= 5 ? t.slice(0, 5) : t
}

export default function BusinessHoursAdmin() {
  const [rows, setRows] = useState<BusinessHour[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('business_hours')
        .select('*')
        .order('weekday', { ascending: true })
      const existing = (data ?? []) as BusinessHour[]
      // ensure 7-day completeness for the form
      const filled: BusinessHour[] = []
      for (let w = 0; w < 7; w++) {
        const e = existing.find((r) => r.weekday === w)
        filled.push(
          e ?? {
            id: '',
            weekday: w,
            is_open: w >= 1 && w <= 5,
            start_time: '08:00:00',
            end_time: '17:00:00',
          }
        )
      }
      setRows(filled)
      setLoading(false)
    })()
  }, [])

  function setRow(weekday: number, patch: Partial<BusinessHour>) {
    setRows((prev) => prev.map((r) => (r.weekday === weekday ? { ...r, ...patch } : r)))
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      for (const r of rows) {
        const payload = {
          weekday: r.weekday,
          is_open: r.is_open,
          start_time: r.start_time.length === 5 ? `${r.start_time}:00` : r.start_time,
          end_time: r.end_time.length === 5 ? `${r.end_time}:00` : r.end_time,
        }
        if (r.id) {
          const { error } = await supabase
            .from('business_hours')
            .update(payload)
            .eq('id', r.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('business_hours').insert(payload)
          if (error) throw error
        }
      }
      const { data } = await supabase
        .from('business_hours')
        .select('*')
        .order('weekday', { ascending: true })
      if (data) {
        const existing = data as BusinessHour[]
        const filled: BusinessHour[] = []
        for (let w = 0; w < 7; w++) {
          const e = existing.find((r) => r.weekday === w)
          filled.push(
            e ?? {
              id: '',
              weekday: w,
              is_open: false,
              start_time: '08:00:00',
              end_time: '17:00:00',
            }
          )
        }
        setRows(filled)
      }
      setSavedAt(new Date())
    } catch (e: any) {
      setError(e?.message ?? 'Unable to save business hours.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Business Hours"
        subtitle="Set when your service team is available across the week."
        action={
          <button onClick={save} disabled={saving || loading} className="btn-primary">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save changes
              </>
            )}
          </button>
        }
      />

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}
      {savedAt && (
        <div className="rounded-xl bg-forest-50 border border-forest-100 text-forest-800 px-4 py-3 text-sm mb-4">
          Saved · {savedAt.toLocaleTimeString()}
        </div>
      )}

      <div className="card divide-y divide-ink-100">
        {loading &&
          [...Array(7)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse bg-ink-50" />
          ))}
        {!loading &&
          rows.map((r) => (
            <div
              key={r.weekday}
              className="px-5 py-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
            >
              <div className="sm:col-span-3 flex items-center gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    r.is_open ? 'bg-forest-500' : 'bg-ink-300'
                  }`}
                />
                <span className="font-display text-base font-semibold text-forest-900">
                  {WEEKDAYS[r.weekday]}
                </span>
              </div>

              <div className="sm:col-span-3 flex items-center gap-3">
                <label className="inline-flex items-center cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    checked={r.is_open}
                    onChange={(e) => setRow(r.weekday, { is_open: e.target.checked })}
                    className="w-4 h-4 accent-forest-700"
                  />
                  <span className="text-sm text-ink-800">
                    {r.is_open ? 'Open' : 'Closed'}
                  </span>
                </label>
              </div>

              <div className="sm:col-span-6 grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-[10px]">Start</label>
                  <input
                    type="time"
                    disabled={!r.is_open}
                    value={trimSeconds(r.start_time)}
                    onChange={(e) =>
                      setRow(r.weekday, { start_time: `${e.target.value}:00` })
                    }
                    className="input mt-1 disabled:bg-ink-50 disabled:text-ink-400"
                  />
                </div>
                <div>
                  <label className="label text-[10px]">End</label>
                  <input
                    type="time"
                    disabled={!r.is_open}
                    value={trimSeconds(r.end_time)}
                    onChange={(e) =>
                      setRow(r.weekday, { end_time: `${e.target.value}:00` })
                    }
                    className="input mt-1 disabled:bg-ink-50 disabled:text-ink-400"
                  />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
