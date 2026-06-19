import { useState, useCallback, useMemo } from 'react';
import Button from '@/components/common/Button';
import { useCarbonStore } from '@/stores/carbonStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { validateCarbonAmount, validateTextInput } from '@/utils/validators';
import { sanitizeInput } from '@/utils/sanitize';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/utils/constants';
import type { CarbonCategory } from '@/types';
import {
  CAR_PETROL_KG_PER_KM,
  CAR_DIESEL_KG_PER_KM,
  CAR_EV_KG_PER_KM,
  TWO_WHEELER_INDIA_KG_PER_KM,
  AUTO_RICKSHAW_KG_PER_KM,
  BUS_INDIA_KG_PER_KM,
  METRO_INDIA_KG_PER_KM,
  MEAL_BEEF_KG,
  MEAL_CHICKEN_KG,
  MEAL_VEG_KG,
  MEAL_VEGAN_KG,
  AC_KG_PER_HOUR,
  HEATER_KG_PER_HOUR,
  APPLIANCES_KG_PER_HOUR,
  LIGHTS_KG_PER_HOUR,
  SHOP_POLYESTER_KG,
  SHOP_COTTON_KG,
  SHOP_ELECTRONICS_KG,
  SHOP_PLASTIC_KG,
  CUSTOM_KG,
} from '@/utils/emissionFactors';

interface AddEntryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// Simple factors for estimation (in kg CO2 per unit)
const ESTIMATION_FACTORS: Record<CarbonCategory, Array<{ id: string; name: string; unit: string; factor: number; requiresMultiplier: boolean }>> = {
  transport: [
    { id: 'car_petrol', name: 'Petrol Car Ride', unit: 'km', factor: CAR_PETROL_KG_PER_KM, requiresMultiplier: true },
    { id: 'car_diesel', name: 'Diesel Car Ride', unit: 'km', factor: CAR_DIESEL_KG_PER_KM, requiresMultiplier: true },
    { id: 'car_ev', name: 'Electric Vehicle (EV)', unit: 'km', factor: CAR_EV_KG_PER_KM, requiresMultiplier: true },
    { id: 'two_wheeler', name: 'Scooter/Motorcycle', unit: 'km', factor: TWO_WHEELER_INDIA_KG_PER_KM, requiresMultiplier: true },
    { id: 'auto_rickshaw', name: 'Auto Rickshaw', unit: 'km', factor: AUTO_RICKSHAW_KG_PER_KM, requiresMultiplier: true },
    { id: 'public_bus', name: 'Public Bus Ride', unit: 'km', factor: BUS_INDIA_KG_PER_KM, requiresMultiplier: true },
    { id: 'metro_train', name: 'Metro / Local Train', unit: 'km', factor: METRO_INDIA_KG_PER_KM, requiresMultiplier: true },
  ],
  food: [
    { id: 'meal_beef', name: 'Red Meat (Beef/Mutton) Meal', unit: 'meals', factor: MEAL_BEEF_KG, requiresMultiplier: true },
    { id: 'meal_chicken', name: 'Poultry/Fish Meal', unit: 'meals', factor: MEAL_CHICKEN_KG, requiresMultiplier: true },
    { id: 'meal_veg', name: 'Vegetarian Meal', unit: 'meals', factor: MEAL_VEG_KG, requiresMultiplier: true },
    { id: 'meal_vegan', name: 'Vegan Meal', unit: 'meals', factor: MEAL_VEGAN_KG, requiresMultiplier: true },
  ],
  energy: [
    { id: 'energy_ac', name: 'Air Conditioning', unit: 'hours', factor: AC_KG_PER_HOUR, requiresMultiplier: true },
    { id: 'energy_heater', name: 'Space Heater', unit: 'hours', factor: HEATER_KG_PER_HOUR, requiresMultiplier: true },
    { id: 'energy_appliances', name: 'Computer / TV', unit: 'hours', factor: APPLIANCES_KG_PER_HOUR, requiresMultiplier: true },
    { id: 'energy_lights', name: 'Lighting & Fan (Average room)', unit: 'hours', factor: LIGHTS_KG_PER_HOUR, requiresMultiplier: true },
  ],
  shopping: [
    { id: 'shop_polyester', name: 'Polyester/Synthetic Clothes', unit: 'items', factor: SHOP_POLYESTER_KG, requiresMultiplier: true },
    { id: 'shop_cotton', name: 'Cotton Clothing', unit: 'items', factor: SHOP_COTTON_KG, requiresMultiplier: true },
    { id: 'shop_electronics', name: 'Smartphone / Gadget', unit: 'items', factor: SHOP_ELECTRONICS_KG, requiresMultiplier: true },
    { id: 'shop_plastic', name: 'Plastic/Household goods', unit: 'items', factor: SHOP_PLASTIC_KG, requiresMultiplier: true },
  ],
  other: [
    { id: 'other_custom', name: 'Custom footprint entry', unit: 'kg CO₂', factor: CUSTOM_KG, requiresMultiplier: false },
  ],
};

export default function AddEntryForm({ onSuccess, onCancel }: AddEntryFormProps) {
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
      if (newCategory === 'transport') setMultiplier('10'); // 10 km
      else if (newCategory === 'food') setMultiplier('1'); // 1 meal
      else if (newCategory === 'energy') setMultiplier('4'); // 4 hours
      else if (newCategory === 'shopping') setMultiplier('1'); // 1 item
    }
  }, []);

  const subtypes = useMemo(() => ESTIMATION_FACTORS[category], [category]);
  const activeSubtype = useMemo(() => subtypes.find(s => s.id === selectedSubtype) || subtypes[0], [subtypes, selectedSubtype]);

  const calculatedCo2 = useMemo(() => {
    if (!useEstimator) {
      const parsed = parseFloat(directAmount);
      return isNaN(parsed) ? 0 : parsed;
    }
    const parsedMult = parseFloat(multiplier);
    if (isNaN(parsedMult)) return 0;
    return parseFloat((activeSubtype.factor * parsedMult).toFixed(2));
  }, [useEstimator, activeSubtype, multiplier, directAmount]);

  const handleSubmit = useCallback((event: React.FormEvent) => {
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
    if (category === 'transport' && (activeSubtype.id === 'metro_train' || activeSubtype.id === 'public_bus')) {
      incrementTransportDays();
    }

    awardXp('daily_log');
    updateStreak();
    onSuccess();
  }, [category, description, calculatedCo2, activeSubtype, addEntry, awardXp, updateStreak, incrementTransportDays, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Category
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {(Object.keys(ESTIMATION_FACTORS) as CarbonCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              aria-pressed={category === cat}
              aria-label={`${CATEGORY_LABELS[cat]} category${category === cat ? ' (selected)' : ''}`}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all cursor-pointer min-h-[44px] min-w-[44px] ${
                category === cat
                  ? 'border-brand-secondary bg-brand-bg text-brand-primary'
                  : 'border-gray-200 text-text-secondary hover:bg-gray-50'
              }`}
            >
              <span className="text-xl" aria-hidden="true">{CATEGORY_ICONS[cat]}</span>
              <span className="text-[10px] font-semibold mt-1 truncate max-w-full">
                {CATEGORY_LABELS[cat].split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="manual-description" className="block text-sm font-medium text-text-secondary mb-1">
          Activity Description
        </label>
        <input
          id="manual-description"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={`e.g. ${category === 'transport' ? 'Commuted to office' : category === 'food' ? 'Had lunch with friends' : 'Used appliances'}`}
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 min-h-[44px]"
          required
        />
      </div>

      {/* Estimator vs Direct Amount Toggle */}
      {category !== 'other' && (
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setUseEstimator(true)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] ${
              useEstimator
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            ⚡ AI Estimator Guide
          </button>
          <button
            type="button"
            onClick={() => setUseEstimator(false)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] ${
              !useEstimator
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            ✍️ Enter Direct kg CO₂
          </button>
        </div>
      )}

      {/* Inputs */}
      {useEstimator && category !== 'other' ? (
        <div className="bg-gray-50 p-4 rounded-xl space-y-3">
          <div>
            <label htmlFor="manual-subtype" className="block text-xs font-medium text-text-secondary mb-1">
              Type of {CATEGORY_LABELS[category]}
            </label>
            <select
              id="manual-subtype"
              value={selectedSubtype}
              onChange={(event) => setSelectedSubtype(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-secondary focus:outline-none min-h-[44px]"
            >
              {subtypes.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} (~{sub.factor} kg CO₂/{sub.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="manual-multiplier" className="block text-xs font-medium text-text-secondary mb-1">
              Amount ({activeSubtype.unit})
            </label>
            <input
              id="manual-multiplier"
              type="number"
              value={multiplier}
              onChange={(event) => setMultiplier(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:outline-none min-h-[44px]"
              min="0.1"
              step="any"
              required
            />
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-xl">
          <label htmlFor="manual-direct-amount" className="block text-xs font-medium text-text-secondary mb-1">
            Carbon Footprint (kg CO₂)
          </label>
          <input
            id="manual-direct-amount"
            type="number"
            value={directAmount}
            onChange={(event) => setDirectAmount(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:outline-none min-h-[44px]"
            min="0.01"
            step="any"
            required
          />
        </div>
      )}

      {/* Calculated Total Display */}
      <div className="flex items-center justify-between p-3 bg-brand-bg rounded-xl font-semibold">
        <span className="text-sm text-brand-primary">Calculated Footprint:</span>
        <span className="text-base text-brand-primary carbon-value">
          {calculatedCo2.toFixed(2)} kg CO₂
        </span>
      </div>

      {validationError && (
        <p className="text-xs text-status-danger mt-1 text-center" role="alert">
          {validationError}
        </p>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          size="sm"
          fullWidth
        >
          Save Activity
        </Button>
        <Button
          onClick={onCancel}
          type="button"
          size="sm"
          variant="outline"
          fullWidth
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
