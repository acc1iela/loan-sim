import type { LoanInput } from '../domain';
import { useLoanForm } from '../hooks/useLoanForm';
import { PrepaymentSection } from './PrepaymentSection';
import { INPUT_CLASS, LABEL_CLASS, ERROR_CLASS } from '../utils/styles';

interface LoanFormProps {
  onSubmit: (input: LoanInput) => void;
}

export function LoanForm({ onSubmit }: LoanFormProps) {
  const {
    form,
    errors,
    updateField,
    addOneTimeExtra,
    updateOneTimeExtra,
    removeOneTimeExtra,
    validate,
  } = useLoanForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { input, firstErrorFieldId } = validate();
    if (input) {
      onSubmit(input);
    } else if (firstErrorFieldId) {
      // バリデーションエラー時は最初のエラーフィールドにフォーカス
      document.getElementById(firstErrorFieldId)?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">ローン条件</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="principal" className={LABEL_CLASS}>
              借入額（円）
            </label>
            <input
              id="principal"
              type="number"
              value={form.principal}
              onChange={(e) => updateField('principal', e.target.value)}
              className={INPUT_CLASS}
              aria-invalid={!!errors.principal}
              aria-describedby={errors.principal ? 'principal-error' : undefined}
            />
            {errors.principal && (
              <p id="principal-error" className={ERROR_CLASS} role="alert">
                {errors.principal}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="annualInterestRate" className={LABEL_CLASS}>
              年利（%）
            </label>
            <input
              id="annualInterestRate"
              type="number"
              step="0.01"
              value={form.annualInterestRate}
              onChange={(e) => updateField('annualInterestRate', e.target.value)}
              className={INPUT_CLASS}
              aria-invalid={!!errors.annualInterestRate}
              aria-describedby={errors.annualInterestRate ? 'rate-error' : undefined}
            />
            {errors.annualInterestRate && (
              <p id="rate-error" className={ERROR_CLASS} role="alert">
                {errors.annualInterestRate}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="termYears" className={LABEL_CLASS}>
              返済年数
            </label>
            <input
              id="termYears"
              type="number"
              value={form.termYears}
              onChange={(e) => updateField('termYears', e.target.value)}
              className={INPUT_CLASS}
              aria-invalid={!!errors.termYears}
              aria-describedby={errors.termYears ? 'term-error' : undefined}
            />
            {errors.termYears && (
              <p id="term-error" className={ERROR_CLASS} role="alert">
                {errors.termYears}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="startYearMonth" className={LABEL_CLASS}>
              開始年月（YYYY-MM）
            </label>
            <input
              id="startYearMonth"
              type="month"
              value={form.startYearMonth}
              onChange={(e) => updateField('startYearMonth', e.target.value)}
              className={INPUT_CLASS}
              aria-invalid={!!errors.startYearMonth}
              aria-describedby={errors.startYearMonth ? 'start-error' : undefined}
            />
            {errors.startYearMonth && (
              <p id="start-error" className={ERROR_CLASS} role="alert">
                {errors.startYearMonth}
              </p>
            )}
          </div>
        </div>
      </div>

      <PrepaymentSection
        monthlyExtra={form.monthlyExtra}
        bonusMonths={form.bonusMonths}
        bonusAmount={form.bonusAmount}
        oneTimeExtras={form.oneTimeExtras}
        errors={errors}
        onFieldChange={(field, value) => updateField(field, value)}
        onAddOneTimeExtra={addOneTimeExtra}
        onUpdateOneTimeExtra={updateOneTimeExtra}
        onRemoveOneTimeExtra={removeOneTimeExtra}
      />

      <button
        type="submit"
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        シミュレーション実行
      </button>
    </form>
  );
}
