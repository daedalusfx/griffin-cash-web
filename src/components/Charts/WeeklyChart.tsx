import React from 'react';
import { WeeklyReportItem } from '../../types/finance.ts';
import { formatCurrency } from '../../utils/persianDate.ts';

interface WeeklyChartProps {
  weeks: WeeklyReportItem[];
  currencySymbol?: string;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ weeks, currencySymbol = 'تومان' }) => {
  if (!weeks || weeks.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        اطلاعات هفتگی موجود نیست
      </div>
    );
  }

  const maxExpense = Math.max(...weeks.map(w => Math.max(w.expense, w.income)), 1000000);

  return (
    <div className="space-y-6">
      {/* 4-Week Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {weeks.map((week, idx) => {
          const isCurrent = idx === weeks.length - 1;
          return (
            <div
              key={week.week_label + idx}
              className={`p-4 rounded-xl border transition-all ${
                isCurrent
                  ? 'border-indigo-500/50 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{week.week_label}</span>
                <span className="text-[11px] font-mono">{week.start_date.slice(5)} تا {week.end_date.slice(5)}</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">درآمد:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{formatCurrency(week.income, currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">مخارج:</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                    -{formatCurrency(week.expense, currencySymbol)}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">میانگین خرج روزانه:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 tabular-nums font-medium">
                    {formatCurrency(week.daily_average, currencySymbol)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Breakdown for Current Week */}
      {weeks[weeks.length - 1] && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              گردش روزانه در هفته جاری
            </h4>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
                هزینه روزانه
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                درآمد روزانه
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weeks[weeks.length - 1].days.map((day, dIdx) => {
              const dayMax = Math.max(
                ...weeks[weeks.length - 1].days.map(d => Math.max(d.expense, d.income)),
                100000
              );
              const expPct = Math.min(100, Math.round((day.expense / dayMax) * 100));
              const incPct = Math.min(100, Math.round((day.income / dayMax) * 100));

              return (
                <div key={dIdx} className="flex flex-col items-center">
                  <div className="h-28 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg p-1.5 flex items-end justify-center gap-1">
                    {/* Expense bar */}
                    <div
                      className="w-3 bg-rose-500 rounded-t-xs transition-all duration-300"
                      style={{ height: `${Math.max(4, expPct)}%` }}
                      title={`هزینه: ${formatCurrency(day.expense, currencySymbol)}`}
                    />
                    {/* Income bar */}
                    {day.income > 0 && (
                      <div
                        className="w-3 bg-emerald-500 rounded-t-xs transition-all duration-300"
                        style={{ height: `${Math.max(4, incPct)}%` }}
                        title={`درآمد: ${formatCurrency(day.income, currencySymbol)}`}
                      />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-2">
                    {day.day_name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {day.date.slice(8)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
