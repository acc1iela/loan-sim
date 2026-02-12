import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LoanForm } from './LoanForm';

describe('LoanForm', () => {
  describe('初期表示', () => {
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

    it('初期値が設定されている', () => {
      render(<LoanForm onSubmit={vi.fn()} />);

      expect(screen.getByLabelText('借入額（円）')).toHaveValue(30000000);
      expect(screen.getByLabelText('年利（%）')).toHaveValue(1.5);
      expect(screen.getByLabelText('返済年数')).toHaveValue(35);
    });
  });

  describe('フォーム送信', () => {
    it('有効な入力でonSubmitが呼ばれる', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<LoanForm onSubmit={onSubmit} />);

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          principal: 30000000,
          annualInterestRate: 1.5,
          termYears: 35,
          repaymentMethod: 'annuity',
        })
      );
    });

    it('繰上げ返済の設定が送信データに含まれる', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<LoanForm onSubmit={onSubmit} />);

      const monthlyExtraInput = screen.getByLabelText('毎月の追加返済（円）');
      await user.clear(monthlyExtraInput);
      await user.type(monthlyExtraInput, '10000');

      const bonusMonthsInput = screen.getByLabelText('ボーナス月（例: 6,12）');
      await user.type(bonusMonthsInput, '6,12');

      const bonusAmountInput = screen.getByLabelText('ボーナス月上乗せ額（円）');
      await user.clear(bonusAmountInput);
      await user.type(bonusAmountInput, '50000');

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          prepayment: expect.objectContaining({
            monthlyExtra: 10000,
            bonusExtra: { months: [6, 12], amount: 50000 },
          }),
        })
      );
    });

    it('ボーナス月が空の場合bonusExtraはundefined', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<LoanForm onSubmit={onSubmit} />);

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          prepayment: expect.objectContaining({
            bonusExtra: undefined,
          }),
        })
      );
    });
  });

  describe('バリデーション', () => {
    it('借入額が無効な場合エラーが表示される', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<LoanForm onSubmit={onSubmit} />);

      const principalInput = screen.getByLabelText('借入額（円）');
      await user.clear(principalInput);
      await user.type(principalInput, '-100');

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      expect(screen.getByText('借入額は正の整数で入力してください')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('年利が負の場合エラーが表示される', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<LoanForm onSubmit={onSubmit} />);

      const rateInput = screen.getByLabelText('年利（%）');
      await user.clear(rateInput);
      await user.type(rateInput, '-1');

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      expect(screen.getByText('年利は0以上の数値で入力してください')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('返済年数が無効な場合エラーが表示される', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<LoanForm onSubmit={onSubmit} />);

      const termInput = screen.getByLabelText('返済年数');
      await user.clear(termInput);
      await user.type(termInput, '0');

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      expect(screen.getByText('返済年数は正の整数で入力してください')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('ボーナス月が不正な場合エラーが表示される', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<LoanForm onSubmit={onSubmit} />);

      const bonusMonthsInput = screen.getByLabelText('ボーナス月（例: 6,12）');
      await user.type(bonusMonthsInput, '13');

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      expect(screen.getByText('1-12の数値をカンマ区切りで入力してください')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('入力を修正するとエラーがクリアされる', async () => {
      const user = userEvent.setup();
      render(<LoanForm onSubmit={vi.fn()} />);

      const principalInput = screen.getByLabelText('借入額（円）');
      await user.clear(principalInput);
      await user.type(principalInput, '-100');

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      expect(screen.getByText('借入額は正の整数で入力してください')).toBeInTheDocument();

      // 値を修正
      await user.clear(principalInput);
      await user.type(principalInput, '1000000');

      // エラーがクリアされている
      expect(screen.queryByText('借入額は正の整数で入力してください')).not.toBeInTheDocument();
    });
  });

  describe('臨時返済の追加・削除', () => {
    it('追加ボタンで臨時返済フィールドが追加される', async () => {
      const user = userEvent.setup();
      render(<LoanForm onSubmit={vi.fn()} />);

      const addButton = screen.getByRole('button', { name: '+ 追加' });
      await user.click(addButton);

      // 入力フィールドが2つ追加される（年月と金額）
      const monthInputs = screen.getAllByPlaceholderText('YYYY-MM');
      const amountInputs = screen.getAllByPlaceholderText('金額');

      expect(monthInputs).toHaveLength(1);
      expect(amountInputs).toHaveLength(1);
    });

    it('複数の臨時返済を追加できる', async () => {
      const user = userEvent.setup();
      render(<LoanForm onSubmit={vi.fn()} />);

      const addButton = screen.getByRole('button', { name: '+ 追加' });
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);

      const monthInputs = screen.getAllByPlaceholderText('YYYY-MM');
      expect(monthInputs).toHaveLength(3);
    });

    it('削除ボタンで臨時返済フィールドが削除される', async () => {
      const user = userEvent.setup();
      render(<LoanForm onSubmit={vi.fn()} />);

      // 2つ追加
      const addButton = screen.getByRole('button', { name: '+ 追加' });
      await user.click(addButton);
      await user.click(addButton);

      expect(screen.getAllByPlaceholderText('YYYY-MM')).toHaveLength(2);

      // 1つ削除（aria-labelは「臨時返済1を削除」のように動的）
      const deleteButton = screen.getByRole('button', { name: '臨時返済1を削除' });
      await user.click(deleteButton);

      expect(screen.getAllByPlaceholderText('YYYY-MM')).toHaveLength(1);
    });

    it('臨時返済が送信データに含まれる', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<LoanForm onSubmit={onSubmit} />);

      // 臨時返済を追加
      await user.click(screen.getByRole('button', { name: '+ 追加' }));

      const yearMonthInput = screen.getByPlaceholderText('YYYY-MM');
      const amountInput = screen.getByPlaceholderText('金額');

      await user.type(yearMonthInput, '2025-06');
      await user.clear(amountInput);
      await user.type(amountInput, '100000');

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          prepayment: expect.objectContaining({
            oneTimeExtras: [{ yearMonth: '2025-06', amount: 100000 }],
          }),
        })
      );
    });

    it('臨時返済の年月が不正な場合エラーが表示される', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<LoanForm onSubmit={onSubmit} />);

      await user.click(screen.getByRole('button', { name: '+ 追加' }));

      // 年月を空のまま送信
      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      expect(screen.getByText('YYYY-MM形式で入力してください')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('自動フォーカス', () => {
    it('バリデーションエラー時に最初のエラーフィールドにフォーカスする', async () => {
      const user = userEvent.setup();
      render(<LoanForm onSubmit={vi.fn()} />);

      // 借入額を無効な値に
      const principalInput = screen.getByLabelText('借入額（円）');
      await user.clear(principalInput);
      await user.type(principalInput, '-100');

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      // 借入額フィールドにフォーカスが当たっている
      expect(principalInput).toHaveFocus();
    });

    it('複数エラーがある場合、最初のエラーフィールドにフォーカスする', async () => {
      const user = userEvent.setup();
      render(<LoanForm onSubmit={vi.fn()} />);

      // 借入額と年利を両方無効に
      const principalInput = screen.getByLabelText('借入額（円）');
      const rateInput = screen.getByLabelText('年利（%）');

      await user.clear(principalInput);
      await user.type(principalInput, '-100');
      await user.clear(rateInput);
      await user.type(rateInput, '-1');

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      // 最初のエラーフィールド（借入額）にフォーカス
      expect(principalInput).toHaveFocus();
    });

    it('臨時返済のエラー時にそのフィールドにフォーカスする', async () => {
      const user = userEvent.setup();
      render(<LoanForm onSubmit={vi.fn()} />);

      // 臨時返済を追加（年月を空のまま）
      await user.click(screen.getByRole('button', { name: '+ 追加' }));

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      // 臨時返済の年月フィールドにフォーカス
      const yearMonthInput = screen.getByLabelText('臨時返済1の年月');
      expect(yearMonthInput).toHaveFocus();
    });
  });
});
