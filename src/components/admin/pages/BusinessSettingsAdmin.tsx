import { useEffect, useState, type ReactNode } from 'react'
import {
  Building2,
  Clock4,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { BusinessSettings } from '../../../types/database'
import { PageHeader } from '../ui'

type FormState = {
  business_name: string
  business_email: string
  business_phone: string
  business_address: string
  slot_interval_minutes: number
  booking_notice_hours: number
}

const EMPTY: FormState = {
  business_name: '',
  business_email: '',
  business_phone: '',
  business_address: '',
  slot_interval_minutes: 30,
  booking_notice_hours: 4,
}

export default function BusinessSettingsAdmin() {
  const [existingId, setExistingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('business_settings')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (data) {
        const s = data as BusinessSettings
        setExistingId(s.id)
        setForm({
          business_name: s.business_name ?? '',
          business_email: s.business_email ?? '',
          business_phone: s.business_phone ?? '',
          business_address: s.business_address ?? '',
          slot_interval_minutes: s.slot_interval_minutes ?? 30,
          booking_notice_hours: s.booking_notice_hours ?? 4,
        })
      }
      setLoading(false)
    })()
  }, [])

  async function save() {
    setSaving(true)
    setError(null)
    const payload = {
      business_name: form.business_name.trim(),
      business_email: form.business_email.trim(),
      business_phone: form.business_phone.trim(),
      business_address: form.business_address.trim(),
      slot_interval_minutes: Number(form.slot_interval_minutes),
      booking_notice_hours: Number(form.booking_notice_hours),
    }
    const op = existingId
      ? supabase.from('business_settings').update(payload).eq('id', existingId)
      : supabase.from('business_settings').insert(payload)
    const { error } = await op
    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }
    if (!existingId) {
      const { data } = await supabase
        .from('business_settings')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (data?.id) setExistingId(data.id as string)
    }
    setSavedAt(new Date())
    setSaving(false)
  }

  return (
    <div>
      <PageHeader
        title="Business Settings"
        subtitle="Company info and booking rules used across the website."
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

      {loading && <div className="card h-72 animate-pulse" />}

      {!loading && (
        <div className="grid lg:grid-cols-2 gap-6">
          <section className="card p-6">
            <h3 className="font-display text-base font-semibold text-forest-900">
              Company info
            </h3>
            <p className="text-xs text-ink-500 mt-1">
              Used on the public website and confirmation emails.
            </p>
            <div className="mt-5 space-y-4">
              <Field
                icon={<Building2 className="w-4 h-4" />}
                label="Company name"
              >
                <input
                  className="input mt-2"
                  value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                />
              </Field>
              <Field icon={<Mail className="w-4 h-4" />} label="Company email">
                <input
                  type="email"
                  className="input mt-2"
                  value={form.business_email}
                  onChange={(e) => setForm({ ...form, business_email: e.target.value })}
                />
              </Field>
              <Field icon={<Phone className="w-4 h-4" />} label="Company phone">
                <input
                  type="tel"
                  className="input mt-2"
                  value={form.business_phone}
                  onChange={(e) => setForm({ ...form, business_phone: e.target.value })}
                />
              </Field>
              <Field icon={<MapPin className="w-4 h-4" />} label="Company address">
                <textarea
                  rows={2}
                  className="input mt-2 resize-none"
                  value={form.business_address}
                  onChange={(e) => setForm({ ...form, business_address: e.target.value })}
                />
              </Field>
            </div>
          </section>

          <section className="card p-6">
            <h3 className="font-display text-base font-semibold text-forest-900">
              Booking rules
            </h3>
            <p className="text-xs text-ink-500 mt-1">
              Controls how booking slots are generated on the public site.
            </p>
            <div className="mt-5 space-y-4">
              <Field icon={<Hash className="w-4 h-4" />} label="Slot interval (minutes)">
                <input
                  type="number"
                  min={5}
                  step={5}
                  className="input mt-2"
                  value={form.slot_interval_minutes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      slot_interval_minutes: parseInt(e.target.value || '0', 10),
                    })
                  }
                />
                <p className="text-xs text-ink-500 mt-2">
                  How frequently the booking page offers a starting time (e.g. every 30 min).
                </p>
              </Field>
              <Field icon={<Clock4 className="w-4 h-4" />} label="Booking notice (hours)">
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="input mt-2"
                  value={form.booking_notice_hours}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      booking_notice_hours: parseInt(e.target.value || '0', 10),
                    })
                  }
                />
                <p className="text-xs text-ink-500 mt-2">
                  Minimum hours of notice required before a homeowner can book a slot.
                </p>
              </Field>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function Field({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-forest-700">
        {icon}
        <span className="label">{label}</span>
      </div>
      {children}
    </div>
  )
}
