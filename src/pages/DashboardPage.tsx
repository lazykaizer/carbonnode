import { useMemo, useState, useEffect, useRef, lazy, Suspense } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import FeatureGrid from '@/components/dashboard/FeatureGrid';
import CarbonMirrorCard from '@/components/carbon-mirror/CarbonMirrorCard';
import ReceiptScannerCard from '@/components/receipt-scanner/ReceiptScannerCard';
import CarbonBudgetCard from '@/components/carbon-budget/CarbonBudgetCard';
import RippleEffectCard from '@/components/ripple-effect/RippleEffectCard';
import { useShallow } from 'zustand/react/shallow';
import { useCarbonStore } from '@/stores/carbonStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { formatCo2Kg } from '@/utils/formatters';
import { getActionableSuggestion, calculateCategoryTotals } from '@/services/carbonCalculator';
import { AVERAGE_INDIAN_MONTHLY_CO2_KG } from '@/utils/constants';
import type { CarbonCategory } from '@/types';

// Lazy load heavy chart/gamification views to prevent blocking the initial paint of the dashboard shell
const WorldVisual = lazy(() => import('@/components/dashboard/WorldVisual'));
const CarbonTimeline = lazy(() => import('@/components/dashboard/CarbonTimeline'));
const CarbonStory = lazy(() => import('@/components/gamification/CarbonStory'));

export default function DashboardPage() {
  const isMobile = useIsMobile();
  const totalMonthly = useCarbonStore((state) => state.getTotalMonthlyUsage());
  const budgetPercentage = useCarbonStore((state) => state.getBudgetPercentage());
  const monthEntries = useCarbonStore(
    useShallow((state) => state.getMonthEntries())
  );

  const { xp, badges, getCurrentLevel } = useGamificationStore(
    useShallow((state) => ({
      xp: state.xp,
      badges: state.badges,
      getCurrentLevel: state.getCurrentLevel,
    }))
  );

  const [announcement, setAnnouncement] = useState('');
  const prevXpRef = useRef(xp);
  const prevUnlockedBadgesRef = useRef<string[]>([]);

  // Announce XP gains
  useEffect(() => {
    if (xp > prevXpRef.current) {
      const diff = xp - prevXpRef.current;
      setAnnouncement(`Earned ${diff} XP! Current level is ${getCurrentLevel().name}`);
    }
    prevXpRef.current = xp;
  }, [xp, getCurrentLevel]);

  // Announce badge unlocks
  useEffect(() => {
    const unlockedBadges = badges.filter((b) => b.unlocked).map((b) => b.name);
    const newUnlocks = unlockedBadges.filter((name) => !prevUnlockedBadgesRef.current.includes(name));
    if (newUnlocks.length > 0) {
      setAnnouncement(`Congratulations! Unlocked badge: ${newUnlocks.join(', ')}`);
    }
    prevUnlockedBadgesRef.current = unlockedBadges;
  }, [badges]);



  const topCategory = useMemo(() => {
    const totals = calculateCategoryTotals(monthEntries);
    let maxCategory: CarbonCategory = 'other';
    let maxValue = 0;

    for (const [category, value] of Object.entries(totals)) {
      if (value > maxValue) {
        maxValue = value;
        maxCategory = category as CarbonCategory;
      }
    }

    return maxCategory;
  }, [monthEntries]);

  const suggestion = useMemo(
    // eslint-disable-next-line react-hooks/purity
    () => getActionableSuggestion(topCategory, budgetPercentage, Date.now() % 100),
    [topCategory, budgetPercentage]
  );

  return (
    <div className="min-h-screen bg-brand-bg">
      <Sidebar />

      {/* Accessibility announcer */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <main
        id="main-content"
        className={[
          'transition-all duration-300',
          isMobile ? 'pb-20 px-4 pt-4' : 'ml-64 p-6',
        ].join(' ')}
      >
        {/* Top Header */}
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">
            Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
            <span>
              This month:{' '}
              <span className="font-bold carbon-value text-text-primary">
                {formatCo2Kg(totalMonthly)}
              </span>
            </span>
            <span className="text-text-muted">•</span>
            <span>
              India avg: ~{AVERAGE_INDIAN_MONTHLY_CO2_KG} kg/mo
            </span>
          </div>
        </header>

        {/* World Visual */}
        <section className="mb-6" aria-label="Your carbon world">
          <Suspense fallback={
            <div className="w-full h-[320px] bg-white rounded-2xl animate-pulse flex items-center justify-center text-text-muted">
              Loading interactive world...
            </div>
          }>
            <WorldVisual />
          </Suspense>
        </section>

        {/* Actionable Suggestion */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border-l-4 border-brand-secondary">
          <p className="text-sm text-text-primary">{suggestion}</p>
        </div>

        {/* Feature Cards — 2×2 Grid */}
        <section aria-label="Carbon tracking features">
          <FeatureGrid>
            <CarbonMirrorCard />
            <ReceiptScannerCard />
            <CarbonBudgetCard />
            <RippleEffectCard />
          </FeatureGrid>
        </section>

        {/* Gamification & Timeline Widgets */}
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Timeline and AI Carbon Story">
          <Suspense fallback={
            <div className="w-full h-[360px] bg-white rounded-2xl animate-pulse flex items-center justify-center text-text-muted">
              Loading carbon timeline...
            </div>
          }>
            <CarbonTimeline />
          </Suspense>
          <Suspense fallback={
            <div className="w-full h-[360px] bg-white rounded-2xl animate-pulse flex items-center justify-center text-text-muted">
              Loading AI carbon story...
            </div>
          }>
            <CarbonStory />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
