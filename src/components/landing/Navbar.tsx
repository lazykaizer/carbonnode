import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_NAME } from '@/utils/constants';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

export default function Navbar() {
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Impact', href: '#impact' },
  ];

  return (
    <nav
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        prefersReducedMotion ? '' : 'animate-slide-down',
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/20'
          : 'bg-transparent',
      ].join(' ')}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          className={[
            'flex items-center gap-2.5 group transition-transform duration-300',
            prefersReducedMotion ? '' : 'hover:scale-[1.02]'
          ].join(' ')}
        >
          <span
            className={[
              'text-2xl block origin-center',
              prefersReducedMotion ? '' : 'animate-logo-sway'
            ].join(' ')}
          >
            🌱
          </span>
          <span
            className={[
              'text-xl font-bold transition-colors duration-300',
              scrolled ? 'text-text-primary' : 'text-white',
            ].join(' ')}
          >
            {APP_NAME}
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={[
                'text-sm font-medium transition-all duration-300 relative group',
                scrolled
                  ? 'text-text-secondary hover:text-brand-primary'
                  : 'text-white/80 hover:text-white',
              ].join(' ')}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-accent rounded-full transition-all duration-300 group-hover:w-full" />
            </a>
          ))}

          <button
            onClick={() => navigate('/dashboard')}
            className={[
              'px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer transform',
              prefersReducedMotion ? '' : 'hover:scale-105 active:scale-95 transition-transform duration-250',
              scrolled
                ? 'bg-brand-primary text-white hover:bg-brand-secondary shadow-md shadow-brand-primary/20'
                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30',
            ].join(' ')}
          >
            Open Dashboard
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((i) => {
            const lineClasses = [
              'block w-6 h-0.5 rounded-full transition-all duration-300',
              scrolled ? 'bg-text-primary' : 'bg-white',
            ];
            
            if (mobileMenuOpen) {
              if (i === 0) lineClasses.push('rotate-45 translate-y-[8px]');
              if (i === 1) lineClasses.push('opacity-0');
              if (i === 2) lineClasses.push('-rotate-45 -translate-y-[8px]');
            }

            return (
              <span
                key={i}
                className={lineClasses.join(' ')}
              />
            );
          })}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={[
          'md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl overflow-hidden transition-all duration-300',
          mobileMenuOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        ].join(' ')}
      >
        <div className="px-6 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-text-primary font-medium py-2 hover:text-brand-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/dashboard');
            }}
            className="mt-2 px-5 py-3 bg-brand-primary text-white rounded-full font-semibold text-center hover:bg-brand-secondary transition-colors cursor-pointer"
          >
            Open Dashboard
          </button>
        </div>
      </div>
    </nav>
  );
}
