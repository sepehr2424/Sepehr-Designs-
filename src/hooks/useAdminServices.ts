import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Service } from '../lib/database.types'

export interface ServiceInput {
  name: string
  description: string
  duration_minutes: number
  price: number
  is_active: boolean
}

export function useAdminServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('services').select('*').order('created_at', { ascending: true })
    setServices(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createService(input: ServiceInput) {
    const { data, error } = await supabase.from('services').insert(input).select().maybeSingle()
    if (!error && data) setServices((prev) => [...prev, data])
    return { error: error?.message ?? null }
  }

  async function updateService(id: string, input: Partial<ServiceInput>) {
    const { data, error } = await supabase.from('services').update(input).eq('id', id).select().maybeSingle()
    if (!error && data) setServices((prev) => prev.map((s) => (s.id === id ? data : s)))
    return { error: error?.message ?? null }
  }

  async function toggleActive(id: string, is_active: boolean) {
    return updateService(id, { is_active })
  }

  return { services, loading, refetch: load, createService, updateService, toggleActive }
}
