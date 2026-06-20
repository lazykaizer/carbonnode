/** Custom hook managing Carbon Mirror NLP submission, activity parsing, store updates, and gamification rewards. */
import { useState, useCallback } from 'react';
import { useCarbonStore } from '@/stores/carbonStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useUiStore } from '@/stores/uiStore';
import { analyzeDailyActivity } from '@/services/geminiService';
import { validateTextInput } from '@/utils/validators';
import { sanitizeInput } from '@/utils/sanitize';
import type { CarbonActivity } from '@/types';

export function useCarbonMirror() {
  const [inputText, setInputText] = useState('');
  const [activities, setActivities] = useState<CarbonActivity[]>([]);
  const [suggestion, setSuggestion] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { addEntry } = useCarbonStore();
  const { awardXp, updateStreak, incrementTransportDays } = useGamificationStore();
  const { loading, errors, setLoading, setError } = useUiStore();

  const handleSubmit = useCallback(
    async (textToSubmit?: string) => {
      const text = textToSubmit !== undefined ? textToSubmit : inputText;
      const sanitized = sanitizeInput(text);
      const validation = validateTextInput(sanitized);

      if (!validation.isValid) {
        setValidationError(validation.error);
        return;
      }

      setValidationError(null);
      setLoading('carbonMirror', true);
      setError('carbonMirror', null);

      try {
        const result = await analyzeDailyActivity(sanitized);

        setActivities(result.activities);
        setSuggestion(result.overallSuggestion);

        for (const activity of result.activities) {
          addEntry({
            category: activity.category,
            activityName: activity.name,
            co2Kg: activity.co2Kg,
            source: 'mirror',
          });

          if (
            activity.category === 'transport' &&
            /metro|bus|train|subway|public/i.test(activity.name)
          ) {
            incrementTransportDays();
          }
        }

        awardXp('daily_log');
        updateStreak();
        setInputText('');
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to analyze your activity. Please try again.';
        setError('carbonMirror', message);
      } finally {
        setLoading('carbonMirror', false);
      }
    },
    [inputText, addEntry, awardXp, updateStreak, incrementTransportDays, setLoading, setError],
  );

  return {
    inputText,
    setInputText,
    activities,
    suggestion,
    validationError,
    handleSubmit,
    isLoading: loading.carbonMirror,
    error: errors.carbonMirror,
  };
}
