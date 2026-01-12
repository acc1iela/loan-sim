import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoanForm } from './LoanForm';

describe('LoanForm', () => {
  it('ローン条件の入力フィールドが表示される', () => {
    render(<LoanForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('借入額（円）')).toBeInTheDocument();
    expect(screen.getByLabelText('年利（%）')).toBeInTheDocument();
    expect(screen.getByLabelText('返済年数')).toBeInTheDocument();
    expect(screen.getByLabelText('開始年月（YYYY-MM）')).toBeInTheDocument();
  });

  it('繰上げ返済の入力フィールドが表示される', () => {
    render(<LoanForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('毎月の追加返済（円）')).toBeInTheDocument();
    expect(screen.getByLabelText('ボーナス月（例: 6,12）')).toBeInTheDocument();
    expect(screen.getByLabelText('ボーナス月上乗せ額（円）')).toBeInTheDocument();
  });

  it('シミュレーション実行ボタンが表示される', () => {
    render(<LoanForm onSubmit={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'シミュレーション実行' })
    ).toBeInTheDocument();
  });

  it('臨時返済の追加ボタンが表示される', () => {
    render(<LoanForm onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: '+ 追加' })).toBeInTheDocument();
  });
});
