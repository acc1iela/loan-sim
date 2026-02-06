import { useState } from 'react';
import type { LoanInput, OneTimeExtra, YearMonth } from '../domain';
import { getCurrentYearMonth, tryCreateYearMonth } from '../domain';

interface LoanFormProps {
  onSubmit: (input: LoanInput) => void;
}

interface FormState {
  principal: string;
  annualInterestRate: string;
  termYears: string;
  startYearMonth: string;
  monthlyExtra: string;
  bonusMonths: string;
  bonusAmount: string;
  oneTimeExtras: { yearMonth: string; amount: string }[];
}

const initialFormState: FormState = {
  principal: '30000000',
  annualInterestRate: '1.5',
  termYears: '35',
  startYearMonth: '',
  monthlyExtra: '0',
  bonusMonths: '',
  bonusAmount: '0',
  oneTimeExtras: [],
};

export function LoanForm({ onSubmit }: LoanFormProps) {
  const [form, setForm] = useState<FormState>(() => ({
    ...initialFormState,
    startYearMonth: getCurrentYearMonth(),
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const addOneTimeExtra = () => {
    setForm((prev) => ({
      ...prev,
      oneTimeExtras: [...prev.oneTimeExtras, { yearMonth: '', amount: '0' }],
    }));
  };

  const updateOneTimeExtra = (index: number, field: 'yearMonth' | 'amount', value: string) => {
    setForm((prev) => ({
      ...prev,
      oneTimeExtras: prev.oneTimeExtras.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeOneTimeExtra = (index: number) => {
    setForm((prev) => ({
      ...prev,
      oneTimeExtras: prev.oneTimeExtras.filter((_, i) => i !== index),
    }));
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // バリデーション
    const principal = parseInt(form.principal, 10);
    if (isNaN(principal) || principal <= 0) {
      newErrors.principal = '借入額は正の整数で入力してください';
    }

    const annualInterestRate = parseFloat(form.annualInterestRate);
    if (isNaN(annualInterestRate) || annualInterestRate < 0) {
      newErrors.annualInterestRate = '年利は0以上の数値で入力してください';
    }

    const termYears = parseInt(form.termYears, 10);
    if (isNaN(termYears) || termYears <= 0) {
      newErrors.termYears = '返済年数は正の整数で入力してください';
    }

    const startYearMonth = tryCreateYearMonth(form.startYearMonth);
    if (!startYearMonth) {
      newErrors.startYearMonth = 'YYYY-MM形式で入力してください';
    }

    const monthlyExtra = parseInt(form.monthlyExtra, 10) || 0;
    if (monthlyExtra < 0) {
      newErrors.monthlyExtra = '0以上で入力してください';
    }

    // ボーナス月のパース
    const bonusMonthsStr = form.bonusMonths.trim();
    const bonusMonths: number[] = [];
    if (bonusMonthsStr) {
      const parts = bonusMonthsStr.split(',').map((s) => s.trim());
      for (const part of parts) {
        const month = parseInt(part, 10);
        if (isNaN(month) || month < 1 || month > 12) {
          newErrors.bonusMonths = '1-12の数値をカンマ区切りで入力してください';
          break;
        }
        bonusMonths.push(month);
      }
    }

    const bonusAmount = parseInt(form.bonusAmount, 10) || 0;
    if (bonusAmount < 0) {
      newErrors.bonusAmount = '0以上で入力してください';
    }

    // 臨時返済のパース
    const oneTimeExtras: OneTimeExtra[] = [];
    for (let i = 0; i < form.oneTimeExtras.length; i++) {
      const item = form.oneTimeExtras[i];
      const ym = tryCreateYearMonth(item.yearMonth);
      const amount = parseInt(item.amount, 10) || 0;

      if (!ym) {
        newErrors[`oneTimeExtras.${i}.yearMonth`] = 'YYYY-MM形式で入力してください';
      }
      if (amount < 0) {
        newErrors[`oneTimeExtras.${i}.amount`] = '0以上で入力してください';
      }

      if (ym && amount >= 0) {
        oneTimeExtras.push({ yearMonth: ym, amount });
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const input: LoanInput = {
      principal,
      annualInterestRate,
      termYears,
      startYearMonth: startYearMonth as YearMonth,
      repaymentMethod: 'annuity',
      prepayment: {
        monthlyExtra,
        bonusExtra:
          bonusMonths.length > 0 && bonusAmount > 0
            ? { months: bonusMonths, amount: bonusAmount }
            : undefined,
        oneTimeExtras,
      },
    };

    onSubmit(input);
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const errorClass = 'text-red-500 text-sm mt-1';

  return (
    <form onSubmit={validateAndSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">ローン条件</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="principal" className={labelClass}>
              借入額（円）
            </label>
            <input
              id="principal"
              type="number"
              value={form.principal}
              onChange={(e) => updateField('principal', e.target.value)}
              className={inputClass}
              aria-invalid={!!errors.principal}
              aria-describedby={errors.principal ? 'principal-error' : undefined}
            />
            {errors.principal && (
              <p id="principal-error" className={errorClass} role="alert">
                {errors.principal}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="annualInterestRate" className={labelClass}>
              年利（%）
            </label>
            <input
              id="annualInterestRate"
              type="number"
              step="0.01"
              value={form.annualInterestRate}
              onChange={(e) => updateField('annualInterestRate', e.target.value)}
              className={inputClass}
              aria-invalid={!!errors.annualInterestRate}
              aria-describedby={errors.annualInterestRate ? 'rate-error' : undefined}
            />
            {errors.annualInterestRate && (
              <p id="rate-error" className={errorClass} role="alert">
                {errors.annualInterestRate}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="termYears" className={labelClass}>
              返済年数
            </label>
            <input
              id="termYears"
              type="number"
              value={form.termYears}
              onChange={(e) => updateField('termYears', e.target.value)}
              className={inputClass}
              aria-invalid={!!errors.termYears}
              aria-describedby={errors.termYears ? 'term-error' : undefined}
            />
            {errors.termYears && (
              <p id="term-error" className={errorClass} role="alert">
                {errors.termYears}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="startYearMonth" className={labelClass}>
              開始年月（YYYY-MM）
            </label>
            <input
              id="startYearMonth"
              type="month"
              value={form.startYearMonth}
              onChange={(e) => updateField('startYearMonth', e.target.value)}
              className={inputClass}
              aria-invalid={!!errors.startYearMonth}
              aria-describedby={errors.startYearMonth ? 'start-error' : undefined}
            />
            {errors.startYearMonth && (
              <p id="start-error" className={errorClass} role="alert">
                {errors.startYearMonth}
              </p>
            )}
          </div>
        </div>
      </div>

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
              value={form.monthlyExtra}
              onChange={(e) => updateField('monthlyExtra', e.target.value)}
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
                value={form.bonusMonths}
                onChange={(e) => updateField('bonusMonths', e.target.value)}
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
                value={form.bonusAmount}
                onChange={(e) => updateField('bonusAmount', e.target.value)}
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

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className={labelClass}>特定月の臨時返済</span>
            <button
              type="button"
              onClick={addOneTimeExtra}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + 追加
            </button>
          </div>

          {form.oneTimeExtras.map((item, index) => {
            const ymErrorKey = `oneTimeExtras.${index}.yearMonth`;
            const amtErrorKey = `oneTimeExtras.${index}.amount`;
            return (
              <div key={index} className="flex gap-2 mb-2 items-start">
                <div className="flex-1">
                  <input
                    type="month"
                    value={item.yearMonth}
                    onChange={(e) => updateOneTimeExtra(index, 'yearMonth', e.target.value)}
                    className={inputClass}
                    placeholder="YYYY-MM"
                    aria-label={`臨時返済${index + 1}の年月`}
                    aria-invalid={!!errors[ymErrorKey]}
                    aria-describedby={errors[ymErrorKey] ? `ote-ym-error-${index}` : undefined}
                  />
                  {errors[ymErrorKey] && (
                    <p id={`ote-ym-error-${index}`} className={errorClass} role="alert">
                      {errors[ymErrorKey]}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => updateOneTimeExtra(index, 'amount', e.target.value)}
                    className={inputClass}
                    placeholder="金額"
                    aria-label={`臨時返済${index + 1}の金額`}
                    aria-invalid={!!errors[amtErrorKey]}
                    aria-describedby={errors[amtErrorKey] ? `ote-amt-error-${index}` : undefined}
                  />
                  {errors[amtErrorKey] && (
                    <p id={`ote-amt-error-${index}`} className={errorClass} role="alert">
                      {errors[amtErrorKey]}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeOneTimeExtra(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                  aria-label={`臨時返済${index + 1}を削除`}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        シミュレーション実行
      </button>
    </form>
  );
}
