import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-dark/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-[0_30px_80px_-20px_rgba(8,21,33,0.45)] animate-fade-up max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between border-b border-stone-100 px-6 py-5">
          <div>
            <h3 className="font-display text-xl font-medium text-charcoal">{title}</h3>
            {description && <p className="mt-1 text-sm text-graphite">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-graphite transition hover:bg-stone-100 hover:text-charcoal"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto scroll-thin px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 border-t border-stone-100 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
