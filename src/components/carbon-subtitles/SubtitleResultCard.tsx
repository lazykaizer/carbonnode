/** Module containing UI components for SubtitleResultCard. */
import Card from '@/components/common/Card';
import { formatCo2Kg } from '@/utils/formatters';
import type { SubtitleResult } from '@/types';

interface SubtitleResultCardProps {
  result: SubtitleResult;
  prefersReducedMotion: boolean;
}

export default function SubtitleResultCard({
  result,
  prefersReducedMotion,
}: SubtitleResultCardProps) {
  const savingsKg = Math.max(0, result.co2Kg - result.alternativeCo2Kg);

  return (
    <div className={['space-y-4', prefersReducedMotion ? '' : 'animate-slide-up'].join(' ')}>
      <Card hoverable={false}>
        <h2 className="text-lg font-bold text-text-primary mb-4">{result.activity}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-orange-50 rounded-xl text-center">
            <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">This Choice</p>
            <p className="text-3xl font-bold carbon-value text-status-warning">
              {formatCo2Kg(result.co2Kg)}
            </p>
            <p className="text-xs text-text-muted mt-1">CO₂ emitted</p>
          </div>

          <div className="p-4 bg-green-50 rounded-xl text-center">
            <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">
              Greener Alternative
            </p>
            <p className="text-3xl font-bold carbon-value text-brand-primary">
              {formatCo2Kg(result.alternativeCo2Kg)}
            </p>
            <p className="text-xs text-text-muted mt-1">CO₂ emitted</p>
          </div>
        </div>

        <div className="p-4 bg-brand-bg rounded-xl">
          <p className="text-sm font-semibold text-brand-primary mb-1">
            💡 Try instead: {result.alternative}
          </p>
          <p className="text-xs text-text-secondary">{result.explanation}</p>
          {savingsKg > 0 && (
            <p className="text-xs font-bold text-brand-primary mt-2">
              Potential savings: {formatCo2Kg(savingsKg)} CO₂
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
