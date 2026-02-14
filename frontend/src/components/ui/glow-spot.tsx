import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface GlowSpotProps extends HTMLAttributes<HTMLDivElement> {
  variant: 'hero' | 'accent' | 'mobile';
  position?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  opacity?: number;
}

export function GlowSpot({
  variant,
  position = {},
  opacity,
  className,
  ...props
}: GlowSpotProps) {
  const variantClasses = {
    hero: 'glow-hero',
    accent: 'glow-accent',
    mobile: 'glow-mobile'
  };

  const positionStyles = {
    ...(position.top && { top: position.top }),
    ...(position.bottom && { bottom: position.bottom }),
    ...(position.left && { left: position.left }),
    ...(position.right && { right: position.right }),
    ...(opacity && { opacity: opacity.toString() })
  };

  return (
    <div
      className={cn('glow-spot', variantClasses[variant], className)}
      style={positionStyles}
      {...props}
    />
  );
}
