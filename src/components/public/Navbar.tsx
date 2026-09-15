import { useEffect, useState } from 'react'
import { Menu, X, Key } from 'lucide-react'
import { Button } from '../ui/Button'
import type { BusinessSettings } from '../../lib/database.types'

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Book a Viewing', href: '#booking' },
]

export function Navbar({ settings }: { settings: BusinessSettings }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-cream/90 shadow-[0_4px_30px_-10px_rgba(33,31,28,0.15)] backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="container-premium flex h-20 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              scrolled ? 'bg-navy text-gold-light' : 'bg-white/15 text-white backdrop-blur-sm'
            }`}
          >
            <Key size={16} />
          </span>
          <span className={`font-display text-lg font-medium tracking-tight ${scrolled ? 'text-charcoal' : 'text-white'}`}>
            {settings.business_name}
          </span>
        </a>

        <div className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className={`text-sm font-medium tracking-wide transition-colors ${
                scrolled ? 'text-graphite hover:text-navy' : 'text-white/85 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden md:block">
          <Button size="sm" onClick={() => handleNavClick('#booking')}>
            Schedule Viewing
          </Button>
        </div>

        <button
          className={`md:hidden ${scrolled ? 'text-charcoal' : 'text-white'}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-stone-200 bg-cream md:hidden animate-fade-in">
          <div className="container-premium flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="rounded-lg px-2 py-3 text-left text-sm font-medium text-graphite hover:bg-stone-100"
              >
                {link.label}
              </button>
            ))}
            <Button size="sm" className="mt-2" onClick={() => handleNavClick('#booking')}>
              Schedule Viewing
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
