import { useMemo, useCallback } from 'react';
import { FeatureCardShell } from '@/components/dashboard/FeatureGrid';
import Button from '@/components/common/Button';
import { useCarbonStore } from '@/stores/carbonStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { calculateDailySavings, calculateRippleImpact } from '@/services/carbonCalculator';
import { formatCo2Kg, formatNumber, co2ToTrees, co2ToCarKm } from '@/utils/formatters';
import { DEFAULT_COMMUNITY_SIZE, AVERAGE_INDIAN_DAILY_CO2_KG } from '@/utils/constants';

export default function RippleEffectCard() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { getTodayEntries } = useCarbonStore();
  const { incrementShareCount } = useGamificationStore();

  const todayEntries = getTodayEntries();

  const todayCo2 = useMemo(
    () => todayEntries.reduce((sum, entry) => sum + entry.co2Kg, 0),
    [todayEntries]
  );

  const dailySavings = useMemo(
    () => calculateDailySavings(todayCo2),
    [todayCo2]
  );

  const rippleImpact = useMemo(
    () => calculateRippleImpact(dailySavings, DEFAULT_COMMUNITY_SIZE),
    [dailySavings]
  );

  const handleShare = useCallback(async () => {
    const shareText = dailySavings > 0
      ? `🌱 I saved ${formatCo2Kg(dailySavings)} of CO₂ today! If ${formatNumber(DEFAULT_COMMUNITY_SIZE)} people did the same, that's ${formatCo2Kg(rippleImpact)} saved! Track yours at Carbon Node.`
      : `🌍 I'm tracking my carbon footprint with Carbon Node. Today: ${formatCo2Kg(todayCo2)}. Join the movement!`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Carbon Ripple',
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
      }
      incrementShareCount();
    } catch {
      /* User cancelled share — no error needed */
    }
  }, [dailySavings, rippleImpact, todayCo2, incrementShareCount]);

  const hasSavings = dailySavings > 0;

  return (
    <FeatureCardShell
      title="Ripple Effect"
      icon="🌊"
      accentColor="#8e44ad"
    >
      <div className="space-y-4">
        {/* Today's footprint */}
        <div className="text-center">
          <p className="text-xs text-text-muted mb-1">Today's footprint</p>
          <p className="text-2xl font-bold carbon-value text-text-primary">
            {formatCo2Kg(todayCo2)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Average: {formatCo2Kg(AVERAGE_INDIAN_DAILY_CO2_KG)}/day
          </p>
        </div>

        {/* Savings or over */}
        {todayEntries.length > 0 && (
          <div
            className={[
              'p-4 rounded-xl text-center',
              hasSavings ? 'bg-green-50' : 'bg-orange-50',
              prefersReducedMotion ? '' : 'animate-scale-in'
            ].join(' ')}
          >
            {hasSavings ? (
              <>
                <p className="text-sm text-brand-primary font-semibold mb-1">
                  🎉 You saved {formatCo2Kg(dailySavings)} today!
                </p>
                <p className="text-xs text-text-secondary">
                  If {formatNumber(DEFAULT_COMMUNITY_SIZE)} people did this:{' '}
                  <span className="font-bold text-brand-primary">
                    {formatCo2Kg(rippleImpact)} saved
                  </span>
                </p>
                <div className="flex justify-center gap-4 mt-2 text-xs text-text-muted">
                  <span>🌳 {co2ToTrees(rippleImpact)} trees</span>
                  <span>🚗 {formatNumber(co2ToCarKm(rippleImpact))} km</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-status-warning font-semibold">
                You're above the daily average. Small changes help! 💪
              </p>
            )}
          </div>
        )}

        {/* Empty state */}
        {todayEntries.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-text-muted">
              Log your first activity today to see your ripple effect!
            </p>
          </div>
        )}

        {/* Share button */}
        <Button
          onClick={handleShare}
          size="sm"
          variant="outline"
          fullWidth
        >
          📤 Share Your Ripple
        </Button>
      </div>
    </FeatureCardShell>
  );
}
