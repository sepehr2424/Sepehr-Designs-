import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import { toDateInput } from '../../lib/time'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

interface CalendarProps {
  selectedDate: Date | null
  onSelect: (date: Date) => void
  closedWeekdays: Set<number>
  blockedDateSet: Set<string>
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function Calendar({ selectedDate, onSelect, closedWeekdays, blockedDateSet }: CalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(new Date()))
  const today = startOfToday()

  const firstDayOfMonth = startOfMonth(visibleMonth)
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
  const leadingBlanks = firstDayOfMonth.getDay()

  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), i + 1)),
  ]

  const canGoPrevious = startOfMonth(visibleMonth) > startOfMonth(today)

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-base font-medium text-charcoal">
          {visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={!canGoPrevious}
            onClick={() => setVisibleMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            className="rounded-lg p-1.5 text-graphite transition hover:bg-stone-100 disabled:opacity-30"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setVisibleMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="rounded-lg p-1.5 text-graphite transition hover:bg-stone-100"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-graphite/60">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i} className="py-1.5">
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />

          const isPast = date < today
          const isClosed = closedWeekdays.has(date.getDay())
          const isBlocked = blockedDateSet.has(toDateInput(date))
          const disabled = isPast || isClosed || isBlocked
          const isSelected = selectedDate && toDateInput(selectedDate) === toDateInput(date)
          const isToday = toDateInput(date) === toDateInput(today)

          return (
            <button
              key={toDateInput(date)}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={clsx(
                'relative aspect-square rounded-xl text-sm font-medium transition-all',
                disabled && 'cursor-not-allowed text-stone-300',
                !disabled && !isSelected && 'text-charcoal hover:bg-stone-100',
                isSelected && 'bg-navy text-white shadow-[0_6px_16px_-4px_rgba(15,36,56,0.5)]',
                isToday && !isSelected && 'font-bold text-navy'
              )}
            >
              {date.getDate()}
              {isToday && !isSelected && (
                <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-navy" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
