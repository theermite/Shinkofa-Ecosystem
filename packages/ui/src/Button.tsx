/**
 * Button component - Shinkofa Design System
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-2',
      'font-medium',
      'rounded-lg',
      'transition-all',
      'duration-200',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
    ];

    const variantStyles = {
      primary: [
        'bg-accent-lumineux',
        'text-blanc-pur',
        'hover:bg-accent-lumineux/90',
        'focus-visible:ring-accent-lumineux',
      ],
      secondary: [
        'bg-bleu-profond',
        'text-blanc-pur',
        'hover:bg-bleu-profond/90',
        'focus-visible:ring-bleu-profond',
      ],
      outline: [
        'border-2',
        'border-accent-lumineux',
        'text-accent-lumineux',
        'hover:bg-accent-lumineux/10',
        'focus-visible:ring-accent-lumineux',
      ],
      ghost: [
        'text-bleu-profond',
        'hover:bg-beige-sable',
        'focus-visible:ring-bleu-profond',
      ],
    };

    const sizeStyles = {
      sm: ['text-sm', 'px-3', 'py-1.5', 'min-h-[32px]'],
      md: ['text-base', 'px-4', 'py-2', 'min-h-[40px]'],
      lg: ['text-lg', 'px-6', 'py-3', 'min-h-[48px]'],
    };

    const widthStyles = fullWidth ? ['w-full'] : [];

    const classes = [
      ...baseStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...widthStyles,
      className,
    ].join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
