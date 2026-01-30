/**
 * Input component - Shinkofa Design System
 */

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = React.useId();
    const errorId = React.useId();
    const helperId = React.useId();

    const containerClasses = fullWidth ? 'w-full' : '';

    const inputBaseStyles = [
      'block',
      'rounded-lg',
      'border',
      'px-4',
      'py-2',
      'text-base',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-1',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:bg-beige-sable/50',
    ];

    const inputVariantStyles = error
      ? [
          'border-red-500',
          'text-red-900',
          'focus:border-red-500',
          'focus:ring-red-500',
        ]
      : [
          'border-beige-sable',
          'text-bleu-profond',
          'focus:border-accent-lumineux',
          'focus:ring-accent-lumineux',
        ];

    const inputWidthStyles = fullWidth ? ['w-full'] : ['min-w-[200px]'];

    const inputPaddingStyles = [];
    if (leftIcon) inputPaddingStyles.push('pl-10');
    if (rightIcon) inputPaddingStyles.push('pr-10');

    const inputClasses = [
      ...inputBaseStyles,
      ...inputVariantStyles,
      ...inputWidthStyles,
      ...inputPaddingStyles,
      className,
    ].join(' ');

    return (
      <div className={containerClasses}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-bleu-profond dark:text-blanc-pur mb-1"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-bleu-profond/50">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-bleu-profond/50">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={helperId}
            className="mt-1 text-sm text-bleu-profond/70 dark:text-blanc-pur/70"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const textareaId = React.useId();
    const errorId = React.useId();
    const helperId = React.useId();

    const containerClasses = fullWidth ? 'w-full' : '';

    const textareaBaseStyles = [
      'block',
      'rounded-lg',
      'border',
      'px-4',
      'py-2',
      'text-base',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-1',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:bg-beige-sable/50',
      'resize-vertical',
    ];

    const textareaVariantStyles = error
      ? [
          'border-red-500',
          'text-red-900',
          'focus:border-red-500',
          'focus:ring-red-500',
        ]
      : [
          'border-beige-sable',
          'text-bleu-profond',
          'focus:border-accent-lumineux',
          'focus:ring-accent-lumineux',
        ];

    const textareaWidthStyles = fullWidth ? ['w-full'] : ['min-w-[200px]'];

    const textareaClasses = [
      ...textareaBaseStyles,
      ...textareaVariantStyles,
      ...textareaWidthStyles,
      className,
    ].join(' ');

    return (
      <div className={containerClasses}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-bleu-profond dark:text-blanc-pur mb-1"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        />

        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={helperId}
            className="mt-1 text-sm text-bleu-profond/70 dark:text-blanc-pur/70"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
