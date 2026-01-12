import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SummaryCard } from './SummaryCard';
import type { Summary } from '../domain';

const mockSummary: Summary = {
  baseMonthlyPayment: 91855,
  payoffMonthCount: 360,
  totalPayment: 33067800,
  totalInterest: 3067800,
  noPrepaymentPayoffMonthCount: 420,
  reductionMonthCount: 60,
  interestSaved: 500000,
};

describe('SummaryCard', () => {
  it('シミュレーション結果のタイトルが表示される', () => {
    render(<SummaryCard summary={mockSummary} principal={30000000} />);

    expect(screen.getByText('シミュレーション結果')).toBeInTheDocument();
  });

  it('毎月の返済額が表示される', () => {
    render(<SummaryCard summary={mockSummary} principal={30000000} />);

    expect(screen.getByText('毎月の返済額')).toBeInTheDocument();
    expect(screen.getByText('91,855円')).toBeInTheDocument();
  });

  it('完済までの期間が表示される', () => {
    render(<SummaryCard summary={mockSummary} principal={30000000} />);

    expect(screen.getByText('完済までの期間')).toBeInTheDocument();
    expect(screen.getByText('30年')).toBeInTheDocument();
  });

  it('総支払額と総利息が表示される', () => {
    render(<SummaryCard summary={mockSummary} principal={30000000} />);

    expect(screen.getByText('総支払額')).toBeInTheDocument();
    expect(screen.getByText('総利息')).toBeInTheDocument();
  });

  it('繰上げ返済効果（短縮期間・利息軽減）が表示される', () => {
    render(<SummaryCard summary={mockSummary} principal={30000000} />);

    expect(screen.getByText('短縮期間')).toBeInTheDocument();
    expect(screen.getByText('利息軽減額')).toBeInTheDocument();
  });
});
