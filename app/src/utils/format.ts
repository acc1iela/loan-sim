/**
 * 数値を3桁カンマ区切りでフォーマット
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('ja-JP');
}
