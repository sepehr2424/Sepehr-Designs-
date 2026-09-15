import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidHttpUrl = (value: string | undefined): value is string => {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const configured = isValidHttpUrl(rawUrl) && Boolean(rawKey)

if (!configured) {
  console.warn(
    'Supabase environment variables are missing or invalid. Add a real VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local — the app will run with no data until then.'
  )
}

// Fall back to a syntactically valid placeholder so createClient() never throws
// before real credentials are configured; every request will simply fail and
// the app's own loading/empty states take over.
export const supabase = createClient<Database>(
  configured ? rawUrl : 'https://placeholder.supabase.co',
  configured ? rawKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
