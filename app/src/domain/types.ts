/**
 * ローンシミュレーター 型定義
 */

// ===== Branded Types =====

/**
 * 年月を表す branded type ("YYYY-MM" 形式)
 * 作成には yearMonth.ts の createYearMonth() を使用すること
 */
export type YearMonth = string & { readonly __brand: 'YearMonth' };

// ===== 入力型 =====

/** 返済方式 */
export type RepaymentMethod = 'annuity'; // 将来: | 'principalEqual'

/** ボーナス月の繰上げ返済設定 */
export interface BonusExtra {
  /** ボーナス月（1-12、毎年適用） */
  months: number[];
  /** 上乗せ額（円） */
  amount: number;
}

/** 特定月の臨時繰上げ返済 */
export interface OneTimeExtra {
  /** 対象年月 */
  yearMonth: YearMonth;
  /** 額（円） */
  amount: number;
}

/** 繰上げ返済設定 */
export interface PrepaymentInput {
  /** 毎月の追加返済（円） */
  monthlyExtra: number;
  /** ボーナス月の上乗せ（任意） */
  bonusExtra?: BonusExtra;
  /** 特定月の臨時返済（複数可） */
  oneTimeExtras: OneTimeExtra[];
}

/** ローン入力 */
export interface LoanInput {
  /** 借入額（円） */
  principal: number;
  /** 年利（%、例: 1.5） */
  annualInterestRate: number;
  /** 返済年数 */
  termYears: number;
  /** 開始年月 */
  startYearMonth: YearMonth;
  /** 返済方式 */
  repaymentMethod: RepaymentMethod;
  /** 繰上げ返済設定 */
  prepayment: PrepaymentInput;
}

// ===== 出力型 =====

/**
 * 返済スケジュールの1行
 *
 * 不変条件: payment === interest + principalPayment + extraPayment
 */
export interface ScheduleRow {
  /** 月インデックス（1から開始） */
  monthIndex: number;
  /** 年月 */
  yearMonth: YearMonth;
  /**
   * その月の総支払額（円）
   * = interest + principalPayment + extraPayment
   */
  payment: number;
  /** 利息分（円） */
  interest: number;
  /** 元金分（円） */
  principalPayment: number;
  /** 繰上げ返済額（円） */
  extraPayment: number;
  /** 支払後残高（円） */
  balance: number;
}

/** サマリー */
export interface Summary {
  /** 元利均等の基本返済額（繰上げ除く） */
  baseMonthlyPayment: number;
  /** 完済までの月数 */
  payoffMonthCount: number;
  /** 総支払額 */
  totalPayment: number;
  /** 総利息 */
  totalInterest: number;
  /** 繰上げなしの完済月数 */
  noPrepaymentPayoffMonthCount: number;
  /** 短縮月数（繰上げなしとの差分） */
  reductionMonthCount: number;
  /** 利息軽減額（繰上げなしとの差分） */
  interestSaved: number;
}

// ===== シミュレーション結果 =====

/** シミュレーション結果 */
export interface SimulationResult {
  summary: Summary;
  schedule: ScheduleRow[];
}

// ===== バリデーション =====

/** バリデーションエラー */
export interface ValidationError {
  field: string;
  message: string;
}

/** バリデーション結果 */
export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: ValidationError[] };
