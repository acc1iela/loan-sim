/**
 * ドメイン層エクスポート
 */

// 型
export type {
  YearMonth,
  RepaymentMethod,
  BonusExtra,
  OneTimeExtra,
  PrepaymentInput,
  LoanInput,
  ScheduleRow,
  Summary,
  SimulationResult,
  ValidationError,
  ValidationResult,
} from './types';

// YearMonth操作
export {
  isValidYearMonthString,
  createYearMonth,
  tryCreateYearMonth,
  fromYearAndMonth,
  getYear,
  getMonth,
  addMonths,
  diffMonths,
  compareYearMonth,
  getCurrentYearMonth,
} from './yearMonth';

// バリデーション
export { validateLoanInput, formatValidationErrors } from './validation';

// 元利均等計算
export {
  calcMonthlyPayment,
  calcMonthlyRate,
  calcMonthlyInterest,
} from './annuity';

// スケジュール生成
export { generateSchedule, generateScheduleWithoutPrepayment } from './schedule';

// サマリー計算
export { calcSummary, calcSummaryFromSchedule } from './summary';
