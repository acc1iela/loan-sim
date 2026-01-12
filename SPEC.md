# Loan Simulator Spec (MVP)

## Goal

ローン返済と繰上げ返済の効果（短縮期間・利息軽減）を可視化する。
UI は最低限きれいに。

## Scope (MVP)

- 返済方式：元利均等のみ（将来拡張可能な設計にする）
- 繰上げ返済：期間短縮型のみ
- 出力：サマリ（主要指標） + 返済スケジュール表 + 残高推移グラフ（1 本）

## Inputs

- principal: 借入額（円, integer）
- annualInterestRate: 年利（%, number）
- termYears: 返済年数（年, integer）
- repaymentMethod: "annuity"（MVP は固定だが、設計上は拡張可能にする）
- prepayment:
  - monthlyExtra: 毎月の追加返済（円, integer, default 0）
  - bonusExtra:
    - months: ボーナス月（例: [6, 12]）
    - amount: 上乗せ額（円, integer, default 0）
  - oneTimeExtras:
    - list of { yearMonth: "YYYY-MM", amount: integer }（複数可, default []）

## Outputs

### Summary

- baseMonthlyPayment: 元利均等の基本返済額（繰上げ除く）
- payoffMonthCount: 完済までの月数
- totalPayment: 総支払額
- totalInterest: 総利息
- (optional) noPrepaymentPayoffMonthCount: 繰上げなしの完済月数
- reductionMonthCount: 短縮月数（繰上げなしとの差分）
- interestSaved: 利息軽減額（繰上げなしとの差分）

### ScheduleRow (monthly)

- monthIndex: 1..N
- yearMonth: "YYYY-MM"（表示用。開始年月は入力しない場合は「今月」起点でも OK、MVP は monthIndex 表示でも可）
- payment: その月の支払額（円）
- interest: その月の利息（円）
- principalPayment: その月の元金分（円）
- extraPayment: その月の繰上げ（円）
- balance: 支払後残高（円, >= 0）

### Chart

- balance series: (monthIndex or yearMonth) vs balance

## Rules

### Prepayment type

- 期間短縮型：基本返済額は維持し、繰上げ分を元金に充当して完済を早める

### Rounding (must be consistent)

- 金額は円単位。
- 端数処理は統一する（例：利息計算は円未満切り捨て、など）
- MVP の決定案：**利息は円未満切り捨て**、payment / principalPayment / balance は円単位で整合するようにする

### Validation

- principal > 0
- annualInterestRate >= 0
- termYears > 0
- monthlyExtra / bonus amount / oneTime amount >= 0

## Non-goals (MVP ではやらない)

- ログイン、DB 保存、SSR、複数プラン比較、CSV 出力、凝ったデザイン
- 返済額軽減型（将来対応）
- 元金均等（将来対応）
