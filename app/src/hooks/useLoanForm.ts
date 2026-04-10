import { useState, useEffect } from 'react';
import type { LoanInput, OneTimeExtra, YearMonth } from '../domain';
import { getCurrentYearMonth, tryCreateYearMonth } from '../domain';

const STORAGE_KEY = 'loan-sim-form-v2';

function loadFromStorage(): FormState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FormState;
    // 最低限の構造チェック
    if (typeof parsed.principal !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export interface FormState {
  principal: string;
  annualInterestRate: string;
  termYears: string;
  startYearMonth: string;
  monthlyExtra: string;
  bonusMonths: string;
  bonusAmount: string;
  oneTimeExtras: { id: string; yearMonth: string; amount: string }[];
}

const initialFormState: FormState = {
  principal: '6000000',
  annualInterestRate: '3.0',
  termYears: '7',
  startYearMonth: '',
  monthlyExtra: '0',
  bonusMonths: '',
  bonusAmount: '0',
  oneTimeExtras: [],
};

export type ValidationErrors = Record<string, string>;

export interface ValidateResult {
  input: LoanInput | null;
  firstErrorFieldId: string | null;
}

export interface UseLoanFormReturn {
  form: FormState;
  errors: ValidationErrors;
  updateField: (field: keyof FormState, value: string) => void;
  addOneTimeExtra: () => void;
  updateOneTimeExtra: (index: number, field: 'yearMonth' | 'amount', value: string) => void;
  removeOneTimeExtra: (index: number) => void;
  validate: () => ValidateResult;
}

/**
 * LoanForm の状態管理とバリデーションを担当するフック
 */
export function useLoanForm(): UseLoanFormReturn {
  const [form, setForm] = useState<FormState>(() => {
    const saved = loadFromStorage();
    return saved ?? { ...initialFormState, startYearMonth: getCurrentYearMonth() };
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // localStorage が使えない環境（プライベートブラウジング制限等）では無視
    }
  }, [form]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const addOneTimeExtra = () => {
    setForm((prev) => ({
      ...prev,
      oneTimeExtras: [
        ...prev.oneTimeExtras,
        { id: crypto.randomUUID(), yearMonth: '', amount: '0' },
      ],
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

  const validate = (): ValidateResult => {
    const newErrors: ValidationErrors = {};

    // 借入額
    const principal = parseInt(form.principal, 10);
    if (isNaN(principal) || principal <= 0) {
      newErrors.principal = '借入額は1円以上5億円以下の整数で入力してください';
    } else if (principal > 500_000_000) {
      newErrors.principal = '借入額は1円以上5億円以下の整数で入力してください';
    }

    // 年利
    const annualInterestRate = parseFloat(form.annualInterestRate);
    if (isNaN(annualInterestRate) || annualInterestRate < 0) {
      newErrors.annualInterestRate = '年利は0以上の数値で入力してください';
    } else if (annualInterestRate > 100) {
      newErrors.annualInterestRate = '年利は100%以下で入力してください';
    }

    // 返済年数
    const termYears = parseInt(form.termYears, 10);
    if (isNaN(termYears) || termYears <= 0) {
      newErrors.termYears = '返済年数は1年以上50年以下の整数で入力してください';
    } else if (termYears > 50) {
      newErrors.termYears = '返済年数は1年以上50年以下の整数で入力してください';
    }

    // 開始年月
    const startYearMonth = tryCreateYearMonth(form.startYearMonth);
    if (!startYearMonth) {
      newErrors.startYearMonth = 'YYYY-MM形式で入力してください';
    }

    // 毎月の追加返済
    const monthlyExtraRaw = parseInt(form.monthlyExtra, 10);
    if (isNaN(monthlyExtraRaw) || monthlyExtraRaw < 0) {
      newErrors.monthlyExtra = '0以上の整数で入力してください';
    }
    const monthlyExtra = isNaN(monthlyExtraRaw) ? 0 : monthlyExtraRaw;

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
    const bonusAmountRaw = parseInt(form.bonusAmount, 10);
    if (isNaN(bonusAmountRaw) || bonusAmountRaw < 0) {
      newErrors.bonusAmount = '0以上の整数で入力してください';
    }
    const bonusAmount = isNaN(bonusAmountRaw) ? 0 : bonusAmountRaw;

    // 臨時返済
    const oneTimeExtras: OneTimeExtra[] = [];
    for (let i = 0; i < form.oneTimeExtras.length; i++) {
      const item = form.oneTimeExtras[i];
      const ym = tryCreateYearMonth(item.yearMonth);
      const amount = parseInt(item.amount, 10);

      if (!ym) {
        newErrors[`oneTimeExtras.${i}.yearMonth`] = 'YYYY-MM形式で入力してください';
      }
      if (isNaN(amount) || amount < 0) {
        newErrors[`oneTimeExtras.${i}.amount`] = '0以上の整数で入力してください';
      }

      if (ym && !isNaN(amount) && amount >= 0) {
        oneTimeExtras.push({ yearMonth: ym, amount });
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      // 最初のエラーフィールドIDを計算
      const fieldOrder = [
        'principal',
        'annualInterestRate',
        'termYears',
        'startYearMonth',
        'monthlyExtra',
        'bonusMonths',
        'bonusAmount',
      ];

      let firstErrorFieldId: string | null = null;

      for (const field of fieldOrder) {
        if (newErrors[field]) {
          firstErrorFieldId = field;
          break;
        }
      }

      if (!firstErrorFieldId) {
        for (let i = 0; i < form.oneTimeExtras.length; i++) {
          if (newErrors[`oneTimeExtras.${i}.yearMonth`]) {
            firstErrorFieldId = `oneTimeExtra-${i}-yearMonth`;
            break;
          }
          if (newErrors[`oneTimeExtras.${i}.amount`]) {
            firstErrorFieldId = `oneTimeExtra-${i}-amount`;
            break;
          }
        }
      }

      return { input: null, firstErrorFieldId };
    }

    return {
      input: {
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
      },
      firstErrorFieldId: null,
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
