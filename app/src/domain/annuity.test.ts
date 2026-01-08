import { describe, it, expect } from 'vitest';
import {
  calcMonthlyPayment,
  calcMonthlyRate,
  calcMonthlyInterest,
} from './annuity';

describe('calcMonthlyPayment', () => {
  it('3000万円、年利1.5%、35年の月額返済額', () => {
    // 一般的な住宅ローンの例
    const monthly = calcMonthlyPayment(30000000, 1.5, 35);

    // 期待値: 約91,855円（計算ツールで確認済み）
    // 切り上げで若干上振れる可能性あり
    expect(monthly).toBeGreaterThanOrEqual(91855);
    expect(monthly).toBeLessThanOrEqual(91860);
  });

  it('1000万円、年利1%、10年の月額返済額', () => {
    const monthly = calcMonthlyPayment(10000000, 1.0, 10);

    // 期待値: 約87,600円
    expect(monthly).toBeGreaterThanOrEqual(87600);
    expect(monthly).toBeLessThanOrEqual(87700);
  });

  it('金利0%の場合は単純な均等割', () => {
    const monthly = calcMonthlyPayment(12000000, 0, 10);
    // 12000000 / 120 = 100000
    expect(monthly).toBe(100000);
  });

  it('金利0%で割り切れない場合は切り上げ', () => {
    const monthly = calcMonthlyPayment(10000000, 0, 10);
    // 10000000 / 120 = 83333.333...
    expect(monthly).toBe(83334);
  });

  it('返済額は整数（円単位）', () => {
    const monthly = calcMonthlyPayment(30000000, 1.5, 35);
    expect(Number.isInteger(monthly)).toBe(true);
  });

  it('短期間・高金利でも正しく計算', () => {
    // 100万円、年利5%、1年
    const monthly = calcMonthlyPayment(1000000, 5.0, 1);
    // 期待値: 約85,607円
    expect(monthly).toBeGreaterThanOrEqual(85600);
    expect(monthly).toBeLessThanOrEqual(85700);
  });
});

describe('calcMonthlyRate', () => {
  it('年利1.5%の月利を計算', () => {
    const rate = calcMonthlyRate(1.5);
    expect(rate).toBeCloseTo(0.00125, 6);
  });

  it('年利0%の月利は0', () => {
    const rate = calcMonthlyRate(0);
    expect(rate).toBe(0);
  });

  it('年利12%の月利は1%', () => {
    const rate = calcMonthlyRate(12);
    expect(rate).toBeCloseTo(0.01, 6);
  });
});

describe('calcMonthlyInterest', () => {
  it('残高3000万円、年利1.5%の月利息', () => {
    const interest = calcMonthlyInterest(30000000, 1.5);
    // 30000000 * 0.00125 = 37500
    expect(interest).toBe(37500);
  });

  it('残高1000万円、年利1%の月利息', () => {
    const interest = calcMonthlyInterest(10000000, 1.0);
    // 10000000 * (0.01 / 12) = 8333.333...
    // 切り捨てで 8333
    expect(interest).toBe(8333);
  });

  it('金利0%の場合は利息0', () => {
    const interest = calcMonthlyInterest(30000000, 0);
    expect(interest).toBe(0);
  });

  it('利息は整数（円未満切り捨て）', () => {
    // 端数が出る計算
    const interest = calcMonthlyInterest(12345678, 1.23);
    expect(Number.isInteger(interest)).toBe(true);
  });

  it('残高0なら利息0', () => {
    const interest = calcMonthlyInterest(0, 1.5);
    expect(interest).toBe(0);
  });
});
