import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Icon } from '../ui/icon';

interface IndustryCardProps {
  image: string;
  title: string;
  subtitle?: string;
  description?: string;
  variant: 'large' | 'medium' | 'small' | 'cta';
  className?: string;
  children?: ReactNode;
}

export function IndustryCard({
  image,
  title,
  subtitle,
  description,
  variant,
  className,
  children: _children
}: IndustryCardProps) {
  if (variant === 'cta') {
    return (
      <div
        className={cn(
          'relative bg-white border border-gray-100 rounded-xl p-6 sm:p-8 md:p-10 flex flex-col justify-center items-start group hover:bg-white transition-colors duration-300 shadow-lg hover:shadow-2xl backdrop-blur-sm',
          className
        )}
      >
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-main-light mb-4 sm:mb-6">
          Pozostałe Sektory
        </h3>
        <p className="text-sm sm:text-base text-text-muted-light mb-6 sm:mb-8 md:mb-10 max-w-2xl leading-relaxed font-medium">
          Energetyka, Medycyna, Edukacja, Logistyka i 8 Innych. Sprawdź jak
          nasze modele radzą sobie w Twojej branży, dostosowując się do
          specyficznego żargonu i wymagań prawnych.
        </p>
        <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer bg-white px-5 sm:px-8 py-3 sm:py-4 rounded-full border border-border-light shadow-sm hover:shadow-lg transition-all">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-main-light group-hover:text-primary transition-colors">
            ZOBACZ WSZYSTKIE
          </span>
          <Icon
            name="arrow_forward"
            size="md"
            className="text-text-main-light group-hover:text-primary transition-colors transform group-hover:translate-x-1"
          />
        </div>
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div
        className={cn(
          'relative bg-white rounded-xl overflow-hidden group shadow-lg border border-gray-100 transition-all hover:shadow-2xl flex flex-col md:block',
          className
        )}
      >
        {/* Mobile: Image at top, stacked layout */}
        <div className="md:hidden relative w-full h-48 sm:h-56 overflow-hidden bg-gray-50">
          <img
            alt={title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            src={image}
          />
        </div>
        {/* Mobile: Content below image */}
        <div className="md:hidden p-6 sm:p-8">
          <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2 block">
            {subtitle}
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-text-main-light mb-3 leading-tight">
            {title}
          </h3>
          <p className="text-sm text-text-muted-light leading-relaxed mb-4 font-medium">
            {description}
          </p>
          <div className="flex items-center gap-3 group/btn cursor-pointer">
            <span className="text-xs font-bold uppercase tracking-widest text-text-main-light group-hover/btn:text-primary transition-colors">
              Więcej
            </span>
            <Icon
              name="arrow_forward"
              size="md"
              className="text-text-main-light group-hover/btn:text-primary transition-colors transform group-hover/btn:translate-x-1"
            />
          </div>
        </div>

        {/* Desktop: Original overlay layout */}
        <div className="hidden md:block absolute inset-0 bg-gray-50 overflow-hidden">
          <img
            alt={title}
            className="w-full h-full object-cover object-center scale-110 group-hover:scale-105 transition-transform duration-700 opacity-90"
            src={image}
          />
        </div>
        <div className="hidden md:block relative z-10 bg-white/95 backdrop-blur-md p-8 lg:p-10 w-[60%] lg:w-[50%] h-auto mt-8 ml-10 shadow-xl border border-gray-100 rounded-lg">
          <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3 block">
            {subtitle}
          </span>
          <h3 className="text-3xl lg:text-4xl font-bold text-text-main-light mb-4 leading-tight">
            {title}
          </h3>
          <p className="text-base text-text-muted-light leading-relaxed mb-6 font-medium">
            {description}
          </p>
          <div className="flex items-center gap-3 group/btn cursor-pointer">
            <span className="text-xs font-bold uppercase tracking-widest text-text-main-light group-hover/btn:text-primary transition-colors">
              Więcej
            </span>
            <Icon
              name="arrow_forward"
              size="md"
              className="text-text-main-light group-hover/btn:text-primary transition-colors transform group-hover/btn:translate-x-1"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative bg-white rounded-xl overflow-hidden group shadow-lg border border-gray-100 flex flex-col transition-all hover:shadow-2xl',
        className
      )}
    >
      <div className="h-full relative overflow-hidden bg-gray-50">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
        <img
          alt={title}
          className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-110"
          src={image}
        />
        <div className="absolute bottom-0 left-0 p-6 md:p-8 lg:p-10 z-20 w-full">
          <h3
            className={cn(
              'font-bold text-white uppercase tracking-tight mb-2',
              variant === 'medium'
                ? 'text-2xl md:text-3xl mb-3'
                : 'text-xl md:text-2xl'
            )}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              className={cn(
                'text-gray-300 uppercase tracking-wide opacity-90 font-medium',
                variant === 'medium' ? 'text-sm' : 'text-xs'
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
