/** Module containing UI components for FeatureCards. */
import { useRef } from 'react';
import { useInView } from '@/hooks/useInView';
import { FEATURE_PREVIEWS } from '@/utils/constants';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

export default function FeatureCards() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const delayClasses = [
    'delay-0',
    'delay-[100ms]',
    'delay-[200ms]',
    'delay-[300ms]',
    'delay-[400ms]',
  ];

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-24 sm:py-32 px-6 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
      aria-labelledby="features-heading"
    >
      {/* Background decorations */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-brand-accent/3 blur-3xl" />
        <div className="absolute bottom-20 left-0 w-[500px] h-[500px] rounded-full bg-purple-500/3 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative">
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
            🚀 Five Powerful Features
          </span>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mt-3"
          >
            Everything You Need to <span className="gradient-text">Go Green</span>
          </h2>
          <p className="text-text-secondary mt-4 max-w-xl mx-auto text-lg">
            Each feature is designed to change how you think about your carbon footprint.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURE_PREVIEWS.map((feature, index) => (
            <article
              key={feature.title}
              className={[
                'group relative bg-white rounded-3xl p-8 shadow-[var(--shadow-card)] hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100/80 transform',
                index === 0 ? 'sm:col-span-2 lg:col-span-1' : '',
                prefersReducedMotion
                  ? ''
                  : isInView
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-12 scale-95',
                prefersReducedMotion
                  ? ''
                  : `hover:-translate-y-1.5 transition-transform duration-300`,
                prefersReducedMotion ? '' : delayClasses[index % delayClasses.length],
              ].join(' ')}
            >
              {/* Accent gradient top bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1 transition-all duration-500 group-hover:h-1.5"
                style={{
                  background: `linear-gradient(90deg, ${feature.color}, ${feature.color}88)`,
                }}
                aria-hidden="true"
              />

              {/* Glow effect on hover */}
              <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-10 transition-all duration-700 blur-3xl"
                style={{ background: feature.color }}
                aria-hidden="true"
              />

              <div className="relative">
                {/* Icon with background */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg"
                  style={{
                    background: `${feature.color}12`,
                    boxShadow: `0 0 0 0 ${feature.color}00`,
                  }}
                >
                  <span className="text-3xl" role="img" aria-hidden="true">
                    {feature.icon}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-brand-primary transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-text-secondary leading-relaxed mb-5">{feature.description}</p>

                {/* Hover arrow indicator */}
                <div
                  className="flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                  style={{ color: feature.color }}
                >
                  <span>Explore feature</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="group-hover:translate-x-1 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
