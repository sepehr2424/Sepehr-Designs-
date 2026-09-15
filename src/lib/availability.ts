import type { BlockedDate, BusinessHour, BusinessSettings, Service } from './database.types'
import { addMinutes, combineDateAndTime, toDateInput, toTimeLabel } from './time'

export interface TimeSlot {
  start: Date
  end: Date
  label: string
}

/** A previously-booked time range for one day. No customer data — see get_booked_intervals(). */
export interface BookedInterval {
  start_time: string
  end_time: string
}

interface GetAvailableSlotsParams {
  date: Date
  service: Service
  businessHours: BusinessHour[]
  blockedDates: BlockedDate[]
  settings: BusinessSettings
  bookedIntervals: BookedInterval[]
  now?: Date
}

function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && endA > startB
}

export function getAvailableSlots({
  date,
  service,
  businessHours,
  blockedDates,
  settings,
  bookedIntervals,
  now = new Date(),
}: GetAvailableSlotsParams): TimeSlot[] {
  const isoDate = toDateInput(date)

  const isBlocked = blockedDates.some((blocked) => blocked.blocked_date === isoDate)
  if (isBlocked) return []

  const weekday = date.getDay()
  const hoursForDay = businessHours.find((hours) => hours.weekday === weekday)
  if (!hoursForDay || !hoursForDay.is_open) return []

  const dayStart = combineDateAndTime(date, hoursForDay.start_time)
  const dayEnd = combineDateAndTime(date, hoursForDay.end_time)
  if (isNaN(dayStart.getTime()) || isNaN(dayEnd.getTime()) || dayStart >= dayEnd) return []

  const interval = Math.max(5, settings.slot_interval_minutes || 30)
  const duration = Math.max(5, service.duration_minutes || 30)
  const noticeMs = Math.max(0, settings.booking_notice_hours || 0) * 60 * 60 * 1000
  const earliestStart = new Date(now.getTime() + noticeMs)

  const slots: TimeSlot[] = []
  let cursor = dayStart

  while (cursor < dayEnd) {
    const slotStart = cursor
    const slotEnd = addMinutes(cursor, duration)

    if (slotEnd > dayEnd) break

    const meetsNotice = slotStart >= earliestStart

    const overlapsExisting = bookedIntervals.some((booked) => {
      const apptStart = combineDateAndTime(date, booked.start_time)
      const apptEnd = combineDateAndTime(date, booked.end_time)
      return rangesOverlap(slotStart, slotEnd, apptStart, apptEnd)
    })

    if (meetsNotice && !overlapsExisting) {
      slots.push({ start: slotStart, end: slotEnd, label: toTimeLabel(slotStart) })
    }

    cursor = addMinutes(cursor, interval)
  }

  return slots
}
