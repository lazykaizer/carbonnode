/** Module containing UI components for Card. */
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  ariaLabel?: string;
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({
  children,
  className = '',
  hoverable = true,
  padding = 'md',
  onClick,
  ariaLabel,
}: CardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const baseClasses = [
    'rounded-2xl bg-brand-surface',
    'shadow-[var(--shadow-card)]',
    'transition-all duration-250 ease-in-out',
    paddingClasses[padding],
    hoverable ? 'hover:shadow-[var(--shadow-card-hover)]' : '',
    hoverable && !prefersReducedMotion ? 'hover:-translate-y-0.5 transition-transform' : '',
    onClick ? 'cursor-pointer' : '',
    className,
  ].join(' ');

  return (
    <div
      className={baseClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
}
