import type { ReactNode } from 'react'
import clsx from 'clsx'

interface SectionHeadingProps {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  tone?: 'dark' | 'light'
}

export function SectionHeading({ eyebrow, title, description, align = 'left', tone = 'dark' }: SectionHeadingProps) {
  return (
    <div className={clsx('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      <span
        className={clsx(
          'inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]',
          tone === 'dark' ? 'text-gold-light' : 'text-taupe-dark'
        )}
      >
        <span className={clsx('h-px w-8', tone === 'dark' ? 'bg-gold-light' : 'bg-taupe')} />
        {eyebrow}
      </span>
      <h2
        className={clsx(
          'mt-4 text-balance font-display text-3xl font-medium leading-[1.1] sm:text-4xl md:text-5xl',
          tone === 'dark' ? 'text-white' : 'text-charcoal'
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={clsx('mt-5 text-balance text-base leading-relaxed sm:text-lg', tone === 'dark' ? 'text-stone-200' : 'text-graphite')}>
          {description}
        </p>
      )}
    </div>
  )
}
