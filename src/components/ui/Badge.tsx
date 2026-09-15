import type { ReactNode } from 'react'
import clsx from 'clsx'

type Tone = 'navy' | 'gold' | 'emerald' | 'stone' | 'red' | 'amber'

const toneClasses: Record<Tone, string> = {
  navy: 'bg-navy/10 text-navy border-navy/15',
  gold: 'bg-gold/15 text-taupe-dark border-gold/25',
  emerald: 'bg-emerald/10 text-emerald border-emerald/20',
  stone: 'bg-stone-100 text-graphite border-stone-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
}

export function Badge({ tone = 'stone', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  )
}
