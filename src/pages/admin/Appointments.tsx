import { useMemo, useState } from 'react'
import { CalendarClock, Mail, Phone, StickyNote } from 'lucide-react'
import clsx from 'clsx'
import { PageHeader } from '../../components/admin/PageHeader'
import { Card } from '../../components/admin/Card'
import { EmptyState } from '../../components/admin/EmptyState'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useAppointments } from '../../hooks/useAppointments'
import type { AppointmentStatus } from '../../lib/database.types'

const FILTERS: { label: string; value: AppointmentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const STATUS_OPTIONS: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']

export function Appointments() {
  const { appointments, loading, updateStatus } = useAppointments()
  const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filtered = useMemo(
    () => (filter === 'all' ? appointments : appointments.filter((a) => a.status === filter)),
    [appointments, filter]
  )

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    setUpdatingId(id)
    await updateStatus(id, status)
    setUpdatingId(null)
  }

  return (
    <div>
      <PageHeader title="Appointments" description="Review and manage every property viewing request." />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={clsx(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition',
              filter === f.value ? 'border-navy bg-navy text-white' : 'border-stone-200 bg-white text-graphite hover:border-navy/30'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-stone-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No appointments found" description="Try a different filter, or check back once new requests come in." />
      ) : (
        <div className="space-y-4">
          {filtered.map((appt) => (
            <Card key={appt.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="font-display text-base font-medium text-charcoal">{appt.full_name}</p>
                    <StatusBadge status={appt.status} />
                  </div>
                  <p className="mt-1 text-sm text-graphite">
                    {appt.services?.name ?? 'Viewing'} · {appt.appointment_date} · {appt.start_time.slice(0, 5)}–
                    {appt.end_time.slice(0, 5)}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-graphite">
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} /> {appt.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} /> {appt.phone}
                    </span>
                  </div>

                  {appt.notes && (
                    <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-stone-50 px-3 py-2 text-sm text-graphite">
                      <StickyNote size={13} className="mt-0.5 shrink-0" />
                      {appt.notes}
                    </p>
                  )}
                </div>

                <select
                  value={appt.status}
                  disabled={updatingId === appt.id}
                  onChange={(e) => handleStatusChange(appt.id, e.target.value as AppointmentStatus)}
                  className="shrink-0 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-charcoal focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s[0].toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
