import { useRef } from 'react';
import { useInView } from '@/hooks/useInView';
import { HOW_IT_WORKS_STEPS } from '@/utils/constants';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

export default function HowItWorks() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const stepColors = [
    {
      bg: 'from-blue-500/10 to-cyan-500/10',
      border: 'border-blue-200/50',
      icon: 'from-blue-500 to-cyan-500',
      number: 'bg-blue-500',
    },
    {
      bg: 'from-purple-500/10 to-pink-500/10',
      border: 'border-purple-200/50',
      icon: 'from-purple-500 to-pink-500',
      number: 'bg-purple-500',
    },
    {
      bg: 'from-emerald-500/10 to-teal-500/10',
      border: 'border-emerald-200/50',
      icon: 'from-emerald-500 to-teal-500',
      number: 'bg-emerald-500',
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-24 sm:py-32 px-6 bg-white relative overflow-hidden"
      aria-labelledby="how-it-works-heading"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-brand-accent/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <div
          className={[
            'text-center mb-20 transition-all duration-700 ease-out transform',
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
            ✨ Simple as 1-2-3
          </span>
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mt-3"
          >
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-text-secondary mt-4 max-w-xl mx-auto text-lg">
            No complex setup. No spreadsheets. Just tell us about your day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div
              key={step.title}
              className={[
                'relative text-center group transition-all duration-700 transform',
                prefersReducedMotion
                  ? ''
                  : isInView
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-10 scale-95',
                index === 1 ? 'delay-[150ms]' : index === 2 ? 'delay-[300ms]' : '',
              ].join(' ')}
            >
              {/* Connector line (desktop only) */}
              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <div
                  className="hidden md:block absolute top-16 left-[60%] w-[80%] z-0"
                  aria-hidden="true"
                >
                  <div className="h-[2px] w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 relative">
                    <div
                      className={[
                        'absolute inset-y-0 left-0 bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-[1000ms] ease-out',
                        prefersReducedMotion ? 'w-full' : isInView ? 'w-full' : 'w-0',
                      ].join(' ')}
                      style={{
                        transitionDelay: prefersReducedMotion ? '0ms' : `${500 + index * 300}ms`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Card */}
              <div
                className={[
                  `relative bg-gradient-to-br ${stepColors[index].bg} border ${stepColors[index].border} rounded-3xl p-8 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-brand-primary/5 transform`,
                  prefersReducedMotion
                    ? ''
                    : 'hover:-translate-y-2 transition-transform duration-300',
                ].join(' ')}
              >
                {/* Step icon */}
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-lg mb-6">
                  <span
                    className={[
                      'text-4xl block',
                      prefersReducedMotion ? '' : 'animate-sun-pulse',
                    ].join(' ')}
                    role="img"
                    aria-hidden="true"
                    style={{ animationDuration: '3s' }}
                  >
                    {step.icon}
                  </span>
                  <span
                    className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${stepColors[index].number} text-white text-sm font-bold flex items-center justify-center shadow-lg`}
                  >
                    {index + 1}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-text-primary mb-3">{step.title}</h3>

                <p className="text-text-secondary leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
