import { useState, type FormEvent } from 'react'
import { CalendarX2, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/admin/PageHeader'
import { Card } from '../../components/admin/Card'
import { EmptyState } from '../../components/admin/EmptyState'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/Field'
import { useAdminBlockedDates } from '../../hooks/useAdminBlockedDates'
import { toDayLabel } from '../../lib/time'

export function BlockedDatesAdmin() {
  const { blockedDates, loading, addBlockedDate, removeBlockedDate } = useAdminBlockedDates()
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!date) {
      setError('Please choose a date to block.')
      return
    }
    setSaving(true)
    setError(null)
    const { error } = await addBlockedDate(date, reason)
    setSaving(false)
    if (error) {
      setError(error)
      return
    }
    setDate('')
    setReason('')
  }

  async function handleRemove(id: string) {
    setRemovingId(id)
    await removeBlockedDate(id)
    setRemovingId(null)
  }

  return (
    <div>
      <PageHeader title="Blocked Dates" description="Block off dates when viewings can't take place — holidays, maintenance, or closures." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="h-fit p-5">
          <h2 className="font-display text-base font-medium text-charcoal">Block a date</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <InputField label="Date" id="blocked-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <InputField
              label="Reason (optional)"
              id="blocked-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Public holiday, staff unavailable…"
            />
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <Button type="submit" className="w-full" loading={saving}>
              Block date
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-base font-medium text-charcoal">Blocked dates</h2>
          <div className="mt-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-stone-100" />
                ))}
              </div>
            ) : blockedDates.length === 0 ? (
              <EmptyState icon={CalendarX2} title="No blocked dates" description="Dates you block will prevent clients from booking viewings on those days." />
            ) : (
              <ul className="divide-y divide-stone-100">
                {blockedDates.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-4 py-3.5">
                    <div>
                      <p className="font-medium text-charcoal">{toDayLabel(new Date(`${b.blocked_date}T00:00:00`))}</p>
                      {b.reason && <p className="text-sm text-graphite">{b.reason}</p>}
                    </div>
                    <button
                      onClick={() => handleRemove(b.id)}
                      disabled={removingId === b.id}
                      aria-label="Remove blocked date"
                      className="rounded-lg p-2 text-graphite transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
