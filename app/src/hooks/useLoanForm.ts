import { useState } from 'react';
import type { LoanInput, OneTimeExtra, YearMonth } from '../domain';
import { getCurrentYearMonth, tryCreateYearMonth } from '../domain';

export interface FormState {
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

export type ValidationErrors = Record<string, string>;

export interface UseLoanFormReturn {
  form: FormState;
  errors: ValidationErrors;
  updateField: (field: keyof FormState, value: string) => void;
  addOneTimeExtra: () => void;
  updateOneTimeExtra: (index: number, field: 'yearMonth' | 'amount', value: string) => void;
  removeOneTimeExtra: (index: number) => void;
  validate: () => LoanInput | null;
}

/**
 * LoanForm の状態管理とバリデーションを担当するフック
 */
export function useLoanForm(): UseLoanFormReturn {
  const [form, setForm] = useState<FormState>(() => ({
    ...initialFormState,
    startYearMonth: getCurrentYearMonth(),
  }));
  const [errors, setErrors] = useState<ValidationErrors>({});

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

  const validate = (): LoanInput | null => {
    const newErrors: ValidationErrors = {};

    // 借入額
    const principal = parseInt(form.principal, 10);
    if (isNaN(principal) || principal <= 0) {
      newErrors.principal = '借入額は正の整数で入力してください';
    }

    // 年利
    const annualInterestRate = parseFloat(form.annualInterestRate);
    if (isNaN(annualInterestRate) || annualInterestRate < 0) {
      newErrors.annualInterestRate = '年利は0以上の数値で入力してください';
    }

    // 返済年数
    const termYears = parseInt(form.termYears, 10);
    if (isNaN(termYears) || termYears <= 0) {
      newErrors.termYears = '返済年数は正の整数で入力してください';
    }

    // 開始年月
    const startYearMonth = tryCreateYearMonth(form.startYearMonth);
    if (!startYearMonth) {
      newErrors.startYearMonth = 'YYYY-MM形式で入力してください';
    }

    // 毎月の追加返済
    const monthlyExtra = parseInt(form.monthlyExtra, 10) || 0;
    if (monthlyExtra < 0) {
      newErrors.monthlyExtra = '0以上で入力してください';
    }

    // ボーナス月
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

    // ボーナス額
    const bonusAmount = parseInt(form.bonusAmount, 10) || 0;
    if (bonusAmount < 0) {
      newErrors.bonusAmount = '0以上で入力してください';
    }

    // 臨時返済
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
      return null;
    }

    return {
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
  };

  return {
    form,
    errors,
    updateField,
    addOneTimeExtra,
    updateOneTimeExtra,
    removeOneTimeExtra,
    validate,
  };
}
