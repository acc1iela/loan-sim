import { useState } from 'react';
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

  const handleSubmit = (input: LoanInput) => {
    const schedule = generateSchedule(input);
    const scheduleWithoutPrepayment = generateScheduleWithoutPrepayment(input);
    const summary = calcSummaryFromSchedule(input, schedule, scheduleWithoutPrepayment);

    setResult({
      input,
      summary,
      schedule,
      scheduleWithoutPrepayment,
    });
  };

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

          <div className="lg:col-span-2 space-y-6">
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
