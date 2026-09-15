import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Appointment, AppointmentStatus } from '../lib/database.types'

export interface AppointmentWithService extends Appointment {
  services: { name: string } | null
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<AppointmentWithService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('appointments')
      .select('*, services(name)')
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setAppointments((data as unknown as AppointmentWithService[]) ?? [])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function updateStatus(id: string, status: AppointmentStatus) {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (!error) {
      setAppointments((prev) => prev.map((appt) => (appt.id === id ? { ...appt, status } : appt)))
    }
    return { error: error?.message ?? null }
  }

  return { appointments, loading, error, refetch: load, updateStatus }
}
