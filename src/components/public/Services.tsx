import { ArrowUpRight, Clock } from 'lucide-react'
import { SectionHeading } from '../ui/SectionHeading'
import { Img } from '../ui/Img'
import { serviceImageByName } from '../../lib/images'
import type { Service } from '../../lib/database.types'

function formatPrice(price: number) {
  if (!price || price <= 0) return 'Complimentary'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

interface ServicesProps {
  services: Service[]
  loading: boolean
  onSelect: (service: Service) => void
}

export function Services({ services, loading, onSelect }: ServicesProps) {
  return (
    <section id="services" className="relative bg-stone-50 py-28">
      <div className="container-premium">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Viewing Types"
            tone="light"
            title="Choose the viewing that fits your search"
            description="Every appointment is coordinated by a dedicated team member and tailored to the property type — from a quick apartment walk-through to an in-depth luxury consultation."
          />
        </div>

        {loading ? (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-3xl bg-stone-200/70" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="mt-14 rounded-3xl border border-stone-200 bg-white p-16 text-center text-graphite">
            Viewing types are being updated. Please check back shortly.
          </div>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              const image = serviceImageByName(service.name)
              return (
                <article
                  key={service.id}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="group animate-fade-up flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-premium"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Img
                      src={image.src}
                      alt={image.alt}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy backdrop-blur-sm">
                      <Clock size={12} />
                      {formatDuration(service.duration_minutes)}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-xl font-medium text-charcoal">{service.name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-graphite">{service.description}</p>

                    <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4">
                      <span className="font-display text-lg font-medium text-navy">{formatPrice(service.price)}</span>
                      <button
                        onClick={() => onSelect(service)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-emerald transition group-hover:gap-2"
                      >
                        Book viewing
                        <ArrowUpRight size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
