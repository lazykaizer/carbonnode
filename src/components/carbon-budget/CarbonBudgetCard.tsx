import { useState, useMemo, useCallback } from 'react';
import { FeatureCardShell } from '@/components/dashboard/FeatureGrid';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import AddEntryForm from './AddEntryForm';
import { BudgetBar } from './BudgetBar';
import { useCarbonStore } from '@/stores/carbonStore';
import { formatCo2Kg } from '@/utils/formatters';
import { validateBudgetLimit } from '@/utils/validators';
import { CATEGORY_LABELS, AVERAGE_INDIAN_MONTHLY_CO2_KG } from '@/utils/constants';
import type { CarbonCategory } from '@/types';

export default function CarbonBudgetCard() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CarbonCategory>('transport');
  const [editLimit, setEditLimit] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const { categoryBudgets, getCategoryTotal, updateBudgetLimit, getTotalMonthlyUsage } =
    useCarbonStore();

  const totalUsed = getTotalMonthlyUsage();
  const totalLimit = useMemo(
    () => categoryBudgets.reduce((sum, budget) => sum + budget.limitKg, 0),
    [categoryBudgets],
  );

  const handleEditBudget = useCallback(
    (category: CarbonCategory) => {
      const currentBudget = categoryBudgets.find((b) => b.category === category);
      setEditCategory(category);
      setEditLimit(currentBudget ? String(currentBudget.limitKg) : '');
      setEditError(null);
      setIsEditModalOpen(true);
    },
    [categoryBudgets],
  );

  const handleSaveBudget = useCallback(() => {
    const limit = parseFloat(editLimit);
    const validation = validateBudgetLimit(limit);

    if (!validation.isValid) {
      setEditError(validation.error);
      return;
    }

    updateBudgetLimit(editCategory, limit);
    setIsEditModalOpen(false);
  }, [editLimit, editCategory, updateBudgetLimit]);

  return (
    <>
      <FeatureCardShell
        title="Carbon Budget"
        icon="💰"
        accentColor="#e67e22"
        headerAction={
          <div className="flex gap-3">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="text-xs text-brand-primary font-bold hover:text-brand-secondary transition-colors cursor-pointer touch-target"
              aria-label="Log manual carbon activity"
            >
              + Log Activity
            </button>
            <button
              onClick={() => handleEditBudget('transport')}
              className="text-xs text-brand-secondary hover:text-brand-primary transition-colors cursor-pointer touch-target"
              aria-label="Edit budget limits"
            >
              Edit
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Overall summary */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="text-xs text-text-muted">Monthly Total</p>
              <p className="text-lg font-bold carbon-value text-text-primary">
                {formatCo2Kg(totalUsed)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">Budget</p>
              <p className="text-lg font-bold carbon-value text-text-secondary">
                {formatCo2Kg(totalLimit)}
              </p>
            </div>
          </div>

          {/* Comparison */}
          <p className="text-xs text-text-muted text-center">
            Indian average: ~{AVERAGE_INDIAN_MONTHLY_CO2_KG} kg/month
          </p>

          {/* Category bars */}
          <div className="space-y-3">
            {categoryBudgets.map((budget) => (
              <button
                key={budget.category}
                onClick={() => handleEditBudget(budget.category)}
                className="w-full text-left cursor-pointer hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
                aria-label={`Edit ${CATEGORY_LABELS[budget.category]} budget`}
              >
                <BudgetBar
                  category={budget.category}
                  usedKg={getCategoryTotal(budget.category)}
                  limitKg={budget.limitKg}
                />
              </button>
            ))}
          </div>
        </div>
      </FeatureCardShell>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit ${CATEGORY_LABELS[editCategory]} Budget`}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="budget-limit-input"
              className="block text-sm font-medium text-text-secondary mb-2"
            >
              Monthly limit (kg CO₂)
            </label>
            <input
              id="budget-limit-input"
              type="number"
              value={editLimit}
              onChange={(event) => setEditLimit(event.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/20"
              min="1"
              max="1000"
              aria-invalid={editError ? 'true' : 'false'}
              aria-describedby={editError ? 'budget-edit-error' : undefined}
            />
            {editError && (
              <p id="budget-edit-error" className="text-xs text-status-danger mt-1" role="alert">
                {editError}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSaveBudget} size="sm" fullWidth>
              Save
            </Button>
            <Button onClick={() => setIsEditModalOpen(false)} size="sm" variant="outline" fullWidth>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Log Activity Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Carbon Activity"
      >
        <AddEntryForm
          onSuccess={() => setIsLogModalOpen(false)}
          onCancel={() => setIsLogModalOpen(false)}
        />
      </Modal>
    </>
  );
}
