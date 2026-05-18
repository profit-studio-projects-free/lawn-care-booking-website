import { Leaf, Mail, MapPin, Phone } from 'lucide-react'
import type { BusinessSettings } from '../../types/database'

export default function Footer({ settings, onBook }: { settings: BusinessSettings; onBook: () => void }) {
  return (
    <footer id="footer" className="relative bg-forest-900 text-cream-50">
      <div className="absolute inset-0 bg-hero-grain opacity-30 pointer-events-none" />
      <div className="container-px mx-auto max-w-7xl py-16 md:py-20 grid lg:grid-cols-12 gap-10 relative">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-cream-50 text-forest-900">
              <Leaf className="w-5 h-5" strokeWidth={2.2} />
            </span>
            <span className="font-display text-2xl font-semibold tracking-tight">
              {settings.business_name}
            </span>
          </div>
          <p className="mt-4 text-cream-50/80 max-w-md leading-relaxed">
            Premium lawn care, yard maintenance, and seasonal cleanup—delivered by a service team
            that treats every yard like their own.
          </p>
          <button onClick={onBook} className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-cream-50 text-forest-900 hover:bg-white px-6 py-3 text-sm font-medium transition-colors">
            Schedule your service
          </button>
        </div>

        <div className="lg:col-span-4">
          <h4 className="font-display text-base font-semibold uppercase tracking-wider text-cream-50/70">
            Contact
          </h4>
          <ul className="mt-5 space-y-4">
            <li className="flex items-start gap-3">
              <Phone className="w-4 h-4 mt-1 shrink-0 text-sage-200" />
              <a href={`tel:${settings.business_phone}`} className="hover:text-white transition-colors">
                {settings.business_phone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="w-4 h-4 mt-1 shrink-0 text-sage-200" />
              <a href={`mailto:${settings.business_email}`} className="hover:text-white transition-colors">
                {settings.business_email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-1 shrink-0 text-sage-200" />
              <span className="text-cream-50/90">{settings.business_address}</span>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h4 className="font-display text-base font-semibold uppercase tracking-wider text-cream-50/70">
            Explore
          </h4>
          <ul className="mt-5 space-y-3 text-cream-50/90">
            <li><a className="hover:text-white" href="#services">Services</a></li>
            <li><a className="hover:text-white" href="#about">About</a></li>
            <li><a className="hover:text-white" href="#book">Book a Service</a></li>
            <li><a className="hover:text-white" href="#/admin">Service team login</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream-50/10">
        <div className="container-px mx-auto max-w-7xl py-6 flex flex-col sm:flex-row gap-3 items-center justify-between text-sm text-cream-50/70">
          <span>© {new Date().getFullYear()} {settings.business_name}. All rights reserved.</span>
          <span>Licensed & insured · Local lawn care service</span>
        </div>
      </div>
    </footer>
  )
}
