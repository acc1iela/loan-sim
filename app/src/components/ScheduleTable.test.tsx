import { render, screen } from '@testing-library/react';
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
});
