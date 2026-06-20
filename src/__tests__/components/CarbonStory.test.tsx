import { axe } from 'vitest-axe';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CarbonStory from '@/components/gamification/CarbonStory';
import { useWeeklyStats } from '@/hooks/useWeeklyStats';
import { generateCarbonStory } from '@/services/geminiService';
import { useGamificationStore } from '@/stores/gamificationStore';

// Mock the dependencies
vi.mock('@/hooks/useWeeklyStats', () => ({
  useWeeklyStats: vi.fn(),
}));

vi.mock('@/services/geminiService', () => ({
  generateCarbonStory: vi.fn(),
}));

describe('CarbonStory Component Tests', () => {
  it('has no axe accessibility violations', async () => {
    (useWeeklyStats as import('vitest').Mock).mockReturnValue({
      weeklyStats: {
        totalCo2Kg: 20,
        vsIndianAverage: 'below',
        percentageVsAverage: 40,
        bestCategory: 'food',
        worstCategory: 'transport',
        streakDays: 3,
        actionsLogged: 5,
        topActivity: 'Metro ride',
        weekNumber: 1,
      },
      uniqueLogDays: 2,
    });
    const { container } = render(<CarbonStory />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    useGamificationStore.getState().resetGamification();
  });

  it('renders status message when narrative is locked and auto compile is pending', () => {
    // Proves that when logging threshold is not met, the narrative compilations are locked and show unlock criteria
    (useWeeklyStats as import('vitest').Mock).mockReturnValue({
      weeklyStats: {
        totalCo2Kg: 20,
        vsIndianAverage: 'below',
        percentageVsAverage: 40,
        bestCategory: 'food',
        worstCategory: 'transport',
        streakDays: 3,
        actionsLogged: 5,
        topActivity: 'Metro ride',
        weekNumber: 1,
      },
      uniqueLogDays: 2, // Less than 7 days
    });

    render(<CarbonStory />);

    expect(screen.getByText(/narrative unlock status/i)).toBeInTheDocument();
    expect(screen.getByText(/2 \/ 7/i)).toBeInTheDocument();
  });

  it('allows compilation via dev bypass and renders generated story details', async () => {
    // Proves that enabling Dev Bypass unlocks compiles, calls API, and renders the weekly story, highlight, and next week tip
    (useWeeklyStats as import('vitest').Mock).mockReturnValue({
      weeklyStats: {
        totalCo2Kg: 25,
        vsIndianAverage: 'below',
        percentageVsAverage: 40,
        bestCategory: 'food',
        worstCategory: 'transport',
        streakDays: 4,
        actionsLogged: 8,
        topActivity: 'Metro ride',
        weekNumber: 1,
      },
      uniqueLogDays: 4,
    });

    const mockStoryResult = {
      story: 'You saved the planet this week with metro travel!',
      highlightStat: '12kg CO2 saved',
      weekRating: 'excellent' as const,
      nextWeekTip: 'Eat vegetarian twice next week.',
    };
    (generateCarbonStory as import('vitest').Mock).mockResolvedValueOnce(mockStoryResult);

    render(<CarbonStory />);

    // Enable dev bypass
    const devBypassCheckbox = screen.getByLabelText(/dev bypass/i);
    fireEvent.click(devBypassCheckbox);

    // Compile button should be visible now
    const compileBtn = screen.getByRole('button', { name: /compile weekly narrative/i });
    fireEvent.click(compileBtn);

    // Check loading indicator
    expect(screen.getAllByText(/writing your weekly carbon story/i)[0]).toBeInTheDocument();

    // Wait for the async result to render
    const storyTexts = await screen.findAllByText(
      /You saved the planet this week with metro travel!/i,
    );
    expect(storyTexts[0]).toBeInTheDocument();
    expect(screen.getAllByText('12kg CO2 saved')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Eat vegetarian twice next week.')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Excellent')[0]).toBeInTheDocument();
  });
});
