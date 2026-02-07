import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  filled?: boolean;
}

export function Icon({
  name,
  size = 'md',
  color,
  filled = false,
  className,
  ...props
}: IconProps) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  const filledStyle = filled
    ? { fontVariationSettings: "'FILL' 1" }
    : undefined;

  return (
    <span
      className={cn('material-symbols-outlined', sizeClasses[size], className)}
      style={{ color, ...filledStyle }}
      {...props}
    >
      {name}
    </span>
  );
}
