import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { BusinessSettings } from '../lib/database.types'

const FALLBACK_SETTINGS: BusinessSettings = {
  id: 'fallback',
  business_name: 'Meridian Property Group',
  business_email: 'viewings@meridianproperty.com',
  business_phone: '+1 (555) 010-2200',
  business_address: '400 Harbor View Avenue, Suite 12, Riverside District',
  slot_interval_minutes: 30,
  booking_notice_hours: 4,
  created_at: new Date().toISOString(),
}

export function useBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data, error } = await supabase.from('business_settings').select('*').limit(1).maybeSingle()

      if (cancelled) return

      if (error || !data) {
        setSettings(FALLBACK_SETTINGS)
      } else {
        setSettings(data)
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { settings: settings ?? FALLBACK_SETTINGS, loading }
}
