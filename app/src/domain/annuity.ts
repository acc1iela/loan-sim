/**
 * 元利均等返済の計算
 */

/**
 * 元利均等返済の月額返済額を計算
 *
 * 計算式: M = P * r * (1 + r)^n / ((1 + r)^n - 1)
 * - M = 月額返済額
 * - P = 借入額
 * - r = 月利（年利 / 12 / 100）
 * - n = 返済回数（年数 * 12）
 *
 * @param principal 借入額（円）
 * @param annualInterestRate 年利（%、例: 1.5）
 * @param termYears 返済年数
 * @returns 月額返済額（円、切り上げ）
 */
export function calcMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  termYears: number
): number {
  const n = termYears * 12;

  // 金利0%の場合は単純な均等割
  if (annualInterestRate === 0) {
    return Math.ceil(principal / n);
  }

  const r = annualInterestRate / 100 / 12;
  const rPowN = Math.pow(1 + r, n);

  const monthly = (principal * r * rPowN) / (rPowN - 1);

  // 円未満切り上げ（銀行の一般的な処理）
  return Math.ceil(monthly);
}

/**
 * 月利を計算
 * @param annualInterestRate 年利（%）
 * @returns 月利（小数）
 */
export function calcMonthlyRate(annualInterestRate: number): number {
  return annualInterestRate / 100 / 12;
}

/**
 * その月の利息を計算
 * @param balance 残高（円）
 * @param annualInterestRate 年利（%）
 * @returns 利息（円、切り捨て）
 */
export function calcMonthlyInterest(
  balance: number,
  annualInterestRate: number
): number {
  const monthlyRate = calcMonthlyRate(annualInterestRate);
  // 利息は円未満切り捨て（SPEC.md の決定）
  return Math.floor(balance * monthlyRate);
}
