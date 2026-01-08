/**
 * 入力バリデーション
 */

import type { LoanInput, ValidationError, ValidationResult } from './types';

/**
 * LoanInput をバリデーション
 */
export function validateLoanInput(input: LoanInput): ValidationResult {
  const errors: ValidationError[] = [];

  // principal
  if (input.principal <= 0) {
    errors.push({
      field: 'principal',
      message: '借入額は0より大きい必要があります',
    });
  }
  if (!Number.isInteger(input.principal)) {
    errors.push({
      field: 'principal',
      message: '借入額は整数で入力してください',
    });
  }

  // annualInterestRate
  if (input.annualInterestRate < 0) {
    errors.push({
      field: 'annualInterestRate',
      message: '年利は0以上で入力してください',
    });
  }

  // termYears
  if (input.termYears <= 0) {
    errors.push({
      field: 'termYears',
      message: '返済年数は0より大きい必要があります',
    });
  }
  if (!Number.isInteger(input.termYears)) {
    errors.push({
      field: 'termYears',
      message: '返済年数は整数で入力してください',
    });
  }

  // prepayment.monthlyExtra
  if (input.prepayment.monthlyExtra < 0) {
    errors.push({
      field: 'prepayment.monthlyExtra',
      message: '毎月の追加返済は0以上で入力してください',
    });
  }

  // prepayment.bonusExtra
  if (input.prepayment.bonusExtra) {
    const { months, amount } = input.prepayment.bonusExtra;

    if (amount < 0) {
      errors.push({
        field: 'prepayment.bonusExtra.amount',
        message: 'ボーナス月の上乗せ額は0以上で入力してください',
      });
    }

    for (const month of months) {
      if (month < 1 || month > 12 || !Number.isInteger(month)) {
        errors.push({
          field: 'prepayment.bonusExtra.months',
          message: `無効なボーナス月: ${month}。1-12の整数で入力してください`,
        });
        break; // 1つエラーがあれば十分
      }
    }
  }

  // prepayment.oneTimeExtras
  for (let i = 0; i < input.prepayment.oneTimeExtras.length; i++) {
    const extra = input.prepayment.oneTimeExtras[i];
    if (extra.amount < 0) {
      errors.push({
        field: `prepayment.oneTimeExtras[${i}].amount`,
        message: '臨時返済額は0以上で入力してください',
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true };
}

/**
 * バリデーションエラーを文字列に変換
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map((e) => `${e.field}: ${e.message}`).join('\n');
}
