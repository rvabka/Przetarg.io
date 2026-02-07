import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  iconPosition?: 'left' | 'right'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-bold transition-all inline-flex items-center justify-center gap-2 rounded-full'

  const variantClasses = {
    primary: 'bg-primary hover:bg-emerald-800 text-white shadow-lg shadow-emerald-900/20',
    secondary: 'bg-black hover:bg-gray-800 text-white',
    outline: 'bg-transparent border-2 border-border-light hover:bg-gray-50 text-text-main-light',
    ghost: 'bg-transparent hover:text-primary transition-colors text-text-main-light'
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-2 text-sm',
    lg: 'px-12 py-6 text-xl'
  }

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="material-symbols-outlined text-sm">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="material-symbols-outlined text-sm">{icon}</span>
      )}
    </button>
  )
}
