import { Check, Clock } from 'lucide-react'
import clsx from 'clsx'
import type { Service } from '../../lib/database.types'

function formatPrice(price: number) {
  if (!price || price <= 0) return 'Complimentary'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

interface ServiceStepProps {
  services: Service[]
  loading: boolean
  selected: Service | null
  onSelect: (service: Service) => void
}

export function ServiceStep({ services, loading, selected, onSelect }: ServiceStepProps) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {services.map((service) => {
        const isSelected = selected?.id === service.id
        return (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service)}
            className={clsx(
              'relative flex flex-col gap-2 rounded-2xl border p-5 text-left transition-all',
              isSelected
                ? 'border-navy bg-navy/[0.04] shadow-[0_8px_24px_-10px_rgba(15,36,56,0.3)]'
                : 'border-stone-200 bg-white hover:border-navy/30 hover:bg-stone-50'
            )}
          >
            {isSelected && (
              <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-navy text-white">
                <Check size={12} />
              </span>
            )}
            <p className="pr-6 font-display text-base font-medium text-charcoal">{service.name}</p>
            <p className="line-clamp-2 text-sm text-graphite">{service.description}</p>
            <div className="mt-1 flex items-center gap-3 text-xs font-semibold text-graphite">
              <span className="inline-flex items-center gap-1">
                <Clock size={12} />
                {service.duration_minutes} min
              </span>
              <span className="text-navy">{formatPrice(service.price)}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
