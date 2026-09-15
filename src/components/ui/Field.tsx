import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'

const baseControl =
  'w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-graphite/50 transition focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10 disabled:bg-stone-50 disabled:text-graphite'

function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-graphite">
      {children}
    </label>
  )
}

interface FieldWrapProps {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: ReactNode
}

export function FieldWrap({ label, htmlFor, hint, error, children }: FieldWrapProps) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-graphite/70">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
}

export function InputField({ label, hint, error, id, className, ...props }: InputFieldProps) {
  return (
    <FieldWrap label={label} htmlFor={id} hint={hint} error={error}>
      <input id={id} className={clsx(baseControl, error && 'border-red-300', className)} {...props} />
    </FieldWrap>
  )
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
  error?: string
}

export function TextareaField({ label, hint, error, id, className, ...props }: TextareaFieldProps) {
  return (
    <FieldWrap label={label} htmlFor={id} hint={hint} error={error}>
      <textarea id={id} className={clsx(baseControl, 'resize-none', error && 'border-red-300', className)} {...props} />
    </FieldWrap>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  hint?: string
  error?: string
}

export function SelectField({ label, hint, error, id, className, children, ...props }: SelectFieldProps) {
  return (
    <FieldWrap label={label} htmlFor={id} hint={hint} error={error}>
      <select id={id} className={clsx(baseControl, error && 'border-red-300', className)} {...props}>
        {children}
      </select>
    </FieldWrap>
  )
}

export { baseControl }
