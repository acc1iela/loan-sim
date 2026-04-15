import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLoanForm } from './useLoanForm';

// getCurrentYearMonth() の戻り値に依存しないよう、有効な年月を定数で用意
const VALID_YEAR_MONTH = '2026-04';

/** validate() を呼ぶ前に startYearMonth を有効値に設定するヘルパー */
function setValidBase(result: ReturnType<typeof useLoanForm>) {
  act(() => result.updateField('startYearMonth', VALID_YEAR_MONTH));
}

describe('useLoanForm', () => {
  describe('初期状態', () => {
    it('デフォルト値が設定されている', () => {
      const { result } = renderHook(() => useLoanForm());

      expect(result.current.form.principal).toBe('6000000');
      expect(result.current.form.annualInterestRate).toBe('3.0');
      expect(result.current.form.termYears).toBe('7');
      expect(result.current.form.monthlyExtra).toBe('0');
      expect(result.current.form.bonusMonths).toBe('');
      expect(result.current.form.bonusAmount).toBe('0');
      expect(result.current.form.oneTimeExtras).toHaveLength(0);
    });

    it('startYearMonth は現在の年月で初期化される', () => {
      const { result } = renderHook(() => useLoanForm());

      expect(result.current.form.startYearMonth).toMatch(/^\d{4}-\d{2}$/);
    });

    it('エラーは初期状態では空', () => {
      const { result } = renderHook(() => useLoanForm());

      expect(result.current.errors).toEqual({});
    });
  });

  describe('updateField', () => {
    it('フィールドの値が更新される', () => {
      const { result } = renderHook(() => useLoanForm());

      act(() => result.current.updateField('principal', '10000000'));

      expect(result.current.form.principal).toBe('10000000');
    });

    it('更新したフィールドのエラーがクリアされる', () => {
      const { result } = renderHook(() => useLoanForm());

      // エラーを発生させる
      setValidBase(result.current);
      act(() => result.current.updateField('principal', '-1'));
      act(() => { result.current.validate(); });

      expect(result.current.errors.principal).toBeTruthy();

      // 値を修正するとそのフィールドのエラーがクリアされる
      act(() => result.current.updateField('principal', '5000000'));

      expect(result.current.errors.principal).toBe('');
    });

    it('他のフィールドのエラーは影響を受けない', () => {
      const { result } = renderHook(() => useLoanForm());

      act(() => result.current.updateField('principal', '-1'));
      act(() => result.current.updateField('termYears', '0'));
      act(() => { result.current.validate(); });

      // principal を修正しても termYears のエラーは残る
      act(() => result.current.updateField('principal', '5000000'));

      expect(result.current.errors.principal).toBe('');
      expect(result.current.errors.termYears).toBeTruthy();
    });
  });

  describe('臨時返済の操作', () => {
    it('addOneTimeExtra でアイテムが追加される', () => {
      const { result } = renderHook(() => useLoanForm());

      act(() => result.current.addOneTimeExtra());

      expect(result.current.form.oneTimeExtras).toHaveLength(1);
      expect(result.current.form.oneTimeExtras[0].yearMonth).toBe('');
      expect(result.current.form.oneTimeExtras[0].amount).toBe('0');
    });

    it('複数追加できる', () => {
      const { result } = renderHook(() => useLoanForm());

      act(() => { result.current.addOneTimeExtra(); result.current.addOneTimeExtra(); result.current.addOneTimeExtra(); });

      expect(result.current.form.oneTimeExtras).toHaveLength(3);
    });

    it('各アイテムに一意な id が付く', () => {
      const { result } = renderHook(() => useLoanForm());

      act(() => { result.current.addOneTimeExtra(); result.current.addOneTimeExtra(); });

      const ids = result.current.form.oneTimeExtras.map((e) => e.id);
      expect(new Set(ids).size).toBe(2);
    });

    it('updateOneTimeExtra で特定アイテムの年月が更新される', () => {
      const { result } = renderHook(() => useLoanForm());

      act(() => { result.current.addOneTimeExtra(); result.current.addOneTimeExtra(); });
      act(() => result.current.updateOneTimeExtra(0, 'yearMonth', '2026-06'));

      expect(result.current.form.oneTimeExtras[0].yearMonth).toBe('2026-06');
      expect(result.current.form.oneTimeExtras[1].yearMonth).toBe(''); // 他は不変
    });

    it('updateOneTimeExtra で特定アイテムの金額が更新される', () => {
      const { result } = renderHook(() => useLoanForm());

      act(() => result.current.addOneTimeExtra());
      act(() => result.current.updateOneTimeExtra(0, 'amount', '200000'));

      expect(result.current.form.oneTimeExtras[0].amount).toBe('200000');
    });

    it('removeOneTimeExtra で指定インデックスのアイテムが削除される', () => {
      const { result } = renderHook(() => useLoanForm());

      act(() => { result.current.addOneTimeExtra(); result.current.addOneTimeExtra(); });
      const secondId = result.current.form.oneTimeExtras[1].id;

      act(() => result.current.removeOneTimeExtra(0));

      expect(result.current.form.oneTimeExtras).toHaveLength(1);
      expect(result.current.form.oneTimeExtras[0].id).toBe(secondId);
    });
  });

  describe('validate() - 正常系', () => {
    it('デフォルト値（startYearMonth設定済み）で input が返る', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      let validateResult!: ReturnType<typeof result.current.validate>;
      act(() => { validateResult = result.current.validate(); });

      expect(validateResult.input).not.toBeNull();
      expect(validateResult.firstErrorFieldId).toBeNull();
      expect(validateResult.input?.principal).toBe(6000000);
      expect(validateResult.input?.annualInterestRate).toBe(3);
      expect(validateResult.input?.termYears).toBe(7);
    });

    it('年利 0% は有効', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      act(() => result.current.updateField('annualInterestRate', '0'));
      let validateResult!: ReturnType<typeof result.current.validate>;
      act(() => { validateResult = result.current.validate(); });

      expect(validateResult.input?.annualInterestRate).toBe(0);
    });

    it('借入額の上限 5億円は有効', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      act(() => result.current.updateField('principal', '500000000'));
      let validateResult!: ReturnType<typeof result.current.validate>;
      act(() => { validateResult = result.current.validate(); });

      expect(validateResult.input?.principal).toBe(500_000_000);
    });

    it('返済年数の上限 50年は有効', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      act(() => result.current.updateField('termYears', '50'));
      let validateResult!: ReturnType<typeof result.current.validate>;
      act(() => { validateResult = result.current.validate(); });

      expect(validateResult.input?.termYears).toBe(50);
    });

    it('ボーナス月が空の場合 bonusExtra は undefined', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      let validateResult!: ReturnType<typeof result.current.validate>;
      act(() => { validateResult = result.current.validate(); });

      expect(validateResult.input?.prepayment.bonusExtra).toBeUndefined();
    });

    it('ボーナス月あり・金額ありで bonusExtra が設定される', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      act(() => { result.current.updateField('bonusMonths', '6,12'); result.current.updateField('bonusAmount', '50000'); });
      let validateResult!: ReturnType<typeof result.current.validate>;
      act(() => { validateResult = result.current.validate(); });

      expect(validateResult.input?.prepayment.bonusExtra).toEqual({ months: [6, 12], amount: 50000 });
    });

    it('ボーナス月あり・金額 0 の場合 bonusExtra は undefined', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      act(() => { result.current.updateField('bonusMonths', '6'); result.current.updateField('bonusAmount', '0'); });
      let validateResult!: ReturnType<typeof result.current.validate>;
      act(() => { validateResult = result.current.validate(); });

      expect(validateResult.input?.prepayment.bonusExtra).toBeUndefined();
    });

    it('有効な臨時返済が oneTimeExtras に含まれる', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      act(() => result.current.addOneTimeExtra());
      act(() => { result.current.updateOneTimeExtra(0, 'yearMonth', '2026-06'); result.current.updateOneTimeExtra(0, 'amount', '100000'); });
      let validateResult!: ReturnType<typeof result.current.validate>;
      act(() => { validateResult = result.current.validate(); });

      expect(validateResult.input?.prepayment.oneTimeExtras).toHaveLength(1);
      expect(validateResult.input?.prepayment.oneTimeExtras[0].amount).toBe(100000);
    });
  });

  describe('validate() - エラー系', () => {
    it('借入額 0 はエラー', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      act(() => result.current.updateField('principal', '0'));
      act(() => { result.current.validate(); });

      expect(result.current.errors.principal).toBeTruthy();
    });

    it('借入額が 5億円超はエラー', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      act(() => result.current.updateField('principal', '500000001'));
      act(() => { result.current.validate(); });

      expect(result.current.errors.principal).toBeTruthy();
    });

    it('年利が負はエラー', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      act(() => result.current.updateField('annualInterestRate', '-0.1'));
      act(() => { result.current.validate(); });

      expect(result.current.errors.annualInterestRate).toBeTruthy();
    });

    it('年利 100%超はエラー', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      act(() => result.current.updateField('annualInterestRate', '100.1'));
      act(() => { result.current.validate(); });

      expect(result.current.errors.annualInterestRate).toBeTruthy();
    });

    it('返済年数 0 はエラー', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      act(() => result.current.updateField('termYears', '0'));
      act(() => { result.current.validate(); });

      expect(result.current.errors.termYears).toBeTruthy();
    });

    it('返済年数 51年はエラー', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      act(() => result.current.updateField('termYears', '51'));
      act(() => { result.current.validate(); });

      expect(result.current.errors.termYears).toBeTruthy();
    });

    it('開始年月が不正形式はエラー', () => {
      const { result } = renderHook(() => useLoanForm());

      act(() => result.current.updateField('startYearMonth', 'not-a-date'));
      act(() => { result.current.validate(); });

      expect(result.current.errors.startYearMonth).toBeTruthy();
    });

    it('ボーナス月に 13 はエラー', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      act(() => result.current.updateField('bonusMonths', '13'));
      act(() => { result.current.validate(); });

      expect(result.current.errors.bonusMonths).toBeTruthy();
    });

    it('ボーナス月に 0 はエラー', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      act(() => result.current.updateField('bonusMonths', '0'));
      act(() => { result.current.validate(); });

      expect(result.current.errors.bonusMonths).toBeTruthy();
    });

    it('臨時返済の年月が空はエラー', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      act(() => result.current.addOneTimeExtra()); // yearMonth='' のまま
      act(() => { result.current.validate(); });

      expect(result.current.errors['oneTimeExtras.0.yearMonth']).toBeTruthy();
    });
  });

  describe('validate() - firstErrorFieldId の優先順位', () => {
    it('principal エラーが最優先', () => {
      const { result } = renderHook(() => useLoanForm());

      act(() => { result.current.updateField('principal', '0'); result.current.updateField('termYears', '0'); });
      setValidBase(result.current);
      let validateResult!: ReturnType<typeof result.current.validate>;
      act(() => { validateResult = result.current.validate(); });

      expect(validateResult.firstErrorFieldId).toBe('principal');
    });

    it('principal が有効なら annualInterestRate が次', () => {
      const { result } = renderHook(() => useLoanForm());

      act(() => { result.current.updateField('annualInterestRate', '-1'); result.current.updateField('termYears', '0'); });
      setValidBase(result.current);
      let validateResult!: ReturnType<typeof result.current.validate>;
      act(() => { validateResult = result.current.validate(); });

      expect(validateResult.firstErrorFieldId).toBe('annualInterestRate');
    });

    it('通常フィールドのエラーがなければ臨時返済フィールドが返る', () => {
      const { result } = renderHook(() => useLoanForm());

      setValidBase(result.current);
      act(() => result.current.addOneTimeExtra()); // yearMonth='' → エラー
      let validateResult!: ReturnType<typeof result.current.validate>;
      act(() => { validateResult = result.current.validate(); });

      expect(validateResult.firstErrorFieldId).toBe('oneTimeExtra-0-yearMonth');
    });
  });

  describe('localStorage 連携', () => {
    it('フォームの変更が localStorage に保存される', async () => {
      const { result } = renderHook(() => useLoanForm());

      act(() => result.current.updateField('principal', '20000000'));

      // useEffect は非同期で実行されるため少し待つ
      await new Promise((r) => setTimeout(r, 0));

      const saved = JSON.parse(localStorage.getItem('loan-sim-form-v2') ?? '{}');
      expect(saved.principal).toBe('20000000');
    });

    it('localStorage に保存済みの値で初期化される（startYearMonth 以外）', () => {
      localStorage.setItem(
        'loan-sim-form-v2',
        JSON.stringify({
          principal: '99000000',
          annualInterestRate: '1.5',
          termYears: '35',
          startYearMonth: '2020-01', // 古い日付 → 上書きされるはず
          monthlyExtra: '5000',
          bonusMonths: '6',
          bonusAmount: '100000',
          oneTimeExtras: [],
        })
      );

      const { result } = renderHook(() => useLoanForm());

      expect(result.current.form.principal).toBe('99000000');
      expect(result.current.form.annualInterestRate).toBe('1.5');
      expect(result.current.form.termYears).toBe('35');
      expect(result.current.form.monthlyExtra).toBe('5000');
    });

    it('localStorage の startYearMonth は現在の年月で上書きされる', () => {
      localStorage.setItem(
        'loan-sim-form-v2',
        JSON.stringify({
          principal: '10000000',
          annualInterestRate: '2.0',
          termYears: '20',
          startYearMonth: '2020-01',
          monthlyExtra: '0',
          bonusMonths: '',
          bonusAmount: '0',
          oneTimeExtras: [],
        })
      );

      const { result } = renderHook(() => useLoanForm());

      expect(result.current.form.startYearMonth).not.toBe('2020-01');
      expect(result.current.form.startYearMonth).toMatch(/^\d{4}-\d{2}$/);
    });

    it('localStorage のデータが壊れている場合はデフォルト値が使われる', () => {
      localStorage.setItem('loan-sim-form-v2', 'invalid json {{{');

      const { result } = renderHook(() => useLoanForm());

      expect(result.current.form.principal).toBe('6000000');
    });
  });
});
