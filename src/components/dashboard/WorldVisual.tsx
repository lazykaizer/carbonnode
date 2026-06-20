import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useWorldVisual } from './useWorldVisual';

function TreeSprite({ index, total }: { index: number; total: number }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const leftPosition = 10 + (index / Math.max(total - 1, 1)) * 80;
  const size = 28 + (index % 3) * 8;

  return (
    <div
      className={[
        'absolute bottom-0 transform origin-bottom',
        prefersReducedMotion ? 'opacity-100 scale-100' : 'animate-tree-pop',
      ].join(' ')}
      style={{
        left: `${leftPosition}%`,
        animationDelay: prefersReducedMotion ? '0s' : `${index * 100}ms`,
      }}
    >
      <span
        className={['block origin-bottom', prefersReducedMotion ? '' : 'animate-tree-sway'].join(
          ' ',
        )}
        style={{
          fontSize: `${size}px`,
          animationDuration: `${3 + index * 0.5}s`,
        }}
        role="img"
        aria-hidden="true"
      >
        🌳
      </span>
    </div>
  );
}

function SmogParticle({ index }: { index: number }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div
      className="absolute rounded-full bg-gray-400/20"
      style={{
        width: `${20 + index * 15}px`,
        height: `${12 + index * 8}px`,
        top: `${15 + index * 20}%`,
        filter: 'blur(8px)',
        animationName: 'smog-drift',
        animationDuration: `${8 + index * 2}s`,
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        animationDelay: `${index * 1.5}s`,
      }}
      aria-hidden="true"
    />
  );
}

function SunElement({ opacity }: { opacity: number }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div
      className={[
        'absolute top-4 right-8 transition-all duration-[1500ms] ease-in-out',
        prefersReducedMotion ? '' : 'animate-sun-pulse',
      ].join(' ')}
      style={{ opacity }}
      aria-hidden="true"
    >
      <div
        className="w-14 h-14 rounded-full bg-yellow-300 transition-all duration-[1500ms]"
        style={{
          boxShadow: `0 0 ${20 * opacity}px ${10 * opacity}px rgba(253, 224, 71, ${0.4 * opacity})`,
        }}
      />
    </div>
  );
}

function GrassGround() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-16" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-t from-green-600/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-green-700/40 to-green-600/20 rounded-t-3xl" />
    </div>
  );
}

export default function WorldVisual() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { worldState, config, treeArray, smogArray, stateLabels, ariaLabels } = useWorldVisual();

  return (
    <div
      className="relative w-full h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden"
      role="img"
      aria-label={ariaLabels[worldState]}
    >
      <span className="sr-only">{ariaLabels[worldState]}</span>

      {/* Cross-faded sky gradients */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-sky-pristine-from to-sky-pristine-to transition-opacity duration-[1500ms] ease-in-out"
        style={{ opacity: worldState === 'pristine' ? 1 : 0 }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-sky-good-from to-sky-good-to transition-opacity duration-[1500ms] ease-in-out"
        style={{ opacity: worldState === 'good' ? 1 : 0 }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-sky-warning-from to-sky-warning-to transition-opacity duration-[1500ms] ease-in-out"
        style={{ opacity: worldState === 'warning' ? 1 : 0 }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-sky-danger-from to-sky-danger-to transition-opacity duration-[1500ms] ease-in-out"
        style={{ opacity: worldState === 'danger' ? 1 : 0 }}
      />

      {/* Sun */}
      <SunElement opacity={config.sunOpacity} />

      {/* Clouds */}
      {!config.showSmog && (
        <>
          <div
            className={[
              'absolute top-6 left-1/4 w-16 h-6 bg-white/40 rounded-full blur-sm',
              prefersReducedMotion ? '' : 'animate-cloud-drift-1',
            ].join(' ')}
            aria-hidden="true"
          />
          <div
            className={[
              'absolute top-12 right-1/3 w-20 h-7 bg-white/30 rounded-full blur-sm',
              prefersReducedMotion ? '' : 'animate-cloud-drift-2',
            ].join(' ')}
            aria-hidden="true"
          />
        </>
      )}

      {/* Smog particles */}
      {smogArray.map((index) => (
        <SmogParticle key={`smog-${index}`} index={index} />
      ))}

      {/* Trees */}
      {treeArray.map((index) => (
        <TreeSprite key={`tree-${index}`} index={index} total={config.treeCount} />
      ))}

      {/* Ground */}
      <GrassGround />

      {/* Status label */}
      <div className="absolute bottom-2 left-4 right-4">
        <p className="text-xs font-medium text-white/80 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1.5 inline-block">
          {stateLabels[worldState]}
        </p>
      </div>
    </div>
  );
}
