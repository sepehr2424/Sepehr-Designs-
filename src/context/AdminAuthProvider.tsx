import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AdminAuthState {
  session: Session | null
  user: User | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthState | null>(null)

async function checkIsAdmin(user: User): Promise<boolean> {
  const { data } = await supabase.from('admin_users').select('id').eq('user_id', user.id).maybeSingle()
  return Boolean(data)
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true

    async function init() {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        if (!currentSession) {
          if (mounted.current) {
            setSession(null)
            setUser(null)
            setIsAdmin(false)
          }
          return
        }

        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          if (mounted.current) {
            setSession(currentSession)
            setUser(null)
            setIsAdmin(false)
          }
          return
        }

        const admin = await checkIsAdmin(currentUser)

        if (mounted.current) {
          setSession(currentSession)
          setUser(currentUser)
          setIsAdmin(admin)
        }
      } finally {
        if (mounted.current) setLoading(false)
      }
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_OUT') {
        setSession(null)
        setUser(null)
        setIsAdmin(false)
        return
      }

      setSession(newSession)
      const nextUser = newSession?.user ?? null
      setUser(nextUser)

      if (nextUser) {
        const admin = await checkIsAdmin(nextUser)
        if (mounted.current) setIsAdmin(admin)
      } else {
        setIsAdmin(false)
      }
    })

    return () => {
      mounted.current = false
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AdminAuthContext.Provider value={{ session, user, isAdmin, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
