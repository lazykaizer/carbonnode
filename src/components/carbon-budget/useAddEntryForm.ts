/** Custom hook encapsulating all state and submission logic for the manual carbon entry form. Keeps AddEntryForm.tsx as pure JSX. */
import { useState, useCallback, useMemo } from 'react';
import { useCarbonStore } from '@/stores/carbonStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { validateCarbonAmount, validateTextInput } from '@/utils/validators';
import { sanitizeInput } from '@/utils/sanitize';
import type { CarbonCategory } from '@/types';
import { ESTIMATION_FACTORS } from './estimation-factors';

export function useAddEntryForm(onSuccess: () => void) {
  const [category, setCategory] = useState<CarbonCategory>('transport');
  const [description, setDescription] = useState('');
  const [selectedSubtype, setSelectedSubtype] = useState(ESTIMATION_FACTORS.transport[0].id);
  const [useEstimator, setUseEstimator] = useState(true);
  const [multiplier, setMultiplier] = useState('10'); // e.g. 10 km
  const [directAmount, setDirectAmount] = useState('1.5'); // e.g. 1.5 kg CO2

  const [validationError, setValidationError] = useState<string | null>(null);

  const { addEntry } = useCarbonStore();
  const { awardXp, updateStreak, incrementTransportDays } = useGamificationStore();

  const handleCategoryChange = useCallback((newCategory: CarbonCategory) => {
    setCategory(newCategory);
    const defaults = ESTIMATION_FACTORS[newCategory];
    if (defaults.length > 0) {
      setSelectedSubtype(defaults[0].id);
      if (newCategory === 'other') {
        setUseEstimator(false);
      } else {
        setUseEstimator(true);
      }

      // Sensible multipliers per category
      if (newCategory === 'transport')
        setMultiplier('10'); // 10 km
      else if (newCategory === 'food')
        setMultiplier('1'); // 1 meal
      else if (newCategory === 'energy')
        setMultiplier('4'); // 4 hours
      else if (newCategory === 'shopping') setMultiplier('1'); // 1 item
    }
  }, []);

  const subtypes = useMemo(() => ESTIMATION_FACTORS[category], [category]);
  const activeSubtype = useMemo(
    () => subtypes.find((s) => s.id === selectedSubtype) || subtypes[0],
    [subtypes, selectedSubtype],
  );

  const calculatedCo2 = useMemo(() => {
    if (!useEstimator) {
      const parsed = parseFloat(directAmount);
      return isNaN(parsed) ? 0 : parsed;
    }
    const parsedMult = parseFloat(multiplier);
    if (isNaN(parsedMult)) return 0;
    return parseFloat((activeSubtype.factor * parsedMult).toFixed(2));
  }, [useEstimator, activeSubtype, multiplier, directAmount]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      setValidationError(null);

      // Validate description
      const descValidation = validateTextInput(description);
      if (!descValidation.isValid) {
        setValidationError(descValidation.error);
        return;
      }

      // Validate carbon amount
      const amtValidation = validateCarbonAmount(calculatedCo2);
      if (!amtValidation.isValid) {
        setValidationError(amtValidation.error);
        return;
      }

      const sanitizedDesc = sanitizeInput(description);

      // Add entry
      addEntry({
        category,
        activityName: sanitizedDesc.trim(),
        co2Kg: calculatedCo2,
        source: 'manual',
      });

      // Check transport streak
      if (
        category === 'transport' &&
        (activeSubtype.id === 'metro_train' || activeSubtype.id === 'public_bus')
      ) {
        incrementTransportDays();
      }

      awardXp('daily_log');
      updateStreak();
      onSuccess();
    },
    [
      category,
      description,
      calculatedCo2,
      activeSubtype,
      addEntry,
      awardXp,
      updateStreak,
      incrementTransportDays,
      onSuccess,
    ],
  );

  return {
    category,
    description,
    selectedSubtype,
    useEstimator,
    multiplier,
    directAmount,
    validationError,
    calculatedCo2,
    subtypes,
    activeSubtype,
    handleCategoryChange,
    handleSubmit,
    setDescription,
    setSelectedSubtype,
    setUseEstimator,
    setMultiplier,
    setDirectAmount,
  };
}
