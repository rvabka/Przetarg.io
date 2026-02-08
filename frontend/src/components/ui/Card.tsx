import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
  hoverable?: boolean;
  children: ReactNode;
}

export function Card({
  variant = 'default',
  hoverable = false,
  className,
  children,
  ...props
}: CardProps) {
  const baseClasses = 'rounded-2xl bg-white';

  const variantClasses = {
    default: 'border border-gray-100',
    elevated: 'shadow-card border border-gray-100',
    bordered: 'border-2 border-border-light'
  };

  const hoverClasses = hoverable
    ? 'hover:shadow-xl hover:border-primary/50 transition-all'
    : '';

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
