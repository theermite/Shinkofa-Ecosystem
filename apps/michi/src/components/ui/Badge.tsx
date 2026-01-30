/**
 * Badge Component - Atomic UI
 * Shinkofa Platform - Frontend
 */

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'custom'
  size?: 'sm' | 'md' | 'lg'
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-full font-semibold transition-colors'

    const variants = {
      default:
        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      success:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      error:
        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      info:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      custom: '', // Allow custom classes via className prop
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    }

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          variant !== 'custom' && variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
