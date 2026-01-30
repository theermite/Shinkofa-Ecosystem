/**
 * Card component - Shinkofa Design System
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hover = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      'rounded-xl',
      'transition-all',
      'duration-200',
    ];

    const variantStyles = {
      default: ['bg-blanc-pur', 'dark:bg-bleu-fonce'],
      bordered: [
        'bg-blanc-pur',
        'dark:bg-bleu-fonce',
        'border-2',
        'border-beige-sable',
        'dark:border-bleu-profond',
      ],
      elevated: [
        'bg-blanc-pur',
        'dark:bg-bleu-fonce',
        'shadow-shinkofa',
      ],
    };

    const paddingStyles = {
      none: [],
      sm: ['p-4'],
      md: ['p-6'],
      lg: ['p-8'],
    };

    const hoverStyles = hover
      ? ['hover:shadow-shinkofa-lg', 'hover:scale-[1.02]', 'cursor-pointer']
      : [];

    const classes = [
      ...baseStyles,
      ...variantStyles[variant],
      ...paddingStyles[padding],
      ...hoverStyles,
      className,
    ].join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {title && (
        <h3 className="text-xl font-bold text-bleu-profond dark:text-blanc-pur mb-1">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-sm text-bleu-profond/70 dark:text-blanc-pur/70">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
};

CardHeader.displayName = 'CardHeader';

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

CardBody.displayName = 'CardBody';

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`mt-4 pt-4 border-t border-beige-sable dark:border-bleu-profond ${className}`} {...props}>
      {children}
    </div>
  );
};

CardFooter.displayName = 'CardFooter';
