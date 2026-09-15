import { useState, type FormEvent } from 'react'
import { Key, Lock, Mail } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/Field'
import { useAdminAuth } from '../../context/AdminAuthProvider'

export function AdminLogin() {
  const { signIn } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signIn(email.trim(), password)
    setSubmitting(false)
    if (error) setError(error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-dark px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-gold-light">
            <Key size={20} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-medium text-white">Property Manager Access</h1>
          <p className="mt-1.5 text-sm text-stone-400">Sign in to manage viewings, services, and appointments.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-premium">
          <div className="space-y-5">
            <InputField
              label="Email"
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@meridianproperty.com"
            />
            <InputField
              label="Password"
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" className="mt-6 w-full" loading={submitting} icon={<Lock size={15} />}>
            Sign In
          </Button>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-graphite/70">
            <Mail size={12} /> Access is restricted to authorized property viewing staff.
          </p>
        </form>
      </div>
    </div>
  )
}
