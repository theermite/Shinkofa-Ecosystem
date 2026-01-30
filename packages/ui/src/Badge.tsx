/**
 * Badge component - Shinkofa Design System
 */

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      dot = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      'inline-flex',
      'items-center',
      'gap-1.5',
      'font-medium',
      'rounded-full',
      'whitespace-nowrap',
    ];

    const variantStyles = {
      default: ['bg-beige-sable', 'text-bleu-profond'],
      success: ['bg-green-100', 'text-green-800'],
      warning: ['bg-yellow-100', 'text-yellow-800'],
      error: ['bg-red-100', 'text-red-800'],
      info: ['bg-blue-100', 'text-blue-800'],
    };

    const sizeStyles = {
      sm: ['text-xs', 'px-2', 'py-0.5'],
      md: ['text-sm', 'px-2.5', 'py-0.5'],
      lg: ['text-base', 'px-3', 'py-1'],
    };

    const dotSizeStyles = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    };

    const classes = [
      ...baseStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      className,
    ].join(' ');

    return (
      <span ref={ref} className={classes} {...props}>
        {dot && (
          <span
            className={`rounded-full ${dotSizeStyles[size]} ${
              variant === 'default'
                ? 'bg-bleu-profond'
                : variant === 'success'
                ? 'bg-green-600'
                : variant === 'warning'
                ? 'bg-yellow-600'
                : variant === 'error'
                ? 'bg-red-600'
                : 'bg-blue-600'
            }`}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
