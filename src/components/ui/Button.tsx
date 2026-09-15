import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline-light' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-navy text-cream hover:bg-navy-light shadow-[0_8px_24px_-8px_rgba(15,36,56,0.55)] focus-visible:outline-navy',
  secondary:
    'bg-gold text-navy-dark hover:bg-gold-light shadow-[0_8px_24px_-8px_rgba(184,147,90,0.55)] focus-visible:outline-gold',
  ghost: 'bg-transparent text-charcoal hover:bg-stone-100 focus-visible:outline-charcoal',
  'outline-light':
    'bg-white/0 text-white border border-white/50 hover:bg-white/10 backdrop-blur-sm focus-visible:outline-white',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-4 py-2 gap-1.5 rounded-lg',
  md: 'text-sm px-5 py-3 gap-2 rounded-xl',
  lg: 'text-base px-7 py-4 gap-2.5 rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 ease-out',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  )
}
