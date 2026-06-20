/** Custom hook deriving world visual configuration from current budget percentage. */
import { useMemo } from 'react';
import { useCarbonStore } from '@/stores/carbonStore';
import { getWorldStateFromBudget } from '@/services/carbonCalculator';
import { WORLD_STATES } from '@/utils/constants';
import type { WorldVisualConfig } from '@/types';

export function useWorldVisual() {
  const { getBudgetPercentage } = useCarbonStore();
  const budgetPercentage = getBudgetPercentage();

  const worldState = useMemo(() => getWorldStateFromBudget(budgetPercentage), [budgetPercentage]);

  const config: WorldVisualConfig = useMemo(() => WORLD_STATES[worldState], [worldState]);

  const treeArray = useMemo(
    () => Array.from({ length: config.treeCount }, (_, i) => i),
    [config.treeCount],
  );

  const smogArray = useMemo(() => (config.showSmog ? [0, 1, 2] : []), [config.showSmog]);

  const stateLabels: Record<string, string> = {
    pristine: 'Excellent! Your carbon footprint is very low.',
    good: "Good job! You're below your budget.",
    warning: "Careful — you're approaching your carbon budget.",
    danger: 'Over budget! Time to make greener choices.',
  };

  const ariaLabels: Record<string, string> = {
    pristine:
      'Carbon world status: Pristine. Clean air and healthy ecosystem. Your emissions are well within budget.',
    good: 'Carbon world status: Good. Moderate emissions, trees are present.',
    warning: 'Carbon world status: Warning. High emissions, ecosystem is stressed.',
    danger: 'Carbon world status: Danger. Critical emissions, heavy smog affecting the biosphere.',
  };

  return {
    worldState,
    config,
    treeArray,
    smogArray,
    stateLabels,
    ariaLabels,
  };
}
