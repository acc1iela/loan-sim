import { OneTimeExtrasList } from './OneTimeExtrasList';
import { INPUT_CLASS as inputClass, LABEL_CLASS as labelClass, ERROR_CLASS as errorClass } from '../utils/styles';

interface OneTimeExtraItem {
  yearMonth: string;
  amount: string;
}

interface PrepaymentSectionProps {
  monthlyExtra: string;
  bonusMonths: string;
  bonusAmount: string;
  oneTimeExtras: OneTimeExtraItem[];
  errors: Record<string, string>;
  onFieldChange: (field: 'monthlyExtra' | 'bonusMonths' | 'bonusAmount', value: string) => void;
  onAddOneTimeExtra: () => void;
  onUpdateOneTimeExtra: (index: number, field: 'yearMonth' | 'amount', value: string) => void;
  onRemoveOneTimeExtra: (index: number) => void;
}

export function PrepaymentSection({
  monthlyExtra,
  bonusMonths,
  bonusAmount,
  oneTimeExtras,
  errors,
  onFieldChange,
  onAddOneTimeExtra,
  onUpdateOneTimeExtra,
  onRemoveOneTimeExtra,
}: PrepaymentSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">繰上げ返済</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="monthlyExtra" className={labelClass}>
            毎月の追加返済（円）
          </label>
          <input
            id="monthlyExtra"
            type="number"
            min="0"
            value={monthlyExtra}
            onChange={(e) => onFieldChange('monthlyExtra', e.target.value)}
            className={inputClass}
            aria-invalid={!!errors.monthlyExtra}
            aria-describedby={errors.monthlyExtra ? 'monthly-extra-error' : undefined}
          />
          {errors.monthlyExtra && (
            <p id="monthly-extra-error" className={errorClass} role="alert">
              {errors.monthlyExtra}
            </p>
          )}
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bonusMonths" className={labelClass}>
              ボーナス月（例: 6,12）
            </label>
            <input
              id="bonusMonths"
              type="text"
              placeholder="6,12"
              value={bonusMonths}
              onChange={(e) => onFieldChange('bonusMonths', e.target.value)}
              className={inputClass}
              aria-invalid={!!errors.bonusMonths}
              aria-describedby={errors.bonusMonths ? 'bonus-months-error' : undefined}
            />
            {errors.bonusMonths && (
              <p id="bonus-months-error" className={errorClass} role="alert">
                {errors.bonusMonths}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="bonusAmount" className={labelClass}>
              ボーナス月上乗せ額（円）
            </label>
            <input
              id="bonusAmount"
              type="number"
              min="0"
              value={bonusAmount}
              onChange={(e) => onFieldChange('bonusAmount', e.target.value)}
              className={inputClass}
              aria-invalid={!!errors.bonusAmount}
              aria-describedby={errors.bonusAmount ? 'bonus-amount-error' : undefined}
            />
            {errors.bonusAmount && (
              <p id="bonus-amount-error" className={errorClass} role="alert">
                {errors.bonusAmount}
              </p>
            )}
          </div>
        </div>
      </div>

      <OneTimeExtrasList
        items={oneTimeExtras}
        errors={errors}
        onAdd={onAddOneTimeExtra}
        onUpdate={onUpdateOneTimeExtra}
        onRemove={onRemoveOneTimeExtra}
      />
    </div>
  );
}
