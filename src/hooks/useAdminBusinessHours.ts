import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { BusinessHour } from '../lib/database.types'

export function useAdminBusinessHours() {
  const [hours, setHours] = useState<BusinessHour[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('business_hours').select('*').order('weekday', { ascending: true })
    setHours(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function updateDay(id: string, patch: Partial<Pick<BusinessHour, 'is_open' | 'start_time' | 'end_time'>>) {
    const { data, error } = await supabase.from('business_hours').update(patch).eq('id', id).select().maybeSingle()
    if (!error && data) setHours((prev) => prev.map((h) => (h.id === id ? data : h)))
    return { error: error?.message ?? null }
  }

  return { hours, loading, updateDay }
}
