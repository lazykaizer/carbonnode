/** Module containing UI components for RippleCounter. */
import { useRef, useCallback } from 'react';
import { useInView } from '@/hooks/useInView';
import { formatNumber } from '@/utils/formatters';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { DEFAULT_COMMUNITY_SIZE } from '@/utils/constants';
import {
  INDIA_URBAN_DAILY_KG,
  CO2_PER_TREE_KG_PER_YEAR,
  CAR_PETROL_KG_PER_KM,
} from '@/utils/emissionFactors';

const BASE_DAILY_SAVINGS_KG = INDIA_URBAN_DAILY_KG / 2;
const ANIMATION_DURATION_MS = 2000;
import { useCountAnimation } from '@/hooks/useCountAnimation';

export default function RippleCounter() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const totalSavingsKg = Math.round(DEFAULT_COMMUNITY_SIZE * BASE_DAILY_SAVINGS_KG);

  const animatedValue = useCountAnimation(
    totalSavingsKg,
    isInView,
    prefersReducedMotion ? 0 : ANIMATION_DURATION_MS,
  );

  const getEquivalentTrees = useCallback(() => {
    return Math.round(totalSavingsKg / CO2_PER_TREE_KG_PER_YEAR);
  }, [totalSavingsKg]);

  return (
    <section
      id="impact"
      ref={sectionRef}
      className="py-24 sm:py-32 px-6 relative overflow-hidden"
      aria-labelledby="ripple-heading"
    >
      {/* Dark gradient background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        aria-hidden="true"
      />

      {/* Animated glow orbs */}
      <div className="absolute inset-0" aria-hidden="true">
        <div
          className={[
            'absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-primary/20 blur-3xl',
            prefersReducedMotion ? 'opacity-20' : 'animate-orb-pulse',
          ].join(' ')}
          style={{ animationDuration: '5s' }}
          aria-hidden="true"
        />
        <div
          className={[
            'absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-brand-secondary/15 blur-3xl',
            prefersReducedMotion ? 'opacity-15' : 'animate-orb-pulse',
          ].join(' ')}
          style={{ animationDuration: '7s', animationDelay: '-2s' }}
          aria-hidden="true"
        />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div
          className={[
            'transition-all duration-600 ease-out transform',
            prefersReducedMotion
              ? ''
              : isInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-5',
          ].join(' ')}
        >
          <span
            className={[
              'inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-brand-accent text-sm font-semibold mb-4 backdrop-blur-sm border border-white/10 transition-transform duration-300',
              prefersReducedMotion ? '' : 'hover:scale-105',
            ].join(' ')}
          >
            🌊 The Ripple Effect
          </span>
          <h2
            id="ripple-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-8"
          >
            Small Actions,{' '}
            <span className="bg-gradient-to-r from-brand-accent to-emerald-300 bg-clip-text text-transparent">
              Massive Impact
            </span>
          </h2>
        </div>

        <div
          className={[
            'relative inline-block w-full max-w-2xl transition-all duration-600 delay-200 transform',
            prefersReducedMotion ? '' : isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          ].join(' ')}
        >
          {/* Glow ring */}
          <div
            className={[
              'absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary blur-lg opacity-30',
              prefersReducedMotion ? '' : 'animate-pulse-soft',
            ].join(' ')}
            style={{ animationDuration: '3s' }}
            aria-hidden="true"
          />

          <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-10 sm:p-14 text-white border border-white/10 shadow-2xl">
            <p className="text-lg sm:text-xl mb-6 text-white/70">
              If{' '}
              <span className="font-bold text-white text-2xl">
                {formatNumber(DEFAULT_COMMUNITY_SIZE)} people
              </span>{' '}
              used Carbon Node today
            </p>

            <div className="flex items-baseline justify-center gap-3 mb-4">
              <span
                className="text-5xl sm:text-7xl lg:text-8xl font-black carbon-value bg-gradient-to-r from-brand-accent to-emerald-300 bg-clip-text text-transparent"
                aria-live="polite"
              >
                {formatNumber(prefersReducedMotion ? totalSavingsKg : animatedValue)}
              </span>
              <span className="text-2xl sm:text-3xl font-semibold text-white/60">kg CO₂</span>
            </div>

            <p className="text-xl sm:text-2xl font-semibold text-white/80 mb-8">
              saved in just one day
            </p>

            {/* Impact equivalencies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className={[
                  'flex items-center justify-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/10 transition-all duration-300',
                  prefersReducedMotion ? '' : 'hover:scale-[1.03] hover:bg-white/10',
                ].join(' ')}
              >
                <span className="text-3xl" aria-hidden="true">
                  🌳
                </span>
                <div className="text-left">
                  <p className="text-white font-bold text-lg">
                    {formatNumber(getEquivalentTrees())}
                  </p>
                  <p className="text-white/50 text-sm">trees planted</p>
                </div>
              </div>
              <div
                className={[
                  'flex items-center justify-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/10 transition-all duration-300',
                  prefersReducedMotion ? '' : 'hover:scale-[1.03] hover:bg-white/10',
                ].join(' ')}
              >
                <span className="text-3xl" aria-hidden="true">
                  🚗
                </span>
                <div className="text-left">
                  <p className="text-white font-bold text-lg">
                    {formatNumber(Math.round(totalSavingsKg / CAR_PETROL_KG_PER_KM))}
                  </p>
                  <p className="text-white/50 text-sm">km not driven</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
