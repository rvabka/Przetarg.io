import { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string
  error?: boolean
}

export function Input({
  icon,
  error = false,
  className,
  ...props
}: InputProps) {
  const baseClasses = 'w-full bg-transparent border-none text-text-main-light placeholder-gray-400 focus:ring-0 text-sm font-medium rounded-full'
  const iconClasses = icon ? 'pl-10 pr-4' : 'px-4'
  const errorClasses = error ? 'ring-2 ring-red-500' : ''

  return (
    <div className="relative w-full">
      {icon && (
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
      )}
      <input
        className={cn(baseClasses, iconClasses, errorClasses, className)}
        {...props}
      />
    </div>
  )
}
