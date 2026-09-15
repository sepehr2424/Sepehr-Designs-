import { CalendarDays, Clock3, Tag } from 'lucide-react'
import { toDayLabel, toTimeLabel } from '../../lib/time'
import type { Service } from '../../lib/database.types'
import type { TimeSlot } from '../../lib/availability'

function formatPrice(price: number) {
  if (!price || price <= 0) return 'Complimentary'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

export function SummaryCard({ service, date, slot }: { service: Service; date: Date; slot: TimeSlot }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-graphite">Appointment summary</p>
      <p className="mt-2 font-display text-lg font-medium text-charcoal">{service.name}</p>
      <ul className="mt-4 space-y-2.5 text-sm text-graphite">
        <li className="flex items-center gap-2.5">
          <CalendarDays size={15} className="text-navy" />
          {toDayLabel(date)}
        </li>
        <li className="flex items-center gap-2.5">
          <Clock3 size={15} className="text-navy" />
          {toTimeLabel(slot.start)} – {toTimeLabel(slot.end)}
        </li>
        <li className="flex items-center gap-2.5">
          <Tag size={15} className="text-navy" />
          {formatPrice(service.price)}
        </li>
      </ul>
    </div>
  )
}
