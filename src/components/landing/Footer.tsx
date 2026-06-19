import { APP_NAME } from '@/utils/constants';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const prefersReducedMotion = usePrefersReducedMotion();

  const footerLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Impact', href: '#impact' },
    { label: 'GitHub', href: 'https://github.com', external: true },
  ];

  return (
    <footer className="bg-gray-900 relative overflow-hidden">
      {/* Top gradient border */}
      <div className="h-px bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div
              className={[
                'flex items-center gap-2.5 mb-4 transition-transform duration-300',
                prefersReducedMotion ? '' : 'hover:scale-[1.02]'
              ].join(' ')}
            >
              <span
                className={[
                  'text-2xl block origin-center',
                  prefersReducedMotion ? '' : 'animate-logo-sway'
                ].join(' ')}
                aria-hidden="true"
              >
                🌱
              </span>
              <span className="text-xl font-bold text-white">{APP_NAME}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Track, understand, and reduce your carbon footprint with AI-powered insights.
              Built for a greener tomorrow.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigate</h3>
            <nav aria-label="Footer navigation">
              <ul className="space-y-3">
                {footerLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-brand-accent transition-colors duration-300 text-sm inline-flex items-center gap-1 group"
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-brand-accent transition-all duration-300" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Stats */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Did You Know?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5" aria-hidden="true">🇮🇳</span>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Average Indian carbon footprint is <span className="text-white font-semibold">1.7 tons/year</span>.
                  Let's bring it down together.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5" aria-hidden="true">🌡️</span>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Every <span className="text-white font-semibold">0.5°C</span> of warming matters.
                  Your daily choices add up.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} {APP_NAME}. Built with 💚 for the planet.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              All data stored locally on your device
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
