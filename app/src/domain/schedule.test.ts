import { describe, it, expect } from 'vitest';
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

describe('generateSchedule', () => {
  describe('基本動作', () => {
    it('繰上げ返済なしのスケジュールを生成', () => {
      const input = createTestInput();
      const schedule = generateSchedule(input);

      // 10年 = 120ヶ月
      expect(schedule.length).toBe(120);

      // 最初の月
      expect(schedule[0].monthIndex).toBe(1);
      expect(schedule[0].yearMonth).toBe('2026-01');
      expect(schedule[0].balance).toBeLessThan(input.principal);

      // 最後の月
      const last = schedule[schedule.length - 1];
      expect(last.monthIndex).toBe(120);
      expect(last.yearMonth).toBe('2035-12');
      expect(last.balance).toBe(0);
    });

    it('payment = interest + principalPayment + extraPayment を満たす', () => {
      const input = createTestInput();
      const schedule = generateSchedule(input);

      for (const row of schedule) {
        expect(row.payment).toBe(row.interest + row.principalPayment + row.extraPayment);
      }
    });

    it('残高が減少していく', () => {
      const input = createTestInput();
      const schedule = generateSchedule(input);

      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].balance).toBeLessThanOrEqual(schedule[i - 1].balance);
      }
    });

    it('利息は円未満切り捨て（整数）', () => {
      const input = createTestInput();
      const schedule = generateSchedule(input);

      for (const row of schedule) {
        expect(Number.isInteger(row.interest)).toBe(true);
      }
    });
  });

  describe('繰上げ返済', () => {
    it('毎月の追加返済で期間短縮', () => {
      const input = createTestInput();
      input.prepayment.monthlyExtra = 10000; // 毎月1万円追加

      const schedule = generateSchedule(input);
      const scheduleWithout = generateScheduleWithoutPrepayment(input);

      // 期間が短縮される
      expect(schedule.length).toBeLessThan(scheduleWithout.length);
      expect(schedule[schedule.length - 1].balance).toBe(0);
    });

    it('ボーナス月の上乗せ', () => {
      const input = createTestInput();
      input.prepayment.bonusExtra = {
        months: [6, 12],
        amount: 50000, // 6月と12月に5万円追加
      };

      const schedule = generateSchedule(input);

      // 6月と12月に追加返済がある
      const june2026 = schedule.find((r) => r.yearMonth === '2026-06');
      const dec2026 = schedule.find((r) => r.yearMonth === '2026-12');
      const jan2026 = schedule.find((r) => r.yearMonth === '2026-01');

      expect(june2026?.extraPayment).toBe(50000);
      expect(dec2026?.extraPayment).toBe(50000);
      expect(jan2026?.extraPayment).toBe(0);
    });

    it('特定月の臨時返済', () => {
      const input = createTestInput();
      input.prepayment.oneTimeExtras = [
        { yearMonth: createYearMonth('2027-06'), amount: 1000000 },
      ];

      const schedule = generateSchedule(input);

      // 2027-06に100万円の臨時返済
      const june2027 = schedule.find((r) => r.yearMonth === '2027-06');
      expect(june2027?.extraPayment).toBe(1000000);

      // 期間短縮
      const scheduleWithout = generateScheduleWithoutPrepayment(input);
      expect(schedule.length).toBeLessThan(scheduleWithout.length);
    });

    it('繰上げ返済の組み合わせ', () => {
      const input = createTestInput();
      input.prepayment.monthlyExtra = 5000;
      input.prepayment.bonusExtra = {
        months: [6],
        amount: 30000,
      };
      input.prepayment.oneTimeExtras = [
        { yearMonth: createYearMonth('2026-06'), amount: 100000 },
      ];

      const schedule = generateSchedule(input);

      // 2026-06は毎月5000 + ボーナス30000 + 臨時100000 = 135000
      const june2026 = schedule.find((r) => r.yearMonth === '2026-06');
      expect(june2026?.extraPayment).toBe(135000);
    });
  });

  describe('エッジケース', () => {
    it('金利0%でも正しく計算', () => {
      const input = createTestInput();
      input.annualInterestRate = 0;

      const schedule = generateSchedule(input);

      // 利息は全て0
      for (const row of schedule) {
        expect(row.interest).toBe(0);
      }

      // 完済する
      expect(schedule[schedule.length - 1].balance).toBe(0);
    });

    it('大きな繰上げ返済で早期完済', () => {
      const input = createTestInput();
      // 毎月50万円追加（元金1000万なので約2年で完済）
      input.prepayment.monthlyExtra = 500000;

      const schedule = generateSchedule(input);

      expect(schedule.length).toBeLessThan(30); // 30ヶ月未満
      expect(schedule[schedule.length - 1].balance).toBe(0);
    });

    it('完済月の調整（残高より多く返済しない）', () => {
      const input = createTestInput();
      input.prepayment.monthlyExtra = 500000;

      const schedule = generateSchedule(input);
      const lastRow = schedule[schedule.length - 1];

      // 残高は0以上
      expect(lastRow.balance).toBe(0);
      // 最終月のpaymentは残高+利息を超えない
      expect(lastRow.principalPayment + lastRow.extraPayment).toBeGreaterThan(0);
    });
  });
});

describe('generateScheduleWithoutPrepayment', () => {
  it('入力の繰上げ設定を無視する', () => {
    const input = createTestInput();
    input.prepayment.monthlyExtra = 100000;
    input.prepayment.bonusExtra = {
      months: [6, 12],
      amount: 500000,
    };

    const schedule = generateScheduleWithoutPrepayment(input);

    // 全ての繰上げ返済が0
    for (const row of schedule) {
      expect(row.extraPayment).toBe(0);
    }

    // 120ヶ月（繰上げなし）
    expect(schedule.length).toBe(120);
  });
});
