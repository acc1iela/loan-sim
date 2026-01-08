import { describe, it, expect } from 'vitest';
import { validateLoanInput, formatValidationErrors } from './validation';
import type { LoanInput } from './types';
import { createYearMonth } from './yearMonth';

/** 有効なデフォルト入力を作成 */
function createValidInput(): LoanInput {
  return {
    principal: 30000000,
    annualInterestRate: 1.5,
    termYears: 35,
    startYearMonth: createYearMonth('2026-01'),
    repaymentMethod: 'annuity',
    prepayment: {
      monthlyExtra: 0,
      oneTimeExtras: [],
    },
  };
}

describe('validateLoanInput', () => {
  it('有効な入力を受け入れる', () => {
    const input = createValidInput();
    const result = validateLoanInput(input);
    expect(result.ok).toBe(true);
  });

  it('繰上げ返済ありでも有効', () => {
    const input = createValidInput();
    input.prepayment.monthlyExtra = 10000;
    input.prepayment.bonusExtra = {
      months: [6, 12],
      amount: 50000,
    };
    input.prepayment.oneTimeExtras = [
      { yearMonth: createYearMonth('2027-06'), amount: 1000000 },
    ];

    const result = validateLoanInput(input);
    expect(result.ok).toBe(true);
  });

  describe('principal', () => {
    it('0以下でエラー', () => {
      const input = createValidInput();
      input.principal = 0;
      const result = validateLoanInput(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.field === 'principal')).toBe(true);
      }
    });

    it('負の値でエラー', () => {
      const input = createValidInput();
      input.principal = -1000000;
      const result = validateLoanInput(input);
      expect(result.ok).toBe(false);
    });

    it('小数でエラー', () => {
      const input = createValidInput();
      input.principal = 30000000.5;
      const result = validateLoanInput(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.message.includes('整数'))).toBe(true);
      }
    });
  });

  describe('annualInterestRate', () => {
    it('0は許可', () => {
      const input = createValidInput();
      input.annualInterestRate = 0;
      const result = validateLoanInput(input);
      expect(result.ok).toBe(true);
    });

    it('負の値でエラー', () => {
      const input = createValidInput();
      input.annualInterestRate = -0.5;
      const result = validateLoanInput(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.field === 'annualInterestRate')).toBe(true);
      }
    });
  });

  describe('termYears', () => {
    it('0以下でエラー', () => {
      const input = createValidInput();
      input.termYears = 0;
      const result = validateLoanInput(input);
      expect(result.ok).toBe(false);
    });

    it('小数でエラー', () => {
      const input = createValidInput();
      input.termYears = 35.5;
      const result = validateLoanInput(input);
      expect(result.ok).toBe(false);
    });
  });

  describe('prepayment.monthlyExtra', () => {
    it('負の値でエラー', () => {
      const input = createValidInput();
      input.prepayment.monthlyExtra = -1000;
      const result = validateLoanInput(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.field === 'prepayment.monthlyExtra')).toBe(true);
      }
    });
  });

  describe('prepayment.bonusExtra', () => {
    it('無効なボーナス月（0）でエラー', () => {
      const input = createValidInput();
      input.prepayment.bonusExtra = {
        months: [0, 6],
        amount: 50000,
      };
      const result = validateLoanInput(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.field === 'prepayment.bonusExtra.months')).toBe(true);
      }
    });

    it('無効なボーナス月（13）でエラー', () => {
      const input = createValidInput();
      input.prepayment.bonusExtra = {
        months: [6, 13],
        amount: 50000,
      };
      const result = validateLoanInput(input);
      expect(result.ok).toBe(false);
    });

    it('負の金額でエラー', () => {
      const input = createValidInput();
      input.prepayment.bonusExtra = {
        months: [6, 12],
        amount: -50000,
      };
      const result = validateLoanInput(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.field === 'prepayment.bonusExtra.amount')).toBe(true);
      }
    });
  });

  describe('prepayment.oneTimeExtras', () => {
    it('負の金額でエラー', () => {
      const input = createValidInput();
      input.prepayment.oneTimeExtras = [
        { yearMonth: createYearMonth('2027-06'), amount: -1000000 },
      ];
      const result = validateLoanInput(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.field.includes('oneTimeExtras'))).toBe(true);
      }
    });
  });

  it('複数のエラーを返す', () => {
    const input = createValidInput();
    input.principal = 0;
    input.termYears = 0;
    input.prepayment.monthlyExtra = -1000;

    const result = validateLoanInput(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('formatValidationErrors', () => {
  it('エラーを文字列に変換', () => {
    const errors = [
      { field: 'principal', message: '借入額は0より大きい必要があります' },
      { field: 'termYears', message: '返済年数は0より大きい必要があります' },
    ];
    const formatted = formatValidationErrors(errors);
    expect(formatted).toContain('principal');
    expect(formatted).toContain('termYears');
    expect(formatted).toContain('借入額');
  });
});
