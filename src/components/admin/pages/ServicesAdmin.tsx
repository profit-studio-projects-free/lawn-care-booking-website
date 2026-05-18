import { useEffect, useState } from 'react'
import { Edit3, Plus, Power, PowerOff } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { Service } from '../../../types/database'
import { formatDuration, formatPrice } from '../../../utils/format'
import { getServiceImage } from '../../../utils/serviceImages'
import { Modal, PageHeader } from '../ui'

type FormState = {
  id?: string
  name: string
  description: string
  duration_minutes: number
  price: number
  is_active: boolean
}

const EMPTY: FormState = {
  name: '',
  description: '',
  duration_minutes: 60,
  price: 75,
  is_active: true,
}

export default function ServicesAdmin() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false })
    setServices((data ?? []) as Service[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openNew() {
    setForm(EMPTY)
    setError(null)
    setModalOpen(true)
  }
  function openEdit(s: Service) {
    setForm({
      id: s.id,
      name: s.name,
      description: s.description ?? '',
      duration_minutes: s.duration_minutes,
      price: typeof s.price === 'string' ? parseFloat(s.price) : s.price,
      is_active: s.is_active,
    })
    setError(null)
    setModalOpen(true)
  }

  async function save() {
    setSaving(true)
    setError(null)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      duration_minutes: Number(form.duration_minutes),
      price: Number(form.price),
      is_active: form.is_active,
    }
    if (!payload.name || payload.duration_minutes <= 0 || Number.isNaN(payload.price)) {
      setError('Please complete all required fields.')
      setSaving(false)
      return
    }
    const op = form.id
      ? supabase.from('services').update(payload).eq('id', form.id)
      : supabase.from('services').insert(payload)
    const { error } = await op
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setModalOpen(false)
    await load()
  }

  async function toggleActive(s: Service) {
    setServices((prev) =>
      prev.map((x) => (x.id === s.id ? { ...x, is_active: !x.is_active } : x))
    )
    const { error } = await supabase
      .from('services')
      .update({ is_active: !s.is_active })
      .eq('id', s.id)
    if (error) await load()
  }

  return (
    <div>
      <PageHeader
        title="Services"
        subtitle="Build and manage your lawn care service menu."
        action={
          <button onClick={openNew} className="btn-primary">
            <Plus className="w-4 h-4" /> New service
          </button>
        }
      />

      {loading && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-44 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && services.length === 0 && (
        <div className="card p-10 text-center">
          <h3 className="font-display text-lg font-semibold text-forest-900">
            No services yet
          </h3>
          <p className="text-sm text-ink-600 mt-1">
            Add your first service to start accepting bookings.
          </p>
          <button onClick={openNew} className="btn-primary mt-5">
            <Plus className="w-4 h-4" /> Create first service
          </button>
        </div>
      )}

      {!loading && services.length > 0 && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {services.map((s) => (
            <div
              key={s.id}
              className={`card overflow-hidden flex flex-col ${
                !s.is_active ? 'opacity-80' : ''
              }`}
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={getServiceImage(s.name)}
                  alt={s.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/30 to-transparent" />
                <div className="absolute top-3 left-3">
                  {s.is_active ? (
                    <span className="badge bg-sage-100 text-sage-800 border border-sage-200">
                      Active
                    </span>
                  ) : (
                    <span className="badge bg-ink-100 text-ink-700 border border-ink-200">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-forest-900 leading-tight">
                    {s.name}
                  </h3>
                  <span className="font-display text-lg font-semibold text-forest-800 shrink-0">
                    {formatPrice(s.price)}
                  </span>
                </div>
                {s.description && (
                  <p className="mt-2 text-sm text-ink-600 line-clamp-2">{s.description}</p>
                )}
                <div className="text-xs text-ink-500 mt-3">
                  Duration · {formatDuration(s.duration_minutes)}
                </div>
                <div className="mt-5 flex gap-2 pt-4 border-t border-ink-100">
                  <button onClick={() => openEdit(s)} className="btn-secondary py-2 text-sm flex-1">
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => toggleActive(s)}
                    className={`btn py-2 text-sm flex-1 ${
                      s.is_active
                        ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-100'
                        : 'bg-forest-50 text-forest-800 hover:bg-forest-100 border border-forest-100'
                    }`}
                  >
                    {s.is_active ? (
                      <>
                        <PowerOff className="w-4 h-4" /> Deactivate
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4" /> Activate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? 'Edit service' : 'Create a new service'}
        subtitle="These details show up on your public booking page."
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Service name</label>
            <input
              className="input mt-2"
              placeholder="Weekly Lawn Mowing"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input mt-2 resize-none"
              rows={3}
              placeholder="What's included in this lawn care visit?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Duration (minutes)</label>
              <input
                type="number"
                min={5}
                step={5}
                className="input mt-2"
                value={form.duration_minutes}
                onChange={(e) =>
                  setForm({ ...form, duration_minutes: parseInt(e.target.value || '0', 10) })
                }
              />
            </div>
            <div>
              <label className="label">Price (USD)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="input mt-2"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: parseFloat(e.target.value || '0') })
                }
              />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 accent-forest-700"
            />
            <span className="text-sm text-ink-800">
              Active · show this on the public booking page
            </span>
          </label>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}
        </div>
        <div className="mt-7 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button onClick={() => setModalOpen(false)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : form.id ? 'Save changes' : 'Create service'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
