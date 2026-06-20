interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const sizeClasses = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
};

export default function Loader({ size = 'md', message }: LoaderProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-8"
      role="status"
      aria-label={message || 'Loading'}
    >
      <div
        className={[
          'animate-spin rounded-full',
          'border-brand-primary/30 border-t-brand-primary',
          sizeClasses[size],
        ].join(' ')}
        aria-hidden="true"
      />

      {message && <p className="text-sm text-text-secondary animate-pulse-soft">{message}</p>}

      <span className="sr-only">{message || 'Loading content'}</span>
    </div>
  );
}
