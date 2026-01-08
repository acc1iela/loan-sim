import { describe, it, expect } from 'vitest';
import { calcSummary, calcSummaryFromSchedule } from './summary';
import { generateSchedule, generateScheduleWithoutPrepayment } from './schedule';
import type { LoanInput } from './types';
import { createYearMonth } from './yearMonth';

/** テスト用の基本入力 */
function createTestInput(): LoanInput {
  return {
    principal: 10000000, // 1000万円
    annualInterestRate: 1.0, // 1%
    termYears: 10,
    startYearMonth: createYearMonth('2026-01'),
    repaymentMethod: 'annuity',
    prepayment: {
      monthlyExtra: 0,
      oneTimeExtras: [],
    },
  };
}

describe('calcSummary', () => {
  describe('繰上げ返済なし', () => {
    it('基本的なサマリーを計算', () => {
      const input = createTestInput();
      const summary = calcSummary(input);

      // 基本返済額（約87,600円）
      expect(summary.baseMonthlyPayment).toBeGreaterThan(87000);
      expect(summary.baseMonthlyPayment).toBeLessThan(88000);

      // 120ヶ月で完済
      expect(summary.payoffMonthCount).toBe(120);
      expect(summary.noPrepaymentPayoffMonthCount).toBe(120);

      // 短縮なし
      expect(summary.reductionMonthCount).toBe(0);
      expect(summary.interestSaved).toBe(0);

      // 総支払額は元金より大きい（利息がある）
      expect(summary.totalPayment).toBeGreaterThan(input.principal);

      // 総利息は正の値
      expect(summary.totalInterest).toBeGreaterThan(0);

      // 総支払額 = 元金 + 総利息
      expect(summary.totalPayment).toBe(input.principal + summary.totalInterest);
    });

    it('金利0%の場合は利息なし', () => {
      const input = createTestInput();
      input.annualInterestRate = 0;

      const summary = calcSummary(input);

      expect(summary.totalInterest).toBe(0);
      expect(summary.totalPayment).toBe(input.principal);
    });
  });

  describe('繰上げ返済あり', () => {
    it('毎月の追加返済で期間短縮・利息軽減', () => {
      const input = createTestInput();
      input.prepayment.monthlyExtra = 10000;

      const summary = calcSummary(input);

      // 期間短縮
      expect(summary.payoffMonthCount).toBeLessThan(120);
      expect(summary.reductionMonthCount).toBeGreaterThan(0);
      expect(summary.reductionMonthCount).toBe(
        summary.noPrepaymentPayoffMonthCount - summary.payoffMonthCount
      );

      // 利息軽減
      expect(summary.interestSaved).toBeGreaterThan(0);
    });

    it('ボーナス月の上乗せで期間短縮・利息軽減', () => {
      const input = createTestInput();
      input.prepayment.bonusExtra = {
        months: [6, 12],
        amount: 100000,
      };

      const summary = calcSummary(input);

      expect(summary.reductionMonthCount).toBeGreaterThan(0);
      expect(summary.interestSaved).toBeGreaterThan(0);
    });

    it('臨時返済で期間短縮・利息軽減', () => {
      const input = createTestInput();
      input.prepayment.oneTimeExtras = [
        { yearMonth: createYearMonth('2027-01'), amount: 1000000 },
      ];

      const summary = calcSummary(input);

      expect(summary.reductionMonthCount).toBeGreaterThan(0);
      expect(summary.interestSaved).toBeGreaterThan(0);
    });

    it('大きな繰上げ返済で大幅な期間短縮', () => {
      const input = createTestInput();
      input.prepayment.monthlyExtra = 100000; // 毎月10万円追加

      const summary = calcSummary(input);

      // 大幅に短縮
      expect(summary.reductionMonthCount).toBeGreaterThan(50);
    });
  });

  describe('整合性チェック', () => {
    it('totalPayment = principal + totalInterest', () => {
      const input = createTestInput();
      input.prepayment.monthlyExtra = 20000;

      const summary = calcSummary(input);

      expect(summary.totalPayment).toBe(input.principal + summary.totalInterest);
    });

    it('reductionMonthCount = noPrepaymentPayoffMonthCount - payoffMonthCount', () => {
      const input = createTestInput();
      input.prepayment.bonusExtra = {
        months: [6],
        amount: 50000,
      };

      const summary = calcSummary(input);

      expect(summary.reductionMonthCount).toBe(
        summary.noPrepaymentPayoffMonthCount - summary.payoffMonthCount
      );
    });
  });
});

describe('calcSummaryFromSchedule', () => {
  it('既存のスケジュールからサマリーを計算', () => {
    const input = createTestInput();
    input.prepayment.monthlyExtra = 10000;

    const schedule = generateSchedule(input);
    const scheduleWithout = generateScheduleWithoutPrepayment(input);

    const summary = calcSummaryFromSchedule(input, schedule, scheduleWithout);
    const summaryDirect = calcSummary(input);

    // 同じ結果になる
    expect(summary.baseMonthlyPayment).toBe(summaryDirect.baseMonthlyPayment);
    expect(summary.payoffMonthCount).toBe(summaryDirect.payoffMonthCount);
    expect(summary.totalPayment).toBe(summaryDirect.totalPayment);
    expect(summary.totalInterest).toBe(summaryDirect.totalInterest);
    expect(summary.reductionMonthCount).toBe(summaryDirect.reductionMonthCount);
    expect(summary.interestSaved).toBe(summaryDirect.interestSaved);
  });
});
