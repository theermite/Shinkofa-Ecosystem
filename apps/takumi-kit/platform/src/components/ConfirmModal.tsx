/**
 * ConfirmModal Component - Modal de confirmation reusable
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { AlertTriangle, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
  children?: React.ReactNode
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  loading = false,
  children,
}: ConfirmModalProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: {
      icon: 'text-ermite-error',
      button: 'bg-ermite-error hover:bg-red-600',
    },
    warning: {
      icon: 'text-ermite-warning',
      button: 'bg-ermite-warning hover:bg-amber-600',
    },
    info: {
      icon: 'text-ermite-primary',
      button: 'bg-ermite-primary hover:bg-ermite-primary-hover',
    },
  }

  const styles = variantStyles[variant]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-ermite-card border border-ermite-border rounded-xl shadow-xl w-full max-w-md animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1 text-ermite-text-secondary hover:text-ermite-text transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={cn('p-3 rounded-full bg-ermite-bg-secondary', styles.icon)}>
              <AlertTriangle className="w-8 h-8" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-ermite-text text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-ermite-text-secondary text-center mb-6">
            {message}
          </p>

          {/* Children (optional extra content) */}
          {children && <div className="mb-6">{children}</div>}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-ermite-bg-secondary hover:bg-ermite-card-hover border border-ermite-border text-ermite-text rounded-lg transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg transition-colors disabled:opacity-50',
                styles.button
              )}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
