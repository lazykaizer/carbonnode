/** Module containing UI components for StoryHistory. */
import type { CarbonStoryData } from '@/types';

interface StoryHistoryProps {
  stories: CarbonStoryData[];
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  ratingColors: Record<string, { bg: string; label: string }>;
}

export default function StoryHistory({
  stories,
  showHistory,
  setShowHistory,
  ratingColors,
}: StoryHistoryProps) {
  return (
    <div className="mt-6 border-t border-border pt-4">
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex justify-between items-center text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
      >
        <span>Story Archive ({stories.length})</span>
        <span>{showHistory ? '▲ Hide' : '▼ View All'}</span>
      </button>

      <div
        className={[
          'overflow-hidden transition-all duration-300',
          showHistory
            ? 'max-h-60 opacity-100 mt-3 space-y-3 overflow-y-auto pr-1'
            : 'max-h-0 opacity-0 pointer-events-none',
        ].join(' ')}
      >
        {stories.map((story) => (
          <div
            key={story.id}
            className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-left space-y-1.5"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-text-secondary">Week {story.weekNumber} Story</span>
              <span
                className={`px-2 py-0.5 rounded-full border text-[10px] ${ratingColors[story.weekRating]?.bg || ''}`}
              >
                {ratingColors[story.weekRating]?.label || story.weekRating}
              </span>
            </div>
            <p className="italic text-text-primary">"{story.story}"</p>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>
                Achievement: <b>{story.highlightStat}</b>
              </span>
              <span>{new Date(story.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
