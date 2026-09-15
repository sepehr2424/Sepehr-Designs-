import { CalendarCheck, MapPin, ShieldCheck } from 'lucide-react'
import { Button } from '../ui/Button'
import { Img } from '../ui/Img'
import { images } from '../../lib/images'

export function Hero() {
  const scrollTo = (href: string) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section id="top" className="relative flex min-h-[92vh] items-center overflow-hidden bg-navy-dark pt-20">
      <div className="absolute inset-0">
        <Img src={images.heroPrimary.src} alt={images.heroPrimary.alt} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/85 to-navy-dark/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-navy-dark/40" />
      </div>

      <div className="container-premium relative z-10 grid gap-16 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="max-w-2xl animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-light backdrop-blur-sm">
            Private Property Viewings
          </span>
          <h1 className="mt-6 text-balance font-display text-4xl font-medium leading-[1.05] text-white sm:text-5xl md:text-6xl">
            Step inside your next property, guided by people who know it well.
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-stone-200">
            Reserve a private viewing appointment with a dedicated coordinator — for apartments, houses, and
            luxury listings — in minutes. Clear scheduling, real availability, no guesswork.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" onClick={() => scrollTo('#booking')}>
              Book Your Viewing
            </Button>
            <Button size="lg" variant="outline-light" onClick={() => scrollTo('#services')}>
              Explore Viewing Types
            </Button>
          </div>
        </div>

        <div className="grid animate-fade-up gap-4 [animation-delay:150ms] sm:grid-cols-3 lg:grid-cols-1">
          {[
            { icon: CalendarCheck, title: 'Live availability', text: 'Real-time slots, no double-booking.' },
            { icon: MapPin, title: 'Local coordinators', text: 'Property experts who know each listing.' },
            { icon: ShieldCheck, title: 'Clear confirmations', text: 'Every viewing appointment is documented.' },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md transition hover:bg-white/[0.1]"
            >
              <Icon size={20} className="text-gold-light" />
              <p className="mt-3 font-display text-base font-medium text-white">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-stone-300">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
