import { Key, Mail, MapPin, Phone } from 'lucide-react'
import { Img } from '../ui/Img'
import { images } from '../../lib/images'
import type { BusinessSettings } from '../../lib/database.types'

export function Footer({ settings }: { settings: BusinessSettings }) {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-navy-dark text-stone-300">
      <div className="absolute inset-0 opacity-25">
        <Img src={images.footerBanner.src} alt={images.footerBanner.alt} className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/95 to-navy-dark/70" />

      <div className="container-premium relative z-10 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gold-light">
                <Key size={16} />
              </span>
              <span className="font-display text-lg font-medium text-white">{settings.business_name}</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-stone-400">
              Scheduling and coordination for property viewings, tours, and consultations — built around
              clarity, availability you can trust, and a team that knows every listing.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">Contact</p>
            <ul className="mt-5 space-y-3.5 text-sm text-stone-300">
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-stone-500" />
                <span>{settings.business_email}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-stone-500" />
                <span>{settings.business_phone}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-stone-500" />
                <span>{settings.business_address}</span>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">Viewings</p>
            <ul className="mt-5 space-y-3 text-sm text-stone-300">
              <li>Apartment &amp; House Viewings</li>
              <li>Luxury Property Viewings</li>
              <li>Rental &amp; Investment Viewings</li>
              <li>Virtual Property Tours</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {settings.business_name}. All rights reserved.
          </p>
          <p>Viewing appointments are subject to property availability and confirmation.</p>
        </div>
      </div>
    </footer>
  )
}
