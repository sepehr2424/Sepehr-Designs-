import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { BlockedDate, BusinessHour, BusinessSettings, Service } from '../lib/database.types'
import { getAvailableSlots, type BookedInterval, type TimeSlot } from '../lib/availability'
import { toDateInput } from '../lib/time'

export function useBookingAvailability(settings: BusinessSettings) {
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loadingCalendar, setLoadingCalendar] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoadingCalendar(true)
      const [hoursRes, blockedRes] = await Promise.all([
        supabase.from('business_hours').select('*').order('weekday', { ascending: true }),
        supabase.from('blocked_dates').select('*'),
      ])

      if (cancelled) return

      setBusinessHours(hoursRes.data ?? [])
      setBlockedDates(blockedRes.data ?? [])
      setLoadingCalendar(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const closedWeekdays = new Set(
    businessHours.filter((hours) => !hours.is_open).map((hours) => hours.weekday)
  )
  const blockedDateSet = new Set(blockedDates.map((blocked) => blocked.blocked_date))

  async function loadSlotsForDate(date: Date, service: Service): Promise<TimeSlot[]> {
    const isoDate = toDateInput(date)
    const { data, error } = await supabase.rpc('get_booked_intervals', { p_date: isoDate })
    const bookedIntervals: BookedInterval[] = error || !data ? [] : data

    return getAvailableSlots({
      date,
      service,
      businessHours,
      blockedDates,
      settings,
      bookedIntervals,
    })
  }

  return { businessHours, blockedDates, closedWeekdays, blockedDateSet, loadingCalendar, loadSlotsForDate }
}
