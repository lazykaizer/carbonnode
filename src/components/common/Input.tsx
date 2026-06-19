import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, id, className = '', ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>

        <div className="relative">
          {icon && (
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            >
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full rounded-xl border-2 bg-white px-4 py-3',
              'text-text-primary placeholder:text-text-muted',
              'transition-colors duration-200',
              'focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/20',
              icon ? 'pl-10' : '',
              error
                ? 'border-status-danger focus:border-status-danger focus:ring-status-danger/20'
                : 'border-gray-200',
              className,
            ].join(' ')}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              [error ? errorId : '', hint ? hintId : '']
                .filter(Boolean)
                .join(' ') || undefined
            }
            {...props}
          />
        </div>

        {error && (
          <p id={errorId} className="text-sm text-status-danger" role="alert">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={hintId} className="text-sm text-text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
