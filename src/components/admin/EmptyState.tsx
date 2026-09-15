import type { LucideIcon } from 'lucide-react'

export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-stone-50/50 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-graphite">
        <Icon size={22} />
      </span>
      <p className="font-display text-base font-medium text-charcoal">{title}</p>
      <p className="max-w-sm text-sm text-graphite">{description}</p>
    </div>
  )
}
