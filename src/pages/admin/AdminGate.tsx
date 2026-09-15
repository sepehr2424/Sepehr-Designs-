import type { ReactNode } from 'react'
import { ShieldAlert } from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthProvider'
import { AdminLogin } from './AdminLogin'
import { Button } from '../../components/ui/Button'

export function AdminGate({ children }: { children: ReactNode }) {
  const { loading, session, isAdmin, signOut } = useAdminAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-dark">
        <div className="flex flex-col items-center gap-3 text-stone-300">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p className="text-sm">Verifying access…</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <AdminLogin />
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy-dark px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <ShieldAlert size={26} />
        </span>
        <h1 className="font-display text-xl font-medium text-white">Not authorized</h1>
        <p className="max-w-sm text-sm text-stone-400">
          You are signed in, but you are not authorized as an admin. Contact your property management team to
          request access.
        </p>
        <Button variant="outline-light" onClick={signOut}>
          Sign out
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
