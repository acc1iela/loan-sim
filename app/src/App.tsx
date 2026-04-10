import { useState, useCallback, useEffect, useRef } from 'react';
import type { LoanInput, ScheduleRow, Summary } from './domain';
import {
  generateSchedule,
  generateScheduleWithoutPrepayment,
  calcSummaryFromSchedule,
} from './domain';
import { LoanForm, SummaryCard, ScheduleTable, BalanceChart } from './components';

interface SimulationState {
  input: LoanInput;
  summary: Summary;
  schedule: ScheduleRow[];
  scheduleWithoutPrepayment: ScheduleRow[];
}

function App() {
  const [result, setResult] = useState<SimulationState | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) {
      resultRef.current?.focus();
    }
  }, [result]);

  const handleSubmit = useCallback((input: LoanInput) => {
    try {
      const schedule = generateSchedule(input);
      const hasPrepayment =
        input.prepayment.monthlyExtra > 0 ||
        !!input.prepayment.bonusExtra ||
        input.prepayment.oneTimeExtras.length > 0;
      const scheduleWithoutPrepayment = hasPrepayment
        ? generateScheduleWithoutPrepayment(input)
        : schedule;
      const summary = calcSummaryFromSchedule(input, schedule, scheduleWithoutPrepayment);

      setSimulationError(null);
      setResult({
        input,
        summary,
        schedule,
        scheduleWithoutPrepayment,
      });
    } catch (err) {
      setSimulationError(
        err instanceof Error ? err.message : 'シミュレーション中に予期しないエラーが発生しました'
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">ローン返済シミュレーター</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <LoanForm onSubmit={handleSubmit} />
          </div>

          <div ref={resultRef} tabIndex={-1} className="lg:col-span-2 space-y-6 outline-none">
            {simulationError && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
              >
                <p className="font-medium">エラーが発生しました</p>
                <p className="text-sm mt-1">{simulationError}</p>
              </div>
            )}
            {result ? (
              <>
                <SummaryCard summary={result.summary} principal={result.input.principal} />
                <BalanceChart
                  schedule={result.schedule}
                  scheduleWithoutPrepayment={
                    result.summary.reductionMonthCount > 0
                      ? result.scheduleWithoutPrepayment
                      : undefined
                  }
                />
                <ScheduleTable schedule={result.schedule} />
              </>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                <p>左のフォームに条件を入力して</p>
                <p>「シミュレーション実行」をクリックしてください</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
