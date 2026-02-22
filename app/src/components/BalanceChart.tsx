import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { ScheduleRow } from '../domain';

interface BalanceChartProps {
  schedule: ScheduleRow[];
  scheduleWithoutPrepayment?: ScheduleRow[];
}

/** 数値を万円単位でフォーマット */
function formatYAxis(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(0)}万`;
  }
  return value.toLocaleString('ja-JP');
}

/** ツールチップ用のフォーマット */
function formatTooltip(value: number): string {
  return `${value.toLocaleString('ja-JP')}円`;
}

export function BalanceChart({ schedule, scheduleWithoutPrepayment }: BalanceChartProps) {
  // チャート用データの準備（年単位でサンプリング）
  const chartData = useMemo(
    () => prepareChartData(schedule, scheduleWithoutPrepayment),
    [schedule, scheduleWithoutPrepayment]
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">残高推移</h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip
              formatter={(value, name) => {
                if (typeof value !== 'number') return null;
                return [formatTooltip(value), name === 'balance' ? '残高' : '繰上げなし'];
              }}
              labelFormatter={(label) => `${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <ReferenceLine y={0} stroke="#9ca3af" />

            {scheduleWithoutPrepayment && (
              <Line
                type="monotone"
                dataKey="balanceWithout"
                name="繰上げなし"
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}

            <Line
              type="monotone"
              dataKey="balance"
              name="残高"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {scheduleWithoutPrepayment && (
        <div className="flex gap-6 mt-4 text-sm justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-600" />
            <span className="text-gray-600">繰上げあり</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gray-400 border-dashed" style={{ borderTopWidth: 2, borderTopStyle: 'dashed' }} />
            <span className="text-gray-600">繰上げなし</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface ChartDataPoint {
  label: string;
  balance: number;
  balanceWithout?: number;
}

function prepareChartData(
  schedule: ScheduleRow[],
  scheduleWithoutPrepayment?: ScheduleRow[]
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];

  // 初期残高を追加
  if (schedule.length > 0) {
    const firstRow = schedule[0];
    data.push({
      label: '開始',
      balance: firstRow.balance + firstRow.principalPayment + firstRow.extraPayment,
      balanceWithout: scheduleWithoutPrepayment
        ? scheduleWithoutPrepayment[0].balance +
          scheduleWithoutPrepayment[0].principalPayment +
          scheduleWithoutPrepayment[0].extraPayment
        : undefined,
    });
  }

  // 12ヶ月ごとにサンプリング（長期ローンでも見やすく）
  const maxLength = Math.max(
    schedule.length,
    scheduleWithoutPrepayment?.length ?? 0
  );

  for (let i = 11; i < maxLength; i += 12) {
    const row = schedule[i];
    const rowWithout = scheduleWithoutPrepayment?.[i];

    const year = Math.floor((i + 1) / 12);

    data.push({
      label: `${year}年`,
      balance: row?.balance ?? 0,
      balanceWithout: rowWithout?.balance,
    });
  }

  // 完済時点を追加（最後の年と重複しない場合）
  const lastRow = schedule[schedule.length - 1];
  if (lastRow && lastRow.balance === 0) {
    const completionYear = Math.ceil(schedule.length / 12);
    const lastDataPoint = data[data.length - 1];

    if (!lastDataPoint || lastDataPoint.label !== `${completionYear}年`) {
      data.push({
        label: `${completionYear}年`,
        balance: 0,
        balanceWithout: scheduleWithoutPrepayment?.[schedule.length - 1]?.balance,
      });
    }
  }

  return data;
}
