import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { CalendarX2 } from 'lucide-react'
import { Calendar } from './Calendar'
import { toDayLabel } from '../../lib/time'
import type { TimeSlot } from '../../lib/availability'
import type { Service } from '../../lib/database.types'

interface DateTimeStepProps {
  service: Service
  selectedDate: Date | null
  selectedSlot: TimeSlot | null
  onDateChange: (date: Date) => void
  onSlotChange: (slot: TimeSlot) => void
  closedWeekdays: Set<number>
  blockedDateSet: Set<string>
  loadSlotsForDate: (date: Date, service: Service) => Promise<TimeSlot[]>
}

export function DateTimeStep({
  service,
  selectedDate,
  selectedSlot,
  onDateChange,
  onSlotChange,
  closedWeekdays,
  blockedDateSet,
  loadSlotsForDate,
}: DateTimeStepProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    if (!selectedDate) {
      setSlots([])
      return
    }
    let cancelled = false
    setLoadingSlots(true)
    loadSlotsForDate(selectedDate, service).then((result) => {
      if (cancelled) return
      setSlots(result)
      setLoadingSlots(false)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, service.id])

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-graphite">Select a date</p>
        <Calendar
          selectedDate={selectedDate}
          onSelect={onDateChange}
          closedWeekdays={closedWeekdays}
          blockedDateSet={blockedDateSet}
        />
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-graphite">
          {selectedDate ? toDayLabel(selectedDate) : 'Available times'}
        </p>

        {!selectedDate && (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 text-center text-sm text-graphite">
            Choose a date to see available viewing times.
          </div>
        )}

        {selectedDate && loadingSlots && (
          <div className="grid grid-cols-3 gap-2.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-xl bg-stone-100" />
            ))}
          </div>
        )}

        {selectedDate && !loadingSlots && slots.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-300 text-center text-sm text-graphite">
            <CalendarX2 size={22} className="text-stone-400" />
            No available times on this date. Please choose another day.
          </div>
        )}

        {selectedDate && !loadingSlots && slots.length > 0 && (
          <div className="grid max-h-80 grid-cols-3 gap-2.5 overflow-y-auto scroll-thin pr-1">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.start.getTime() === slot.start.getTime()
              return (
                <button
                  key={slot.start.toISOString()}
                  type="button"
                  onClick={() => onSlotChange(slot)}
                  className={clsx(
                    'rounded-xl border px-2 py-2.5 text-sm font-medium transition-all',
                    isSelected
                      ? 'border-navy bg-navy text-white shadow-[0_6px_16px_-6px_rgba(15,36,56,0.5)]'
                      : 'border-stone-200 bg-white text-charcoal hover:border-navy/40 hover:bg-stone-50'
                  )}
                >
                  {slot.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
