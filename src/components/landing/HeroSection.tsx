import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useParticles } from '@/hooks/useParticles';
import { useTypewriter } from '@/hooks/useTypewriter';
import StatItem from './StatItem';

export default function HeroSection() {
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticles(canvasRef, !prefersReducedMotion);

  const typewriterText = useTypewriter(
    ['carbon footprint', 'daily choices', 'planet impact', 'eco journey'],
    90, 50, 2200
  );

  const handleCtaClick = useCallback(() => navigate('/dashboard'), [navigate]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" aria-label="Hero section">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 hero-gradient opacity-80" />
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 z-[1]" aria-hidden="true" />
      
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden z-[2]" aria-hidden="true">
        <div
          className={[
            'absolute top-[15%] left-[10%] w-72 h-72 rounded-full hero-orb-1',
            prefersReducedMotion ? 'opacity-80' : 'animate-orb-drift-1'
          ].join(' ')}
        />
        <div
          className={[
            'absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full hero-orb-2',
            prefersReducedMotion ? 'opacity-80' : 'animate-orb-drift-2'
          ].join(' ')}
        />
        <div
          className={[
            'absolute top-[50%] left-[50%] w-56 h-56 rounded-full hero-orb-3',
            prefersReducedMotion ? 'opacity-80' : 'animate-orb-drift-3'
          ].join(' ')}
        />
      </div>

      <div className="relative z-10 px-6 text-center max-w-5xl mx-auto pt-20">
        <div
          className={[
            'transition-all duration-700 ease-out transform',
            prefersReducedMotion ? '' : 'animate-slide-up'
          ].join(' ')}
          style={{ animationDelay: '200ms', animationDuration: '800ms' }}
        >
          <span className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-full bg-white/15 text-white/95 text-sm font-medium backdrop-blur-md border border-white/20 shadow-lg shadow-black/10">
            <span
              className={[
                'inline-block origin-center',
                prefersReducedMotion ? '' : 'animate-logo-sway'
              ].join(' ')}
            >
              🌱
            </span>
            AI-Powered Carbon Tracking
          </span>
        </div>

        <h1
          className={[
            'text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.1] mb-4',
            prefersReducedMotion ? '' : 'animate-slide-up fill-both'
          ].join(' ')}
          style={{ animationDelay: '400ms', animationDuration: '800ms' }}
        >
          Know your
        </h1>

        <div
          className={[
            'text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.1] mb-8',
            prefersReducedMotion ? '' : 'animate-slide-up fill-both'
          ].join(' ')}
          style={{ animationDelay: '500ms', animationDuration: '800ms' }}
        >
          <span className="hero-typewriter-text">{typewriterText}</span>
          <span
            className={[
              'inline-block w-1 h-[0.9em] bg-white/80 ml-1 align-middle rounded-full',
              prefersReducedMotion ? '' : 'animate-pulse'
            ].join(' ')}
            style={{ animationDuration: '800ms' }}
          />
        </div>

        <p
          className={[
            'text-lg sm:text-xl md:text-2xl text-white/75 mb-12 max-w-2xl mx-auto leading-relaxed font-light',
            prefersReducedMotion ? '' : 'animate-slide-up fill-both'
          ].join(' ')}
          style={{ animationDelay: '700ms', animationDuration: '800ms' }}
        >
          Track your daily carbon footprint with AI. See the hidden cost of every choice.
          Make the planet greener, one decision at a time.
        </p>

        <div
          className={[
            'flex flex-col sm:flex-row gap-4 justify-center items-center mb-16',
            prefersReducedMotion ? '' : 'animate-slide-up fill-both'
          ].join(' ')}
          style={{ animationDelay: '900ms', animationDuration: '800ms' }}
        >
          <Button
            onClick={handleCtaClick}
            size="lg"
            variant="ghost"
            className="!bg-white !text-brand-primary hover:!bg-gray-50 font-bold shadow-2xl shadow-black/20 text-lg px-10 py-5 !rounded-2xl group transition-transform hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Start your carbon journey — go to dashboard"
          >
            <span className="flex items-center gap-2">
              Start Your Journey
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </Button>

          <a
            href="#how-it-works"
            className="group flex items-center gap-2 text-white/80 hover:text-white font-medium transition-all duration-300 px-6 py-3 rounded-2xl hover:bg-white/10 backdrop-blur-sm"
          >
            <span>See how it works</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-y-0.5 transition-transform">
              <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div
          className={[
            'flex flex-wrap justify-center gap-8 sm:gap-16 pb-8',
            prefersReducedMotion ? '' : 'animate-fade-in fill-both'
          ].join(' ')}
          style={{ animationDelay: '1100ms', animationDuration: '1000ms' }}
        >
          <StatItem value="10K+" label="Active Users" />
          <div className="w-px h-12 bg-white/20 hidden sm:block" />
          <StatItem value="2.4" label="Avg. Daily kg CO₂ Saved" suffix=" kg" />
          <div className="w-px h-12 bg-white/20 hidden sm:block" />
          <StatItem value="5" label="AI-Powered Features" />
        </div>
      </div>

      <div
        className={[
          'absolute bottom-8 left-1/2 -translate-x-1/2 z-10',
          prefersReducedMotion ? '' : 'animate-bounce'
        ].join(' ')}
        aria-hidden="true"
        style={{ animationDuration: '2s' }}
      >
        <div className="w-7 h-11 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
          <div
            className={[
              'w-1.5 h-3 bg-white/60 rounded-full',
              prefersReducedMotion ? '' : 'animate-pulse'
            ].join(' ')}
          />
        </div>
      </div>
    </section>
  );
}
