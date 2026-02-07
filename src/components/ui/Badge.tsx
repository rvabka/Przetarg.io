import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: 'success' | 'warning' | 'error' | 'info' | 'default'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  children: ReactNode
}

export function Badge({
  status = 'default',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1 font-bold rounded-full uppercase tracking-wide'

  const statusClasses = {
    success: 'text-emerald-700 bg-emerald-100/80 border border-emerald-200',
    warning: 'text-yellow-700 bg-yellow-100/80 border border-yellow-200',
    error: 'text-red-700 bg-red-100/80 border border-red-200',
    info: 'text-blue-700 bg-blue-100/80 border border-blue-200',
    default: 'text-text-muted-light bg-white border border-border-light'
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-3 py-1.5',
    lg: 'text-sm px-4 py-2'
  }

  return (
    <span
      className={cn(baseClasses, statusClasses[status], sizeClasses[size], className)}
      {...props}
    >
      {icon && (
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
      )}
      {children}
    </span>
  )
}
