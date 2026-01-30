/**
 * Loading/Spinner component - Shinkofa Design System
 */

import React from 'react';

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-blanc-pur/80 dark:bg-bleu-profond/80 z-50'
    : 'flex items-center justify-center';

  const renderSpinner = () => (
    <svg
      className={`animate-spin text-accent-lumineux ${sizeStyles[size]}`}
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
  );

  const renderDots = () => {
    const dotSize = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
    }[size];

    return (
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${dotSize} rounded-full bg-accent-lumineux animate-bounce`}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.6s',
            }}
          />
        ))}
      </div>
    );
  };

  const renderPulse = () => {
    return (
      <div className={`${sizeStyles[size]} rounded-full bg-accent-lumineux animate-pulse`} />
    );
  };

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  return (
    <div
      className={`${containerClasses} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={text || 'Chargement en cours'}
      {...props}
    >
      <div className="flex flex-col items-center gap-3">
        {renderVariant()}
        {text && (
          <p className="text-sm text-bleu-profond dark:text-blanc-pur">
            {text}
          </p>
        )}
        <span className="sr-only">{text || 'Chargement en cours'}</span>
      </div>
    </div>
  );
};

Loading.displayName = 'Loading';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  count = 1,
  className = '',
  ...props
}) => {
  const baseStyles = 'animate-pulse bg-beige-sable dark:bg-bleu-profond/50';

  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '100px'),
  };

  const skeletonClasses = `${baseStyles} ${variantStyles[variant]} ${className}`;

  if (count === 1) {
    return <div className={skeletonClasses} style={style} {...props} />;
  }

  return (
    <div className="space-y-2" {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={skeletonClasses} style={style} />
      ))}
    </div>
  );
};

Skeleton.displayName = 'Skeleton';
