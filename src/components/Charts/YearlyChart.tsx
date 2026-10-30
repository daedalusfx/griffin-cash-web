import React from 'react';
import { YearlyReportItem } from '../../types/finance.ts';
import { formatCurrency } from '../../utils/persianDate.ts';

interface YearlyChartProps {
  data: YearlyReportItem[];
  currencySymbol?: string;
}

export const YearlyChart: React.FC<YearlyChartProps> = ({ data, currencySymbol = 'تومان' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        اطلاعات سالانه موجود نیست
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1000000);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map(item => {
          const savingsRate = item.income > 0 ? Math.round(((item.income - item.expense) / item.income) * 100) : 0;
          return (
            <div
              key={item.year}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                  عملکرد سال {item.year}
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                    savingsRate >= 0
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                  }`}
                >
                  نرخ پس‌انداز: {savingsRate}%
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">کل درآمدهای واریزی:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                    +{formatCurrency(item.income, currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">مجموع هزینه‌ها و مخارج:</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold tabular-nums">
                    -{formatCurrency(item.expense, currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">تراز نقدینگی خالص سال:</span>
                  <span
                    className={`font-mono font-bold tabular-nums text-sm ${
                      item.net >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {item.net >= 0 ? '+' : ''}{formatCurrency(item.net, currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${Math.min(100, (item.expense / Math.max(1, item.income)) * 100)}%` }}
                    title="سهم هزینه‌ها"
                  />
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${Math.max(0, 100 - (item.expense / Math.max(1, item.income)) * 100)}%` }}
                    title="سهم پس‌انداز"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>سهم مخارج: {Math.round((item.expense / Math.max(1, item.income)) * 100)}%</span>
                  <span>سهم ماندگار: {Math.max(0, 100 - Math.round((item.expense / Math.max(1, item.income)) * 100))}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
