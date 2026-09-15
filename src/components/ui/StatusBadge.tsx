import type { AppointmentStatus } from '../../lib/database.types'
import { Badge } from './Badge'

const config: Record<AppointmentStatus, { label: string; tone: 'navy' | 'emerald' | 'red' | 'amber' }> = {
  pending: { label: 'Pending', tone: 'amber' },
  confirmed: { label: 'Confirmed', tone: 'navy' },
  completed: { label: 'Completed', tone: 'emerald' },
  cancelled: { label: 'Cancelled', tone: 'red' },
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { label, tone } = config[status]
  return <Badge tone={tone}>{label}</Badge>
}
