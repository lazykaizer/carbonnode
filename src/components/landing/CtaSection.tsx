import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from '@/hooks/useInView';
import Button from '@/components/common/Button';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

export default function CtaSection() {
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });

  return (
    <section ref={containerRef} className="py-24 sm:py-32 px-6 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 hero-gradient" aria-hidden="true" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={[
              'absolute w-2 h-2 rounded-full bg-white/20',
              prefersReducedMotion ? '' : 'animate-float'
            ].join(' ')}
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDuration: `${4 + i}s`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <div
          className={[
            'transition-all duration-700 ease-out transform',
            prefersReducedMotion ? '' : (isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')
          ].join(' ')}
        >
          <span
            className={[
              'text-6xl sm:text-7xl block mb-6 origin-center',
              prefersReducedMotion ? '' : 'animate-logo-sway'
            ].join(' ')}
          >
            🌍
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to know your
            <br />
            <span className="bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
              carbon score?
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
            It takes 30 seconds. No sign-up required.
            Just tell the AI about your day and see the impact.
          </p>

          <div
            className={[
              'flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 transform',
              prefersReducedMotion
                ? ''
                : isInView
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4',
              prefersReducedMotion ? '' : 'delay-[300ms]'
            ].join(' ')}
          >
            <Button
              onClick={() => navigate('/dashboard')}
              size="lg"
              variant="ghost"
              className="!bg-white !text-brand-primary hover:!bg-gray-50 font-bold shadow-2xl shadow-black/20 text-lg px-10 py-5 !rounded-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="flex items-center gap-2">
                Get Started — It's Free
                <span className="inline-block transition-transform duration-300 hover:translate-x-1">→</span>
              </span>
            </Button>

            <p className="text-white/50 text-sm">
              No credit card • No sign-up • 100% private
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
