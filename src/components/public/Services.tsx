import { useEffect, useState } from 'react'
import { ArrowRight, Clock, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Service } from '../../types/database'
import { formatDuration, formatPrice } from '../../utils/format'
import { getServiceImage } from '../../utils/serviceImages'

type Props = {
  onSelectService: (service: Service) => void
}

export default function Services({ onSelectService }: Props) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })

      if (cancelled) return
      if (error) {
        setError('Unable to load services right now.')
      } else {
        setServices((data ?? []) as Service[])
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="services" className="section relative">
      <div className="container-px mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="eyebrow">
              <Sparkles className="w-3.5 h-3.5" /> Services
            </span>
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-semibold text-forest-900 tracking-tight">
              Reliable lawn care for every yard
            </h2>
            <p className="mt-4 text-ink-700 text-base md:text-lg leading-relaxed">
              From a quick weekly mow to a full seasonal cleanup, every visit is handled by an
              insured team with the right equipment and a real eye for curb appeal.
            </p>
          </div>
        </div>

        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="card overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-ink-100" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-ink-100 rounded w-3/4" />
                  <div className="h-3 bg-ink-100 rounded w-full" />
                  <div className="h-3 bg-ink-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="card p-8 text-center text-ink-700">{error}</div>
        )}

        {!loading && !error && services.length === 0 && (
          <div className="card p-10 text-center">
            <h3 className="font-display text-xl font-semibold text-forest-900">
              Services coming soon
            </h3>
            <p className="mt-2 text-ink-600">
              Our service menu is being finalized. Check back shortly.
            </p>
          </div>
        )}

        {!loading && services.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={() => onSelectService(service)}
                featured={idx === 1}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function ServiceCard({
  service,
  onBook,
  featured,
}: {
  service: Service
  onBook: () => void
  featured?: boolean
}) {
  const img = getServiceImage(service.name)
  return (
    <article
      className={`group card overflow-hidden flex flex-col hover:-translate-y-0.5 hover:shadow-card transition-all duration-300 ${
        featured ? 'ring-1 ring-forest-200' : ''
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={img}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/30 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="badge bg-white/95 text-forest-800 border border-white">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(service.duration_minutes)}
          </span>
          {featured && (
            <span className="badge bg-forest-900/90 text-cream-50 backdrop-blur">
              Popular
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 bg-white/95 rounded-full px-3 py-1.5 shadow-soft">
          <span className="font-display text-base font-semibold text-forest-900">
            {formatPrice(service.price)}
          </span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-display text-xl font-semibold text-forest-900 leading-snug">
          {service.name}
        </h3>
        {service.description && (
          <p className="mt-2 text-sm text-ink-600 line-clamp-3 leading-relaxed">
            {service.description}
          </p>
        )}
        <button
          onClick={onBook}
          className="mt-5 inline-flex items-center justify-between text-sm font-medium text-forest-800 hover:text-forest-900 group/btn"
        >
          <span>Reserve your appointment</span>
          <span className="ml-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-forest-50 text-forest-700 group-hover/btn:bg-forest-700 group-hover/btn:text-cream-50 transition-colors">
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
      </div>
    </article>
  )
}
