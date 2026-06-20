import { axe } from 'vitest-axe';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SubtitleResultCard from '@/components/carbon-subtitles/SubtitleResultCard';
import type { SubtitleResult } from '@/types';

describe('SubtitleResultCard Component Tests', () => {
  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <SubtitleResultCard result={baseResult} prefersReducedMotion={false} />,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  const baseResult: SubtitleResult = {
    activity: 'Swiggy Food Delivery',
    co2Kg: 2.5,
    alternative: 'Cook at home',
    alternativeCo2Kg: 0.5,
    explanation: 'Delivery travel and packaging footprint is high.',
  };

  it('renders activity details, alternative recommendations, and potential savings when savings are positive', () => {
    // Proves that when the base choice emits more than the alternative, the potential savings text is displayed
    render(<SubtitleResultCard result={baseResult} prefersReducedMotion={false} />);

    expect(screen.getByText('Swiggy Food Delivery')).toBeInTheDocument();
    expect(screen.getByText('2.5 kg')).toBeInTheDocument(); // Base footprint
    expect(screen.getByText('0.50 kg')).toBeInTheDocument(); // Alternative footprint
    expect(screen.getByText(/try instead: cook at home/i)).toBeInTheDocument();
    expect(screen.getByText(/potential savings: 2.0 kg co₂/i)).toBeInTheDocument();
  });

  it('hides potential savings display when savings are zero or negative', () => {
    // Proves that when the alternative emits equal or more than the base choice, potential savings are hidden
    const zeroSavingsResult: SubtitleResult = {
      ...baseResult,
      co2Kg: 0.5,
      alternativeCo2Kg: 0.5,
    };

    render(<SubtitleResultCard result={zeroSavingsResult} prefersReducedMotion={false} />);

    expect(screen.queryByText(/potential savings:/i)).not.toBeInTheDocument();
  });
});
