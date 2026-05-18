import { useEffect, useState } from 'react'
import Navbar from '../components/public/Navbar'
import Hero from '../components/public/Hero'
import Services from '../components/public/Services'
import About from '../components/public/About'
import Booking from '../components/public/Booking'
import Footer from '../components/public/Footer'
import { useBusinessSettings } from '../hooks/useBusinessSettings'
import type { Service } from '../types/database'

export default function PublicSite() {
  const { settings } = useBusinessSettings()
  const [preselected, setPreselected] = useState<Service | null>(null)

  function scrollToBooking() {
    const el = document.getElementById('book')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  function scrollToServices() {
    const el = document.getElementById('services')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    document.title = `${settings.business_name} — Premium Lawn Care & Yard Maintenance`
  }, [settings.business_name])

  return (
    <div className="min-h-screen bg-cream-50 text-ink-900">
      <Navbar settings={settings} onBook={scrollToBooking} />
      <main>
        <Hero onBook={scrollToBooking} onViewServices={scrollToServices} />
        <Services
          onSelectService={(s) => {
            setPreselected(s)
            scrollToBooking()
          }}
        />
        <About />
        <Booking
          settings={settings}
          preselected={preselected}
          onPreselectedConsumed={() => setPreselected(null)}
        />
      </main>
      <Footer settings={settings} onBook={scrollToBooking} />
    </div>
  )
}
