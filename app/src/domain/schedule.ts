/**
 * 返済スケジュール生成
 */

import type { LoanInput, ScheduleRow, YearMonth } from './types';
import { calcMonthlyPayment, calcMonthlyInterest } from './annuity';
import { addMonths, getMonth } from './yearMonth';

/**
 * その月の繰上げ返済額を計算
 */
function calcExtraPayment(
  input: LoanInput,
  yearMonth: YearMonth
): number {
  let extra = input.prepayment.monthlyExtra;

  // ボーナス月の上乗せ
  if (input.prepayment.bonusExtra) {
    const month = getMonth(yearMonth);
    if (input.prepayment.bonusExtra.months.includes(month)) {
      extra += input.prepayment.bonusExtra.amount;
    }
  }

  // 特定月の臨時返済
  for (const oneTime of input.prepayment.oneTimeExtras) {
    if (oneTime.yearMonth === yearMonth) {
      extra += oneTime.amount;
    }
  }

  return extra;
}

/**
 * 返済スケジュールを生成
 *
 * 期間短縮型: 基本返済額は維持し、繰上げ分を元金に充当して完済を早める
 *
 * @param input ローン入力
 * @returns 返済スケジュール
 */
export function generateSchedule(input: LoanInput): ScheduleRow[] {
  const schedule: ScheduleRow[] = [];
  const baseMonthlyPayment = calcMonthlyPayment(
    input.principal,
    input.annualInterestRate,
    input.termYears
  );
  const maxMonths = input.termYears * 12;

  let balance = input.principal;
  let monthIndex = 1;

  while (balance > 0 && monthIndex <= maxMonths * 2) {
    // 安全のため上限を設ける
    const yearMonth = addMonths(input.startYearMonth, monthIndex - 1);

    // 利息計算（残高に対して）
    const interest = calcMonthlyInterest(balance, input.annualInterestRate);

    // 繰上げ返済額
    let extraPayment = calcExtraPayment(input, yearMonth);

    // 元金返済額（基本返済額 - 利息）
    let principalPayment = baseMonthlyPayment - interest;

    // 残高が少ない場合の調整
    const totalPrincipalNeeded = balance;
    const totalPrincipalAvailable = principalPayment + extraPayment;

    if (totalPrincipalAvailable >= totalPrincipalNeeded) {
      // 完済月
      principalPayment = Math.min(principalPayment, totalPrincipalNeeded);
      extraPayment = totalPrincipalNeeded - principalPayment;
    }

    // 新残高
    const newBalance = balance - principalPayment - extraPayment;

    // payment = interest + principalPayment + extraPayment（不変条件）
    const payment = interest + principalPayment + extraPayment;

    schedule.push({
      monthIndex,
      yearMonth,
      payment,
      interest,
      principalPayment,
      extraPayment,
      balance: Math.max(0, newBalance), // 浮動小数点誤差対策
    });

    balance = newBalance;
    monthIndex++;

    if (balance <= 0) {
      break;
    }
  }

  return schedule;
}

/**
 * 繰上げ返済なしのスケジュールを生成
 */
export function generateScheduleWithoutPrepayment(
  input: LoanInput
): ScheduleRow[] {
  const noPrepaymentInput: LoanInput = {
    ...input,
    prepayment: {
      monthlyExtra: 0,
      oneTimeExtras: [],
    },
  };
  return generateSchedule(noPrepaymentInput);
}
