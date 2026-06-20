import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AchievementsModal from '@/components/gamification/AchievementsModal';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useCarbonStore } from '@/stores/carbonStore';
import { usePrefersReducedMotion, useIsMobile } from '@/hooks/useMediaQuery';
import { APP_NAME } from '@/utils/constants';
import { formatXp } from '@/utils/formatters';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  id: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: '🏠', path: '/dashboard', id: 'nav-dashboard' },
  { label: 'Carbon Subtitles', icon: '📺', path: '/carbon-subtitles', id: 'nav-subtitles' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

  const { xp, streak, getCurrentLevel, getXpProgress } = useGamificationStore();
  const { getBudgetPercentage } = useCarbonStore();

  const currentLevel = getCurrentLevel();
  const xpProgress = getXpProgress();
  const budgetPercent = getBudgetPercentage();

  if (isMobile) {
    return (
      <>
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg"
          aria-label="Mobile navigation"
        >
          <div className="flex items-center justify-around px-2 py-2">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  id={item.id}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors touch-target cursor-pointer ${isActive ? 'text-brand-primary bg-brand-bg' : 'text-text-muted hover:text-text-primary'}`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                >
                  <span className="text-xl" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => setIsAchievementsOpen(true)}
              className="flex flex-col items-center gap-1 px-4 py-2 cursor-pointer touch-target"
              aria-label="View achievements and badges"
            >
              <span className="text-xl" aria-hidden="true">
                {currentLevel.emoji}
              </span>
              <span className="text-xs font-medium text-text-muted">{formatXp(xp)}</span>
            </button>
          </div>
        </nav>
        <AchievementsModal
          isOpen={isAchievementsOpen}
          onClose={() => setIsAchievementsOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <aside
        className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 flex flex-col z-30 shadow-sm"
        aria-label="Sidebar navigation"
      >
        <div className="px-6 py-5 border-b border-gray-100">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer"
            aria-label="Go to home page"
          >
            <span className="text-2xl" aria-hidden="true">
              🌱
            </span>
            <span className="text-xl font-bold gradient-text">{APP_NAME}</span>
          </button>
        </div>

        <nav className="flex-1 px-4 py-6" aria-label="Main navigation">
          <ul className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <button
                    id={item.id}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left touch-target cursor-pointer ${isActive ? 'bg-brand-bg text-brand-primary font-semibold' : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="text-xl" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 pb-6 space-y-4">
          <button
            onClick={() => setIsAchievementsOpen(true)}
            className="w-full text-left bg-brand-bg rounded-xl p-4 cursor-pointer hover:bg-brand-bg/85 border border-transparent hover:border-brand-primary/10 transition-all duration-200"
            aria-label="View achievements and badges"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl" aria-hidden="true">
                {currentLevel.emoji}
              </span>
              <div>
                <p className="text-sm font-bold text-text-primary">{currentLevel.name}</p>
                <p className="text-xs text-text-muted">{formatXp(xp)}</p>
              </div>
            </div>
            <div
              className="h-2 bg-gray-200 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(xpProgress.percentage)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`XP progress: ${Math.round(xpProgress.percentage)}%`}
            >
              <div
                className={[
                  'h-full gradient-bg rounded-full',
                  prefersReducedMotion ? '' : 'transition-[width] duration-700 ease-out',
                ].join(' ')}
                style={{ width: `${xpProgress.percentage}%` }}
              />
            </div>
          </button>

          <div className="flex items-center justify-between px-4 py-3 bg-orange-50 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">
                🔥
              </span>
              <span className="text-sm font-semibold text-text-primary">Streak</span>
            </div>
            <span className="text-lg font-bold text-orange-600 carbon-value">
              {streak} {streak === 1 ? 'day' : 'days'}
            </span>
          </div>

          <div className="flex items-center justify-between px-4 py-3 bg-brand-bg rounded-xl">
            <span className="text-sm font-semibold text-text-primary">Budget Used</span>
            <span
              className={`text-lg font-bold carbon-value ${budgetPercent > 85 ? 'text-status-danger' : budgetPercent > 60 ? 'text-status-warning' : 'text-brand-primary'}`}
            >
              {Math.round(budgetPercent)}%
            </span>
          </div>
        </div>
      </aside>
      <AchievementsModal isOpen={isAchievementsOpen} onClose={() => setIsAchievementsOpen(false)} />
    </>
  );
}
