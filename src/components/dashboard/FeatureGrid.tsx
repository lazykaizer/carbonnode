/** Module containing UI components for FeatureGrid. */
import { type ReactNode } from 'react';
import Card from '@/components/common/Card';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

interface FeatureGridProps {
  children: ReactNode;
}

export default function FeatureGrid({ children }: FeatureGridProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div
      className={[
        'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6',
        prefersReducedMotion ? '' : 'animate-fade-in fill-both',
      ].join(' ')}
      style={{ animationDelay: '200ms', animationDuration: '500ms' }}
    >
      {children}
    </div>
  );
}

/* ─── Feature Card Wrapper ────────────────────────────────── */

interface FeatureCardShellProps {
  title: string;
  icon: string;
  accentColor: string;
  children: ReactNode;
  headerAction?: ReactNode;
}

export function FeatureCardShell({
  title,
  icon,
  accentColor,
  children,
  headerAction,
}: FeatureCardShellProps) {
  return (
    <Card className="flex flex-col" hoverable={false}>
      {/* Accent top line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: accentColor }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            {icon}
          </span>
          <h3 className="text-lg font-bold text-text-primary">{title}</h3>
        </div>
        {headerAction}
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>
    </Card>
  );
}
