import type { HTMLAttributes } from 'react'
import clsx from 'clsx'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('rounded-2xl border border-stone-200 bg-white shadow-[0_2px_16px_-8px_rgba(33,31,28,0.08)]', className)}
      {...props}
    />
  )
}
