import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { BusinessSettings } from '../lib/database.types'

export function useAdminBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('business_settings').select('*').limit(1).maybeSingle()
    setSettings(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function save(patch: Partial<BusinessSettings>) {
    if (!settings) return { error: 'Settings not loaded yet.' }
    const { data, error } = await supabase
      .from('business_settings')
      .update(patch)
      .eq('id', settings.id)
      .select()
      .maybeSingle()
    if (!error && data) setSettings(data)
    return { error: error?.message ?? null }
  }

  return { settings, loading, save }
}
