import { forwardRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-primary text-white hover:bg-brand-secondary active:bg-brand-primary',
  secondary:
    'bg-brand-secondary text-white hover:bg-brand-accent active:bg-brand-secondary',
  outline:
    'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white',
  ghost:
    'text-brand-primary hover:bg-brand-bg active:bg-brand-bg',
  danger:
    'bg-status-danger text-white hover:bg-red-700 active:bg-status-danger',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    const baseClasses = [
      'inline-flex items-center justify-center',
      'rounded-full font-semibold',
      'transition-all duration-250 ease-in-out',
      'focus-visible:outline-3 focus-visible:outline-brand-secondary focus-visible:outline-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'touch-target cursor-pointer',
      prefersReducedMotion ? '' : 'hover:scale-[1.02] active:scale-[0.98] transition-transform',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      className,
    ].join(' ');

    return (
      <button
        ref={ref}
        className={baseClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span
              className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
            <span>Processing...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
