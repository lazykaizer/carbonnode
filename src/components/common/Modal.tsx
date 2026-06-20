import type { ReactNode } from 'react';
import { useEffect, useCallback } from 'react';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  return (
    <div
      className={[
        'fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300',
        isOpen
          ? 'opacity-100 visible pointer-events-auto'
          : 'opacity-0 invisible pointer-events-none',
      ].join(' ')}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog container */}
      <div
        className={[
          'relative w-full rounded-2xl bg-brand-surface p-6 shadow-xl transition-all duration-300 transform',
          prefersReducedMotion ? '' : isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4',
          sizeClasses[size],
        ].join(' ')}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-bold text-text-primary">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="touch-target rounded-full p-2 text-text-muted hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              ></path>
            </svg>
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
