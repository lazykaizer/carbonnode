/** Module containing UI components for EmptyState. */
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <span className="text-5xl mb-4" role="img" aria-hidden="true">
        {icon}
      </span>

      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>

      <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>

      {action && <div>{action}</div>}
    </div>
  );
}
