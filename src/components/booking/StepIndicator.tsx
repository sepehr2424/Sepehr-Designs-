import { Check } from 'lucide-react'
import clsx from 'clsx'

const STEPS = ['Viewing Type', 'Date & Time', 'Your Details', 'Confirmed']

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((label, i) => {
        const stepNumber = i + 1
        const isComplete = currentStep > stepNumber
        const isCurrent = currentStep === stepNumber

        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isComplete && 'bg-emerald text-white',
                  isCurrent && 'bg-navy text-white',
                  !isComplete && !isCurrent && 'bg-stone-200 text-graphite'
                )}
              >
                {isComplete ? <Check size={14} /> : stepNumber}
              </span>
              <span
                className={clsx(
                  'hidden text-sm font-medium sm:block',
                  isCurrent ? 'text-charcoal' : 'text-graphite/70'
                )}
              >
                {label}
              </span>
            </div>
            {stepNumber < STEPS.length && <span className="h-px w-6 bg-stone-200 sm:w-10" />}
          </li>
        )
      })}
    </ol>
  )
}
