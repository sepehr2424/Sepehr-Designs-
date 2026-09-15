import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { BlockedDate } from '../lib/database.types'

export function useAdminBlockedDates() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('blocked_dates').select('*').order('blocked_date', { ascending: true })
    setBlockedDates(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function addBlockedDate(blocked_date: string, reason: string) {
    const { data, error } = await supabase
      .from('blocked_dates')
      .insert({ blocked_date, reason: reason || null })
      .select()
      .maybeSingle()
    if (!error && data) setBlockedDates((prev) => [...prev, data].sort((a, b) => a.blocked_date.localeCompare(b.blocked_date)))
    return { error: error?.message ?? null }
  }

  async function removeBlockedDate(id: string) {
    const { error } = await supabase.from('blocked_dates').delete().eq('id', id)
    if (!error) setBlockedDates((prev) => prev.filter((b) => b.id !== id))
    return { error: error?.message ?? null }
  }

  return { blockedDates, loading, addBlockedDate, removeBlockedDate }
}
