/** Module containing UI components for AddEntryForm. */
import Button from '@/components/common/Button';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/utils/constants';
import type { CarbonCategory } from '@/types';
import { useAddEntryForm } from './useAddEntryForm';
import { ESTIMATION_FACTORS } from './estimation-factors';

interface AddEntryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddEntryForm({ onSuccess, onCancel }: AddEntryFormProps) {
  const {
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
  } = useAddEntryForm(onSuccess);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
        <div className="grid grid-cols-5 gap-1.5">
          {(Object.keys(ESTIMATION_FACTORS) as CarbonCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              aria-pressed={category === cat}
              aria-label={`${CATEGORY_LABELS[cat]} category${category === cat ? ' (selected)' : ''}`}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all cursor-pointer min-h-[44px] min-w-[44px] ${category === cat ? 'border-brand-secondary bg-brand-bg text-brand-primary' : 'border-gray-200 text-text-secondary hover:bg-gray-50'}`}
            >
              <span className="text-xl" aria-hidden="true">
                {CATEGORY_ICONS[cat]}
              </span>
              <span className="text-[10px] font-semibold mt-1 truncate max-w-full">
                {CATEGORY_LABELS[cat].split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="manual-description"
          className="block text-sm font-medium text-text-secondary mb-1"
        >
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
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] ${useEstimator ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >
            ⚡ AI Estimator Guide
          </button>
          <button
            type="button"
            onClick={() => setUseEstimator(false)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] ${!useEstimator ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
          >
            ✍️ Enter Direct kg CO₂
          </button>
        </div>
      )}

      {/* Inputs */}
      {useEstimator && category !== 'other' ? (
        <div className="bg-gray-50 p-4 rounded-xl space-y-3">
          <div>
            <label
              htmlFor="manual-subtype"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
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
            <label
              htmlFor="manual-multiplier"
              className="block text-xs font-medium text-text-secondary mb-1"
            >
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
          <label
            htmlFor="manual-direct-amount"
            className="block text-xs font-medium text-text-secondary mb-1"
          >
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
        <Button type="submit" size="sm" fullWidth>
          Save Activity
        </Button>
        <Button onClick={onCancel} type="button" size="sm" variant="outline" fullWidth>
          Cancel
        </Button>
      </div>
    </form>
  );
}
