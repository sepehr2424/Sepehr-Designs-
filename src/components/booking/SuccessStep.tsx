import { CalendarCheck2, Mail, Phone, User } from 'lucide-react'
import { Button } from '../ui/Button'
import { toDayLabel, toTimeLabel } from '../../lib/time'
import type { Service } from '../../lib/database.types'
import type { TimeSlot } from '../../lib/availability'
import type { BookingFormData } from './DetailsStep'

interface SuccessStepProps {
  service: Service
  date: Date
  slot: TimeSlot
  form: BookingFormData
  onBookAnother: () => void
}

export function SuccessStep({ service, date, slot, form, onBookAnother }: SuccessStepProps) {
  return (
    <div className="mx-auto max-w-lg text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald/10 text-emerald">
        <CalendarCheck2 size={28} />
      </span>
      <h3 className="mt-6 font-display text-2xl font-medium text-charcoal">Your viewing is requested</h3>
      <p className="mt-2 text-sm leading-relaxed text-graphite">
        We've received your appointment request. A member of our viewing team will confirm the details with you
        shortly by email or phone.
      </p>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-6 text-left">
        <p className="font-display text-lg font-medium text-charcoal">{service.name}</p>
        <p className="mt-1 text-sm text-graphite">
          {toDayLabel(date)} · {toTimeLabel(slot.start)} – {toTimeLabel(slot.end)}
        </p>

        <div className="mt-5 space-y-2.5 border-t border-stone-200 pt-4 text-sm text-graphite">
          <p className="flex items-center gap-2.5">
            <User size={14} className="text-navy" /> {form.fullName}
          </p>
          <p className="flex items-center gap-2.5">
            <Mail size={14} className="text-navy" /> {form.email}
          </p>
          <p className="flex items-center gap-2.5">
            <Phone size={14} className="text-navy" /> {form.phone}
          </p>
        </div>
      </div>

      <Button className="mt-8" variant="secondary" onClick={onBookAnother}>
        Book another viewing
      </Button>
    </div>
  )
}
