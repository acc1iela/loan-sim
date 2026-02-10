import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App 統合テスト', () => {
  describe('初期表示', () => {
    it('ヘッダーが表示される', () => {
      render(<App />);

      expect(
        screen.getByRole('heading', { name: 'ローン返済シミュレーター' })
      ).toBeInTheDocument();
    });

    it('フォームが表示される', () => {
      render(<App />);

      expect(screen.getByLabelText('借入額（円）')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'シミュレーション実行' })
      ).toBeInTheDocument();
    });

    it('シミュレーション結果がない状態のメッセージが表示される', () => {
      render(<App />);

      expect(
        screen.getByText('左のフォームに条件を入力して')
      ).toBeInTheDocument();
      expect(
        screen.getByText('「シミュレーション実行」をクリックしてください')
      ).toBeInTheDocument();
    });

    it('結果コンポーネントは表示されない', () => {
      render(<App />);

      expect(screen.queryByText('シミュレーション結果')).not.toBeInTheDocument();
      expect(screen.queryByText('残高推移')).not.toBeInTheDocument();
      expect(screen.queryByText('返済スケジュール')).not.toBeInTheDocument();
    });
  });

  describe('シミュレーション実行', () => {
    it('デフォルト値でシミュレーションを実行すると結果が表示される', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      // 結果セクションが表示される
      expect(screen.getByText('シミュレーション結果')).toBeInTheDocument();
      expect(screen.getByText('残高推移')).toBeInTheDocument();
      expect(screen.getByText('返済スケジュール')).toBeInTheDocument();

      // プレースホルダーが消える
      expect(
        screen.queryByText('左のフォームに条件を入力して')
      ).not.toBeInTheDocument();
    });

    it('SummaryCard に計算結果が表示される', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      // デフォルト値（3000万、1.5%、35年）での結果
      expect(screen.getByText('毎月の返済額')).toBeInTheDocument();
      expect(screen.getByText('完済までの期間')).toBeInTheDocument();
      expect(screen.getByText('総支払額')).toBeInTheDocument();
      expect(screen.getByText('総利息')).toBeInTheDocument();

      // 35年 = 420ヶ月
      expect(screen.getByText('35年')).toBeInTheDocument();
      expect(screen.getByText('420ヶ月')).toBeInTheDocument();
    });

    it('ScheduleTable に返済スケジュールが表示される', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      // テーブルヘッダーが表示される
      const table = screen.getByRole('table');
      expect(within(table).getByText('回')).toBeInTheDocument();
      expect(within(table).getByText('年月')).toBeInTheDocument();
      expect(within(table).getByText('支払額')).toBeInTheDocument();
      expect(within(table).getByText('残高')).toBeInTheDocument();

      // 最初の行が表示される（月インデックス1）
      expect(within(table).getByText('1')).toBeInTheDocument();
    });

    it('繰上げ返済ありの場合、短縮期間と利息軽減額が表示される', async () => {
      const user = userEvent.setup();
      render(<App />);

      // 毎月1万円の繰上げ返済を設定
      const monthlyExtraInput = screen.getByLabelText('毎月の追加返済（円）');
      await user.clear(monthlyExtraInput);
      await user.type(monthlyExtraInput, '10000');

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      // 繰上げ返済の効果が表示される
      expect(screen.getByText('短縮期間')).toBeInTheDocument();
      expect(screen.getByText('利息軽減額')).toBeInTheDocument();
    });

    it('繰上げ返済なしの場合、短縮期間と利息軽減額は表示されない', async () => {
      const user = userEvent.setup();
      render(<App />);

      // デフォルトは繰上げ返済なし（0円）
      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      // 繰上げ効果は表示されない
      expect(screen.queryByText('短縮期間')).not.toBeInTheDocument();
      expect(screen.queryByText('利息軽減額')).not.toBeInTheDocument();
    });
  });

  describe('入力値の変更', () => {
    it('借入額を変更するとシミュレーション結果に反映される', async () => {
      const user = userEvent.setup();
      render(<App />);

      // 借入額を1000万に変更
      const principalInput = screen.getByLabelText('借入額（円）');
      await user.clear(principalInput);
      await user.type(principalInput, '10000000');

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      // 元金が表示される
      expect(screen.getByText('元金: 10,000,000円')).toBeInTheDocument();
    });

    it('返済年数を変更すると完済期間に反映される', async () => {
      const user = userEvent.setup();
      render(<App />);

      // 返済年数を10年に変更
      const termInput = screen.getByLabelText('返済年数');
      await user.clear(termInput);
      await user.type(termInput, '10');

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      // 10年 = 120ヶ月
      expect(screen.getByText('10年')).toBeInTheDocument();
      expect(screen.getByText('120ヶ月')).toBeInTheDocument();
    });
  });

  describe('フォーム → 結果の連携', () => {
    it('複数回シミュレーションを実行すると結果が更新される', async () => {
      const user = userEvent.setup();
      render(<App />);

      // 1回目: デフォルト値
      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));
      expect(screen.getByText('35年')).toBeInTheDocument();

      // 2回目: 返済年数を変更
      const termInput = screen.getByLabelText('返済年数');
      await user.clear(termInput);
      await user.type(termInput, '20');

      await user.click(screen.getByRole('button', { name: 'シミュレーション実行' }));

      // 結果が更新される
      expect(screen.getByText('20年')).toBeInTheDocument();
      expect(screen.queryByText('35年')).not.toBeInTheDocument();
    });
  });
});
