/** Module containing UI components for BudgetBar. */
import { memo } from 'react';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { formatCo2Kg, getBudgetColor } from '@/utils/formatters';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/utils/constants';
import type { CarbonCategory } from '@/types';

interface BudgetBarProps {
  category: CarbonCategory;
  usedKg: number;
  limitKg: number;
}

export const BudgetBar = memo(function BudgetBar({ category, usedKg, limitKg }: BudgetBarProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const percentage = limitKg > 0 ? Math.min((usedKg / limitKg) * 100, 100) : 0;
  const barColor = getBudgetColor(percentage);
  const isOver = usedKg > limitKg;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm" aria-hidden="true">
            {CATEGORY_ICONS[category]}
          </span>
          <span className="text-sm font-medium text-text-primary">{CATEGORY_LABELS[category]}</span>
        </div>
        <span
          className={[
            'text-xs font-bold carbon-value',
            isOver ? 'text-status-danger' : 'text-text-secondary',
          ].join(' ')}
        >
          {formatCo2Kg(usedKg)} / {formatCo2Kg(limitKg)}
        </span>
      </div>

      <div
        className="h-2.5 bg-gray-100 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${CATEGORY_LABELS[category]} budget: ${Math.round(percentage)}% used`}
      >
        <div
          className={[
            'h-full rounded-full',
            prefersReducedMotion ? '' : 'transition-[width] duration-700 ease-out',
          ].join(' ')}
          style={{
            backgroundColor: barColor,
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
});
