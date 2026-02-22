import { useState } from 'react';
import type { ScheduleRow } from '../domain';
import { formatCurrency } from '../utils/format';

interface ScheduleTableProps {
  schedule: ScheduleRow[];
}

const PAGE_SIZE = 24; // 2年分

export function ScheduleTable({ schedule }: ScheduleTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [prevSchedule, setPrevSchedule] = useState(schedule);

  // schedule が変わったらページをリセット（useEffect より先に処理され中間状態が出ない）
  if (prevSchedule !== schedule) {
    setPrevSchedule(schedule);
    setCurrentPage(0);
  }
  const totalPages = Math.ceil(schedule.length / PAGE_SIZE);

  const startIndex = currentPage * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, schedule.length);
  const currentRows = schedule.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">返済スケジュール</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-3 py-2 text-left font-medium text-gray-600">回</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">年月</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">支払額</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">利息</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">元金</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">繰上げ</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">残高</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row) => (
              <tr
                key={row.monthIndex}
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  row.extraPayment > 0 ? 'bg-green-50' : ''
                }`}
              >
                <td className="px-3 py-2 text-gray-600">{row.monthIndex}</td>
                <td className="px-3 py-2 text-gray-900">{row.yearMonth}</td>
                <td className="px-3 py-2 text-right text-gray-900">
                  {formatCurrency(row.payment)}
                </td>
                <td className="px-3 py-2 text-right text-gray-600">
                  {formatCurrency(row.interest)}
                </td>
                <td className="px-3 py-2 text-right text-gray-900">
                  {formatCurrency(row.principalPayment)}
                </td>
                <td className="px-3 py-2 text-right text-green-600">
                  {row.extraPayment > 0 ? formatCurrency(row.extraPayment) : '-'}
                </td>
                <td className="px-3 py-2 text-right font-medium text-gray-900">
                  {formatCurrency(row.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="返済スケジュールのページ送り"
          className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200"
        >
          <p className="text-sm text-gray-600">
            {startIndex + 1} - {endIndex} / {schedule.length}件
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => goToPage(0)}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="最初のページへ"
            >
              最初
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="前のページへ"
            >
              前へ
            </button>
            <span className="px-3 py-1 text-sm text-gray-600" aria-current="page">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="次のページへ"
            >
              次へ
            </button>
            <button
              onClick={() => goToPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="最後のページへ"
            >
              最後
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
