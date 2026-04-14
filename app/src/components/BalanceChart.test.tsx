import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { BalanceChart } from './BalanceChart';
import type { ScheduleRow, YearMonth } from '../domain';

// RechartsはResizeObserverを使うので、テスト環境用にスタブする
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
});

const mockSchedule: ScheduleRow[] = [
  {
    monthIndex: 1,
    yearMonth: '2025-01' as YearMonth,
    payment: 100000,
    interest: 37500,
    principalPayment: 62500,
    extraPayment: 0,
    balance: 29937500,
  },
  {
    monthIndex: 12,
    yearMonth: '2025-12' as YearMonth,
    payment: 100000,
    interest: 35000,
    principalPayment: 65000,
    extraPayment: 0,
    balance: 29200000,
  },
];

describe('BalanceChart', () => {
  it('残高推移のタイトルが表示される', () => {
    render(<BalanceChart schedule={mockSchedule} />);

    expect(screen.getByText('残高推移')).toBeInTheDocument();
  });

  it('繰上げ比較データがある場合、凡例が表示される', () => {
    render(
      <BalanceChart
        schedule={mockSchedule}
        scheduleWithoutPrepayment={mockSchedule}
      />
    );

    expect(screen.getByText('繰上げあり')).toBeInTheDocument();
    expect(screen.getByText('繰上げなし')).toBeInTheDocument();
  });

  it('空のスケジュールでもクラッシュしない', () => {
    render(<BalanceChart schedule={[]} />);

    expect(screen.getByText('残高推移')).toBeInTheDocument();
  });
});
