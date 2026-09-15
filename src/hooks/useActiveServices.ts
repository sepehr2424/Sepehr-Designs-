import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Service } from '../lib/database.types'

export function useActiveServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })

      if (cancelled) return

      if (error) {
        setError(error.message)
      } else {
        setServices(data ?? [])
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { services, loading, error }
}
