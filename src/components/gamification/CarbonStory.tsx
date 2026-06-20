import { useState, useMemo, useCallback } from 'react';
import { useGamificationStore } from '@/stores/gamificationStore';
import { generateCarbonStory } from '@/services/geminiService';
import { useWeeklyStats } from '@/hooks/useWeeklyStats';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import StoryHistory from './StoryHistory';

const ratingColors = {
  excellent: { bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', label: 'Excellent' },
  good: { bg: 'bg-green-500/10 border-green-500/20 text-green-500', label: 'Good' },
  average: { bg: 'bg-amber-500/10 border-amber-500/20 text-amber-500', label: 'Average' },
  poor: { bg: 'bg-red-500/10 border-red-500/20 text-red-500', label: 'Poor' },
};

export default function CarbonStory() {
  const { stories, addStory, incrementShareCount } = useGamificationStore();
  const { weeklyStats, uniqueLogDays } = useWeeklyStats();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [storyAnnouncement, setStoryAnnouncement] = useState('');
  const [bypassCheck, setBypassCheck] = useState(false);

  const isSunday = new Date().getDay() === 0;
  const canGenerate = isSunday || uniqueLogDays >= 7 || bypassCheck;
  const currentWeekStory = useMemo(
    () => stories.find((s) => s.weekNumber === weeklyStats.weekNumber),
    [stories, weeklyStats.weekNumber],
  );

  const handleGenerateStory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStoryAnnouncement('');
    try {
      const result = await generateCarbonStory(weeklyStats);
      addStory({
        weekNumber: weeklyStats.weekNumber,
        story: result.story,
        highlightStat: result.highlightStat,
        weekRating: result.weekRating,
        nextWeekTip: result.nextWeekTip,
      });
      setStoryAnnouncement(
        `Week ${weeklyStats.weekNumber} carbon story is ready. Rating: ${result.weekRating}.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate weekly narrative.');
    } finally {
      setIsLoading(false);
    }
  }, [weeklyStats, addStory]);

  const handleShare = useCallback(() => {
    incrementShareCount();
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  }, [incrementShareCount]);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden relative">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {storyAnnouncement}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">
            📖
          </span>
          <h2 className="text-lg font-bold text-text-primary">Weekly Carbon Story</h2>
        </div>
        {import.meta.env.DEV && !currentWeekStory && (
          <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={bypassCheck}
              onChange={(e) => setBypassCheck(e.target.checked)}
              className="rounded text-brand-primary focus:ring-brand-primary"
            />
            <span>Dev Bypass</span>
          </label>
        )}
      </div>

      {isLoading ? (
        <div className="py-8 text-center animate-fade-in">
          <Loader size="sm" message="Writing your weekly carbon story..." />
        </div>
      ) : error ? (
        <div className="py-4 text-center text-status-danger text-sm animate-fade-in">
          <p className="mb-2">{error}</p>
          <Button size="sm" onClick={handleGenerateStory}>
            Retry
          </Button>
        </div>
      ) : currentWeekStory ? (
        <div className="space-y-4 text-left animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Week {currentWeekStory.weekNumber} Story
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${ratingColors[currentWeekStory.weekRating].bg}`}
            >
              {ratingColors[currentWeekStory.weekRating].label}
            </span>
          </div>
          <p className="text-base text-text-primary leading-relaxed italic">
            "{currentWeekStory.story}"
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
              <span className="text-xs text-text-secondary block mb-1">Highlight Achievement</span>
              <span className="text-lg font-bold text-brand-primary">
                {currentWeekStory.highlightStat}
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
              <span className="text-xs text-text-secondary block mb-1">Next Week's Goal</span>
              <span className="text-sm font-medium text-text-primary block leading-snug">
                {currentWeekStory.nextWeekTip}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="secondary" onClick={handleShare}>
              {shareSuccess ? '✓ Copied link!' : '🔗 Share Story'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-center py-4 animate-fade-in">
          <p className="text-sm text-text-secondary leading-relaxed">
            Every week, our AI analyzes your carbon budget, travel choices, and food logs to
            generate a creative personal narrative of your eco-journey.
          </p>
          {canGenerate ? (
            <div className="space-y-2">
              <p className="text-xs text-emerald-600 font-semibold">
                🎉 Ready to compile Week {weeklyStats.weekNumber}!
              </p>
              <Button onClick={handleGenerateStory}>Compile Weekly Narrative</Button>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200/50 p-4 rounded-xl text-xs text-text-secondary space-y-2">
              <p className="font-semibold text-text-primary">Narrative Unlock Status:</p>
              <div className="flex justify-around items-center pt-1">
                <div>
                  <span className="block text-base font-bold text-text-primary">
                    {uniqueLogDays} / 7
                  </span>
                  <span>Days Logged</span>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div>
                  <span className="block text-base font-bold text-text-primary">
                    {isSunday ? 'Yes' : 'Sunday'}
                  </span>
                  <span>Auto-compiles Sunday</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {stories.length > 0 && (
        <StoryHistory
          stories={stories}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          ratingColors={ratingColors}
        />
      )}
    </div>
  );
}
