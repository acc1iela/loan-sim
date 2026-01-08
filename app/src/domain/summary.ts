/**
 * サマリー計算
 */

import type { LoanInput, ScheduleRow, Summary } from './types';
import { calcMonthlyPayment } from './annuity';
import { generateSchedule, generateScheduleWithoutPrepayment } from './schedule';

/**
 * スケジュールから総支払額を計算
 */
function calcTotalPayment(schedule: ScheduleRow[]): number {
  return schedule.reduce((sum, row) => sum + row.payment, 0);
}

/**
 * スケジュールから総利息を計算
 */
function calcTotalInterest(schedule: ScheduleRow[]): number {
  return schedule.reduce((sum, row) => sum + row.interest, 0);
}

/**
 * サマリーを計算
 */
export function calcSummary(input: LoanInput): Summary {
  const schedule = generateSchedule(input);
  const scheduleWithout = generateScheduleWithoutPrepayment(input);

  const baseMonthlyPayment = calcMonthlyPayment(
    input.principal,
    input.annualInterestRate,
    input.termYears
  );

  const payoffMonthCount = schedule.length;
  const noPrepaymentPayoffMonthCount = scheduleWithout.length;

  const totalPayment = calcTotalPayment(schedule);
  const totalInterest = calcTotalInterest(schedule);

  const totalInterestWithout = calcTotalInterest(scheduleWithout);

  return {
    baseMonthlyPayment,
    payoffMonthCount,
    totalPayment,
    totalInterest,
    noPrepaymentPayoffMonthCount,
    reductionMonthCount: noPrepaymentPayoffMonthCount - payoffMonthCount,
    interestSaved: totalInterestWithout - totalInterest,
  };
}

/**
 * スケジュールからサマリーを計算（スケジュールが既にある場合）
 */
export function calcSummaryFromSchedule(
  input: LoanInput,
  schedule: ScheduleRow[],
  scheduleWithout: ScheduleRow[]
): Summary {
  const baseMonthlyPayment = calcMonthlyPayment(
    input.principal,
    input.annualInterestRate,
    input.termYears
  );

  return {
    baseMonthlyPayment,
    payoffMonthCount: schedule.length,
    totalPayment: calcTotalPayment(schedule),
    totalInterest: calcTotalInterest(schedule),
    noPrepaymentPayoffMonthCount: scheduleWithout.length,
    reductionMonthCount: scheduleWithout.length - schedule.length,
    interestSaved: calcTotalInterest(scheduleWithout) - calcTotalInterest(schedule),
  };
}
