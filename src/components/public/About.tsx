import { Building2, HeartHandshake, MapPinned, Users } from 'lucide-react'
import { SectionHeading } from '../ui/SectionHeading'
import { Img } from '../ui/Img'
import { images } from '../../lib/images'

const POINTS = [
  { icon: Users, title: 'Dedicated coordinators', text: 'Every viewing is guided by a team member who knows the listing in detail.' },
  { icon: MapPinned, title: 'Local property knowledge', text: 'Neighborhood context, building details, and honest answers on the spot.' },
  { icon: Building2, title: 'Every property type', text: 'Apartments, houses, rentals, and luxury listings — one simple process.' },
  { icon: HeartHandshake, title: 'Clear, unhurried process', text: 'Transparent scheduling and communication from request to appointment.' },
]

export function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-cream py-28">
      <div className="container-premium grid gap-16 lg:grid-cols-2 lg:items-center">
        <div className="relative order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-[2rem] shadow-premium">
            <Img
              src={images.aboutPrimary.src}
              alt={images.aboutPrimary.alt}
              className="h-[28rem] w-full object-cover sm:h-[34rem]"
            />
          </div>
          <div className="absolute -bottom-10 -right-6 hidden w-52 overflow-hidden rounded-2xl border-4 border-cream shadow-premium sm:block">
            <Img src={images.aboutSecondary.src} alt={images.aboutSecondary.alt} className="h-40 w-full object-cover" />
          </div>
          <div className="absolute -left-6 top-10 hidden rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-soft md:block">
            <p className="font-display text-2xl font-medium text-navy">10+ yrs</p>
            <p className="text-xs uppercase tracking-wide text-graphite">Coordinating viewings</p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="About Meridian"
            title="Property viewing coordination, done properly."
            description="We built Meridian to make scheduling a property viewing feel as considered as the property itself. From the first request to the moment you walk through the door, our team keeps the process clear, respectful of your time, and genuinely useful."
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {POINTS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/8 text-navy">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="font-display text-base font-medium text-charcoal">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-graphite">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
