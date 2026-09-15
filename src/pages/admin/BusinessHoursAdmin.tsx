import { useState } from 'react'
import { PageHeader } from '../../components/admin/PageHeader'
import { Card } from '../../components/admin/Card'
import { useAdminBusinessHours } from '../../hooks/useAdminBusinessHours'

const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function BusinessHoursAdmin() {
  const { hours, loading, updateDay } = useAdminBusinessHours()
  const [savingId, setSavingId] = useState<string | null>(null)

  async function handleUpdate(id: string, patch: Parameters<typeof updateDay>[1]) {
    setSavingId(id)
    await updateDay(id, patch)
    setSavingId(null)
  }

  return (
    <div>
      <PageHeader title="Business Hours" description="Set weekly availability. Booking slots are generated from these hours." />

      <Card className="divide-y divide-stone-100 p-2">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-stone-100" />
            ))}
          </div>
        ) : (
          hours.map((day) => (
            <div key={day.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex w-40 items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={day.is_open}
                    disabled={savingId === day.id}
                    onChange={(e) => handleUpdate(day.id, { is_open: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-stone-200 transition peer-checked:bg-emerald" />
                  <div className="absolute left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                </label>
                <span className="font-medium text-charcoal">{WEEKDAY_LABELS[day.weekday]}</span>
              </div>

              {day.is_open ? (
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="time"
                    value={day.start_time.slice(0, 5)}
                    disabled={savingId === day.id}
                    onChange={(e) => handleUpdate(day.id, { start_time: e.target.value })}
                    className="rounded-lg border border-stone-200 px-3 py-1.5 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
                  />
                  <span className="text-graphite">to</span>
                  <input
                    type="time"
                    value={day.end_time.slice(0, 5)}
                    disabled={savingId === day.id}
                    onChange={(e) => handleUpdate(day.id, { end_time: e.target.value })}
                    className="rounded-lg border border-stone-200 px-3 py-1.5 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
                  />
                </div>
              ) : (
                <span className="text-sm font-medium text-graphite/60">Closed</span>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
