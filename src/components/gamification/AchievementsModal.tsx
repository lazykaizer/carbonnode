/** Module containing UI components for AchievementsModal. */
import Modal from '@/components/common/Modal';
import { useGamificationStore } from '@/stores/gamificationStore';
import { formatXp, formatDate } from '@/utils/formatters';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  const { xp, streak, getCurrentLevel, badges } = useGamificationStore();
  const currentLevel = getCurrentLevel();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Achievements & Badges">
      <div className="space-y-6">
        {/* Level Info */}
        <div className="flex items-center gap-4 p-4 bg-brand-bg rounded-2xl border border-brand-primary/10">
          <span className="text-5xl" aria-hidden="true">
            {currentLevel.emoji}
          </span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-primary">{currentLevel.name}</h3>
            <p className="text-xs text-text-secondary">
              You have accumulated{' '}
              <span className="font-bold text-brand-primary">{formatXp(xp)}</span>. Keep tracking to
              level up and protect the planet!
            </p>
            {currentLevel.maxXp !== Infinity ? (
              <p className="text-xs text-text-muted mt-1">
                Next level at {currentLevel.maxXp + 1} XP (need {currentLevel.maxXp + 1 - xp} XP)
              </p>
            ) : (
              <p className="text-xs text-brand-primary font-semibold mt-1">
                🎉 Maximum level reached! You are a Carbon Legend!
              </p>
            )}
          </div>
        </div>

        {/* Streak details */}
        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              🔥
            </span>
            <div>
              <h4 className="text-sm font-bold text-text-primary">Daily Streak</h4>
              <p className="text-xs text-text-muted">Log activities daily to build your streak!</p>
            </div>
          </div>
          <span className="text-xl font-extrabold text-orange-600 carbon-value">
            {streak} {streak === 1 ? 'Day' : 'Days'}
          </span>
        </div>

        {/* Badges List */}
        <div>
          <h4 className="text-sm font-bold text-text-secondary mb-3">Your Earned Badges</h4>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={[
                  'p-3.5 rounded-xl border-2 flex flex-col items-center text-center transition-all',
                  badge.unlocked
                    ? 'border-brand-primary bg-green-50/20'
                    : 'border-gray-100 bg-gray-50/50 opacity-60',
                ].join(' ')}
              >
                <span
                  className={[
                    'text-3xl mb-1.5',
                    !badge.unlocked && 'filter grayscale contrast-75',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {badge.emoji}
                </span>
                <span className="text-xs font-bold text-text-primary">{badge.name}</span>
                <span className="text-[10px] text-text-muted mt-0.5 leading-tight">
                  {badge.description}
                </span>

                {badge.unlocked ? (
                  <span className="text-[9px] text-brand-primary font-bold bg-brand-bg px-2 py-0.5 rounded-full mt-2">
                    Unlocked {badge.unlockedAt ? formatDate(badge.unlockedAt) : ''}
                  </span>
                ) : (
                  <span className="text-[9px] text-text-muted bg-gray-200/50 px-2 py-0.5 rounded-full mt-2">
                    Locked 🔒
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
