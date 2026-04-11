import { useState, useMemo } from 'react';
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
  const { totalPages, startIndex, endIndex, currentRows } = useMemo(() => {
    const total = Math.ceil(schedule.length / PAGE_SIZE);
    const start = currentPage * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, schedule.length);
    return { totalPages: total, startIndex: start, endIndex: end, currentRows: schedule.slice(start, end) };
  }, [schedule, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">返済スケジュール</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="返済スケジュール詳細">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700">
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">回</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">年月</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">支払額</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">利息</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">元金</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">繰上げ</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">残高</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row) => (
              <tr
                key={row.monthIndex}
                className={`border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${
                  row.extraPayment > 0 ? 'bg-green-50 dark:bg-green-900/20' : ''
                }`}
              >
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.monthIndex}</td>
                <td className="px-3 py-2 text-gray-900 dark:text-white">{row.yearMonth}</td>
                <td className="px-3 py-2 text-right text-gray-900 dark:text-white">
                  {formatCurrency(row.payment)}
                </td>
                <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">
                  {formatCurrency(row.interest)}
                </td>
                <td className="px-3 py-2 text-right text-gray-900 dark:text-white">
                  {formatCurrency(row.principalPayment)}
                </td>
                <td className="px-3 py-2 text-right text-green-600 dark:text-green-400">
                  {row.extraPayment > 0 ? formatCurrency(row.extraPayment) : '-'}
                </td>
                <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">
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
          className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {startIndex + 1} - {endIndex} / {schedule.length}件
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => goToPage(0)}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label="最初のページへ"
            >
              最初
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label="前のページへ"
            >
              前へ
            </button>
            <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400" aria-current="page">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label="次のページへ"
            >
              次へ
            </button>
            <button
              onClick={() => goToPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
