import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: 'navy' | 'gold' | 'emerald' | 'amber'
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  navy: 'bg-navy/8 text-navy',
  gold: 'bg-gold/15 text-taupe-dark',
  emerald: 'bg-emerald/10 text-emerald',
  amber: 'bg-amber-100 text-amber-700',
}

export function StatCard({ label, value, icon: Icon, tone = 'navy' }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="font-display text-2xl font-medium text-charcoal">{value}</p>
        <p className="text-xs font-medium uppercase tracking-wide text-graphite">{label}</p>
      </div>
    </Card>
  )
}
