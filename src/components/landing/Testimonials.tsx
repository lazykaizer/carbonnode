/** Module containing UI components for Testimonials. */
import { useRef } from 'react';
import { useInView } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

const TESTIMONIALS = [
  {
    name: 'Aarav Sharma',
    role: 'College Student, Delhi',
    avatar: '👨‍🎓',
    text: 'I had no idea my daily metro commute was already saving so much CO₂! Carbon Node made me rethink ordering food delivery every day.',
    rating: 5,
  },
  {
    name: 'Priya Menon',
    role: 'Software Engineer, Bangalore',
    avatar: '👩‍💻',
    text: 'The receipt scanner is genius. I scanned my Swiggy order and it showed me the carbon cost. Now I cook at home twice a week more.',
    rating: 5,
  },
  {
    name: 'Rohan Patel',
    role: 'Startup Founder, Mumbai',
    avatar: '👨‍💼',
    text: 'We use Carbon Node in our office to track team carbon budgets. The ripple effect feature motivates everyone to participate.',
    rating: 5,
  },
];

export default function Testimonials() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' });

  return (
    <section
      ref={sectionRef}
      className="py-24 sm:py-32 px-6 bg-white relative overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <div
          className={[
            'text-center mb-16 transition-all duration-700 ease-out transform',
            prefersReducedMotion
              ? ''
              : isInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8',
          ].join(' ')}
        >
          <span
            className={[
              'inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-bg text-brand-primary text-sm font-semibold mb-4 transition-transform duration-300',
              prefersReducedMotion ? '' : 'hover:scale-105',
            ].join(' ')}
          >
            💬 What People Say
          </span>
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mt-3"
          >
            Loved by <span className="gradient-text">Eco Warriors</span>
          </h2>
          <p className="text-text-secondary mt-4 max-w-xl mx-auto text-lg">
            Join thousands who are already tracking and reducing their carbon footprint.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={t.name}
              className={[
                'group relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-500 transform',
                prefersReducedMotion
                  ? ''
                  : isInView
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10',
                prefersReducedMotion
                  ? ''
                  : 'hover:-translate-y-1.5 transition-transform duration-300',
                idx === 1 ? 'delay-[150ms]' : idx === 2 ? 'delay-[300ms]' : '',
              ].join(' ')}
            >
              {/* Quote mark */}
              <div
                className="absolute top-6 right-6 text-5xl text-brand-accent/15 font-serif leading-none"
                aria-hidden="true"
              >
                "
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span
                    key={i}
                    className={[
                      'text-yellow-400 text-sm transition-all duration-300 transform',
                      prefersReducedMotion
                        ? ''
                        : isInView
                          ? 'scale-100 opacity-100'
                          : 'scale-0 opacity-0',
                    ].join(' ')}
                    style={{
                      transitionDelay: prefersReducedMotion
                        ? '0ms'
                        : `${idx * 150 + i * 50 + 300}ms`,
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <p className="text-text-secondary leading-relaxed mb-6 relative z-10">"{t.text}"</p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center text-2xl shadow-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-text-primary text-sm">{t.name}</p>
                  <p className="text-text-muted text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
