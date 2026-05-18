import { useEffect, useState } from 'react'
import { Leaf, Menu, X } from 'lucide-react'
import type { BusinessSettings } from '../../types/database'

type Props = {
  settings: BusinessSettings
  onBook: () => void
}

export default function Navbar({ settings, onBook }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Book', href: '#book' },
    { label: 'Contact', href: '#footer' },
  ]

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-cream-50/80 backdrop-blur-md border-b border-ink-100/70'
          : 'bg-transparent'
      }`}
    >
      <div className="container-px mx-auto max-w-7xl flex items-center justify-between h-16 md:h-20">
        <a href="#top" className="flex items-center gap-2.5 group">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-forest-700 text-cream-50 shadow-soft group-hover:bg-forest-800 transition-colors">
            <Leaf className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </span>
          <span className="font-display text-lg md:text-xl font-semibold text-forest-900 tracking-tight">
            {settings.business_name || 'Verdant'}
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="px-4 py-2 rounded-full text-sm font-medium text-ink-700 hover:text-forest-800 hover:bg-forest-50 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <a
            href={`tel:${settings.business_phone}`}
            className="text-sm font-medium text-ink-700 hover:text-forest-800 transition-colors px-3"
          >
            {settings.business_phone}
          </a>
          <button onClick={onBook} className="btn-primary">
            Book a Service
          </button>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-forest-50 text-forest-800"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink-100 bg-cream-50">
          <div className="container-px mx-auto py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-ink-800 hover:bg-forest-50"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false)
                onBook()
              }}
              className="btn-primary mt-2"
            >
              Book a Service
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
