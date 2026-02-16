import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { ScheduleTable } from './ScheduleTable';
import type { ScheduleRow, YearMonth } from '../domain';

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
    monthIndex: 2,
    yearMonth: '2025-02' as YearMonth,
    payment: 100000,
    interest: 37422,
    principalPayment: 62578,
    extraPayment: 0,
    balance: 29874922,
  },
];

describe('ScheduleTable', () => {
  it('返済スケジュールのタイトルが表示される', () => {
    render(<ScheduleTable schedule={mockSchedule} />);

    expect(screen.getByText('返済スケジュール')).toBeInTheDocument();
  });

  it('テーブルヘッダーが表示される', () => {
    render(<ScheduleTable schedule={mockSchedule} />);

    expect(screen.getByText('回')).toBeInTheDocument();
    expect(screen.getByText('年月')).toBeInTheDocument();
    expect(screen.getByText('支払額')).toBeInTheDocument();
    expect(screen.getByText('利息')).toBeInTheDocument();
    expect(screen.getByText('元金')).toBeInTheDocument();
    expect(screen.getByText('繰上げ')).toBeInTheDocument();
    expect(screen.getByText('残高')).toBeInTheDocument();
  });

  it('スケジュールデータが表示される', () => {
    render(<ScheduleTable schedule={mockSchedule} />);

    expect(screen.getByText('2025-01')).toBeInTheDocument();
    expect(screen.getByText('2025-02')).toBeInTheDocument();
  });

  it('空のスケジュールでもクラッシュしない', () => {
    render(<ScheduleTable schedule={[]} />);

    expect(screen.getByText('返済スケジュール')).toBeInTheDocument();
  });

  it('scheduleが変わるとページが1ページ目にリセットされる', async () => {
    const user = userEvent.setup();

    // 30件のデータを生成（PAGE_SIZE=24なので2ページになる）
    const longSchedule: ScheduleRow[] = Array.from({ length: 30 }, (_, i) => ({
      monthIndex: i + 1,
      yearMonth: `2025-${String((i % 12) + 1).padStart(2, '0')}` as YearMonth,
      payment: 100000,
      interest: 37500 - i * 100,
      principalPayment: 62500 + i * 100,
      extraPayment: 0,
      balance: 30000000 - (i + 1) * 62500,
    }));

    const { rerender } = render(<ScheduleTable schedule={longSchedule} />);

    // 2ページ目に移動
    await user.click(screen.getByRole('button', { name: '次のページへ' }));
    expect(screen.getByText('2 / 2')).toBeInTheDocument();

    // 新しいスケジュールで rerender
    const newSchedule: ScheduleRow[] = Array.from({ length: 30 }, (_, i) => ({
      monthIndex: i + 1,
      yearMonth: `2026-${String((i % 12) + 1).padStart(2, '0')}` as YearMonth,
      payment: 90000,
      interest: 30000 - i * 100,
      principalPayment: 60000 + i * 100,
      extraPayment: 0,
      balance: 25000000 - (i + 1) * 60000,
    }));

    rerender(<ScheduleTable schedule={newSchedule} />);

    // 1ページ目にリセットされている
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });
});
