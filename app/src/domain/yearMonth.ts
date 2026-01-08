/**
 * YearMonth 型のファクトリ関数とユーティリティ
 */

import type { YearMonth } from './types';

const YEAR_MONTH_REGEX = /^(\d{4})-(0[1-9]|1[0-2])$/;

/**
 * 文字列が有効な YearMonth 形式かチェック
 */
export function isValidYearMonthString(value: string): boolean {
  return YEAR_MONTH_REGEX.test(value);
}

/**
 * YearMonth を作成（バリデーション付き）
 * @throws 不正な形式の場合
 */
export function createYearMonth(value: string): YearMonth {
  if (!isValidYearMonthString(value)) {
    throw new Error(`Invalid YearMonth format: "${value}". Expected "YYYY-MM".`);
  }
  return value as YearMonth;
}

/**
 * YearMonth を安全に作成（失敗時は null）
 */
export function tryCreateYearMonth(value: string): YearMonth | null {
  if (!isValidYearMonthString(value)) {
    return null;
  }
  return value as YearMonth;
}

/**
 * 年と月から YearMonth を作成
 */
export function fromYearAndMonth(year: number, month: number): YearMonth {
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}. Must be 1-12.`);
  }
  if (year < 1000 || year > 9999) {
    throw new Error(`Invalid year: ${year}. Must be 1000-9999.`);
  }
  const value = `${year}-${String(month).padStart(2, '0')}`;
  return value as YearMonth;
}

/**
 * YearMonth から年を取得
 */
export function getYear(ym: YearMonth): number {
  return parseInt(ym.slice(0, 4), 10);
}

/**
 * YearMonth から月を取得（1-12）
 */
export function getMonth(ym: YearMonth): number {
  return parseInt(ym.slice(5, 7), 10);
}

/**
 * YearMonth に月数を加算
 */
export function addMonths(ym: YearMonth, months: number): YearMonth {
  let year = getYear(ym);
  let month = getMonth(ym) + months;

  // 月のオーバーフロー/アンダーフローを処理
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  while (month < 1) {
    month += 12;
    year -= 1;
  }

  return fromYearAndMonth(year, month);
}

/**
 * 2つの YearMonth の差（月数）を計算
 * @returns ym1 - ym2 の月数
 */
export function diffMonths(ym1: YearMonth, ym2: YearMonth): number {
  const year1 = getYear(ym1);
  const month1 = getMonth(ym1);
  const year2 = getYear(ym2);
  const month2 = getMonth(ym2);

  return (year1 - year2) * 12 + (month1 - month2);
}

/**
 * YearMonth を比較
 * @returns ym1 < ym2 なら負、ym1 > ym2 なら正、等しければ 0
 */
export function compareYearMonth(ym1: YearMonth, ym2: YearMonth): number {
  return diffMonths(ym1, ym2);
}

/**
 * 現在の年月を取得
 */
export function getCurrentYearMonth(): YearMonth {
  const now = new Date();
  return fromYearAndMonth(now.getFullYear(), now.getMonth() + 1);
}
