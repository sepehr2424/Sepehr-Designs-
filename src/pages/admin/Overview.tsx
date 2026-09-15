import { CalendarClock, CheckCircle2, Clock4, Home } from 'lucide-react'
import { PageHeader } from '../../components/admin/PageHeader'
import { StatCard } from '../../components/admin/StatCard'
import { Card } from '../../components/admin/Card'
import { EmptyState } from '../../components/admin/EmptyState'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useAppointments } from '../../hooks/useAppointments'
import { useAdminServices } from '../../hooks/useAdminServices'
import { toDateInput } from '../../lib/time'

export function Overview() {
  const { appointments, loading: loadingAppointments } = useAppointments()
  const { services, loading: loadingServices } = useAdminServices()

  const today = toDateInput(new Date())

  const upcoming = appointments.filter(
    (a) => a.appointment_date >= today && (a.status === 'pending' || a.status === 'confirmed')
  )
  const pendingCount = appointments.filter((a) => a.status === 'pending').length
  const completedCount = appointments.filter((a) => a.status === 'completed').length
  const activeServicesCount = services.filter((s) => s.is_active).length

  const loading = loadingAppointments || loadingServices

  return (
    <div>
      <PageHeader title="Overview" description="A snapshot of viewing activity and where things stand today." />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming viewings" value={loading ? '—' : upcoming.length} icon={CalendarClock} tone="navy" />
        <StatCard label="Pending requests" value={loading ? '—' : pendingCount} icon={Clock4} tone="amber" />
        <StatCard label="Completed viewings" value={loading ? '—' : completedCount} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Active viewing types" value={loading ? '—' : activeServicesCount} icon={Home} tone="gold" />
      </div>

      <Card className="mt-8 p-6">
        <h2 className="font-display text-lg font-medium text-charcoal">Upcoming appointments</h2>
        <p className="mt-1 text-sm text-graphite">The next scheduled and pending property viewings.</p>

        <div className="mt-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-stone-100" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No upcoming viewings" description="New appointment requests will appear here as clients book." />
          ) : (
            <div className="divide-y divide-stone-100">
              {upcoming.slice(0, 8).map((appt) => (
                <div key={appt.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                  <div>
                    <p className="font-medium text-charcoal">{appt.full_name}</p>
                    <p className="text-sm text-graphite">
                      {appt.services?.name ?? 'Viewing'} · {appt.appointment_date} at {appt.start_time.slice(0, 5)}
                    </p>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
