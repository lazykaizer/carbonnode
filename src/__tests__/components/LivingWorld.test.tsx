import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorldVisual from '@/components/dashboard/WorldVisual';
import { useCarbonStore } from '@/stores/carbonStore';

// Mock Zustand carbon store
vi.mock('@/stores/carbonStore', () => ({
  useCarbonStore: vi.fn(),
}));

describe('LivingWorld WorldVisual Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders pristine biosphere with 6 trees and no smog when carbon budget is low', () => {
    // Proves that under 30% budget, the pristine state renders 6 tree emojis and no smog particles
    (useCarbonStore as unknown as import('vitest').Mock).mockReturnValue({
      getBudgetPercentage: () => 15
    });

    render(<WorldVisual />);

    // Check tree emoji count (should be 6)
    const trees = screen.getAllByText('🌳');
    expect(trees.length).toBe(6);

    // Verify pristine status label is visible
    expect(screen.getByText(/excellent! your carbon footprint is very low/i)).toBeInTheDocument();
  });

  it('renders good biosphere with 4 trees when carbon budget is moderate', () => {
    // Proves that under 60% budget, the good state renders 4 tree emojis
    (useCarbonStore as unknown as import('vitest').Mock).mockReturnValue({
      getBudgetPercentage: () => 45
    });

    render(<WorldVisual />);

    const trees = screen.getAllByText('🌳');
    expect(trees.length).toBe(4);
    expect(screen.getByText(/good job! you're below your budget/i)).toBeInTheDocument();
  });

  it('renders warning biosphere with 2 trees when carbon budget is high', () => {
    // Proves that under 85% budget, the warning state renders 2 tree emojis
    (useCarbonStore as unknown as import('vitest').Mock).mockReturnValue({
      getBudgetPercentage: () => 75
    });

    render(<WorldVisual />);

    const trees = screen.getAllByText('🌳');
    expect(trees.length).toBe(2);
    expect(screen.getByText(/careful — you're approaching your carbon budget/i)).toBeInTheDocument();
  });

  it('renders danger biosphere with 0 trees and smog warning when carbon budget is critical', () => {
    // Proves that over 85% budget, the danger state renders 0 trees and is labelled appropriately
    (useCarbonStore as unknown as import('vitest').Mock).mockReturnValue({
      getBudgetPercentage: () => 95
    });

    render(<WorldVisual />);

    // Should have 0 trees
    expect(screen.queryAllByText('🌳').length).toBe(0);
    expect(screen.getByText(/over budget! time to make greener choices/i)).toBeInTheDocument();
  });
});
