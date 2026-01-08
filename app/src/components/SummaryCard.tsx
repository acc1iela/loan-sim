import type { Summary } from '../domain';

interface SummaryCardProps {
  summary: Summary;
  principal: number;
}

/** 数値を3桁カンマ区切りでフォーマット */
function formatCurrency(value: number): string {
  return value.toLocaleString('ja-JP');
}

/** 月数を「○年○ヶ月」形式でフォーマット */
function formatMonths(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths}ヶ月`;
  }
  if (remainingMonths === 0) {
    return `${years}年`;
  }
  return `${years}年${remainingMonths}ヶ月`;
}

export function SummaryCard({ summary, principal }: SummaryCardProps) {
  const hasPrepayment = summary.reductionMonthCount > 0 || summary.interestSaved > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">シミュレーション結果</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryItem
          label="毎月の返済額"
          value={`${formatCurrency(summary.baseMonthlyPayment)}円`}
          subtext="基本返済額（繰上げ除く）"
        />

        <SummaryItem
          label="完済までの期間"
          value={formatMonths(summary.payoffMonthCount)}
          subtext={`${summary.payoffMonthCount}ヶ月`}
        />

        <SummaryItem
          label="総支払額"
          value={`${formatCurrency(summary.totalPayment)}円`}
          subtext={`元金: ${formatCurrency(principal)}円`}
        />

        <SummaryItem
          label="総利息"
          value={`${formatCurrency(summary.totalInterest)}円`}
        />

        {hasPrepayment && (
          <>
            <SummaryItem
              label="短縮期間"
              value={formatMonths(summary.reductionMonthCount)}
              subtext={`繰上げなし: ${formatMonths(summary.noPrepaymentPayoffMonthCount)}`}
              highlight
            />

            <SummaryItem
              label="利息軽減額"
              value={`${formatCurrency(summary.interestSaved)}円`}
              highlight
            />
          </>
        )}
      </div>
    </div>
  );
}

interface SummaryItemProps {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}

function SummaryItem({ label, value, subtext, highlight }: SummaryItemProps) {
  return (
    <div
      className={`p-4 rounded-lg ${
        highlight ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
      }`}
    >
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p
        className={`text-xl font-bold ${
          highlight ? 'text-green-700' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  );
}
