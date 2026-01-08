import { describe, it, expect } from 'vitest';
import {
  isValidYearMonthString,
  createYearMonth,
  tryCreateYearMonth,
  fromYearAndMonth,
  getYear,
  getMonth,
  addMonths,
  diffMonths,
  compareYearMonth,
} from './yearMonth';

describe('isValidYearMonthString', () => {
  it('有効な形式を受け入れる', () => {
    expect(isValidYearMonthString('2026-01')).toBe(true);
    expect(isValidYearMonthString('2026-12')).toBe(true);
    expect(isValidYearMonthString('1999-06')).toBe(true);
  });

  it('無効な形式を拒否する', () => {
    expect(isValidYearMonthString('2026-13')).toBe(false); // 13月は無効
    expect(isValidYearMonthString('2026-00')).toBe(false); // 0月は無効
    expect(isValidYearMonthString('2026-1')).toBe(false); // ゼロパディングなし
    expect(isValidYearMonthString('26-01')).toBe(false); // 2桁年
    expect(isValidYearMonthString('2026/01')).toBe(false); // 区切り文字違い
    expect(isValidYearMonthString('')).toBe(false);
    expect(isValidYearMonthString('invalid')).toBe(false);
  });
});

describe('createYearMonth', () => {
  it('有効な形式で YearMonth を作成', () => {
    const ym = createYearMonth('2026-01');
    expect(ym).toBe('2026-01');
  });

  it('無効な形式でエラーをスロー', () => {
    expect(() => createYearMonth('2026-13')).toThrow('Invalid YearMonth format');
    expect(() => createYearMonth('invalid')).toThrow('Invalid YearMonth format');
  });
});

describe('tryCreateYearMonth', () => {
  it('有効な形式で YearMonth を返す', () => {
    expect(tryCreateYearMonth('2026-01')).toBe('2026-01');
  });

  it('無効な形式で null を返す', () => {
    expect(tryCreateYearMonth('2026-13')).toBeNull();
    expect(tryCreateYearMonth('invalid')).toBeNull();
  });
});

describe('fromYearAndMonth', () => {
  it('年と月から YearMonth を作成', () => {
    expect(fromYearAndMonth(2026, 1)).toBe('2026-01');
    expect(fromYearAndMonth(2026, 12)).toBe('2026-12');
  });

  it('月のゼロパディングが正しい', () => {
    expect(fromYearAndMonth(2026, 6)).toBe('2026-06');
  });

  it('無効な月でエラー', () => {
    expect(() => fromYearAndMonth(2026, 0)).toThrow('Invalid month');
    expect(() => fromYearAndMonth(2026, 13)).toThrow('Invalid month');
  });

  it('無効な年でエラー', () => {
    expect(() => fromYearAndMonth(999, 1)).toThrow('Invalid year');
  });
});

describe('getYear / getMonth', () => {
  it('年と月を正しく取得', () => {
    const ym = createYearMonth('2026-06');
    expect(getYear(ym)).toBe(2026);
    expect(getMonth(ym)).toBe(6);
  });
});

describe('addMonths', () => {
  it('月を加算', () => {
    const ym = createYearMonth('2026-06');
    expect(addMonths(ym, 1)).toBe('2026-07');
    expect(addMonths(ym, 6)).toBe('2026-12');
  });

  it('年をまたぐ加算', () => {
    const ym = createYearMonth('2026-11');
    expect(addMonths(ym, 2)).toBe('2027-01');
    expect(addMonths(ym, 14)).toBe('2028-01');
  });

  it('月を減算', () => {
    const ym = createYearMonth('2026-06');
    expect(addMonths(ym, -1)).toBe('2026-05');
    expect(addMonths(ym, -6)).toBe('2025-12');
  });

  it('年をまたぐ減算', () => {
    const ym = createYearMonth('2026-02');
    expect(addMonths(ym, -3)).toBe('2025-11');
  });
});

describe('diffMonths', () => {
  it('同じ年月の差は 0', () => {
    const ym = createYearMonth('2026-06');
    expect(diffMonths(ym, ym)).toBe(0);
  });

  it('同じ年内の差', () => {
    const ym1 = createYearMonth('2026-08');
    const ym2 = createYearMonth('2026-03');
    expect(diffMonths(ym1, ym2)).toBe(5);
    expect(diffMonths(ym2, ym1)).toBe(-5);
  });

  it('年をまたぐ差', () => {
    const ym1 = createYearMonth('2027-02');
    const ym2 = createYearMonth('2026-11');
    expect(diffMonths(ym1, ym2)).toBe(3);
  });
});

describe('compareYearMonth', () => {
  it('比較が正しい', () => {
    const ym1 = createYearMonth('2026-06');
    const ym2 = createYearMonth('2026-08');
    const ym3 = createYearMonth('2026-06');

    expect(compareYearMonth(ym1, ym2)).toBeLessThan(0);
    expect(compareYearMonth(ym2, ym1)).toBeGreaterThan(0);
    expect(compareYearMonth(ym1, ym3)).toBe(0);
  });
});
