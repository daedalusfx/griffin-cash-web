import React, { useState } from 'react';
import {
  MonthlyReportItem,
  YearlyReportItem,
  WeeklyReportItem,
  CategorySummary,
  Workspace
} from '../types/finance.ts';
import { CashflowChart } from './Charts/CashflowChart.tsx';
import { YearlyChart } from './Charts/YearlyChart.tsx';
import { WeeklyChart } from './Charts/WeeklyChart.tsx';
import { CategoryDonutChart } from './Charts/CategoryDonutChart.tsx';
import {
  TrendingUp,
  Calendar,
  PieChart,
  BarChart3,
  CalendarDays,
  ArrowDownLeft,
  ArrowUpRight,
  Scale
} from 'lucide-react';
import { formatCurrency } from '../utils/persianDate.ts';

interface ReportsViewProps {
  workspace: Workspace;
  monthlyReport: MonthlyReportItem[];
  yearlyReport: YearlyReportItem[];
  weeklyReport: WeeklyReportItem[];
  categoriesReport: {
    expenses: CategorySummary[];
    incomes: CategorySummary[];
    total_expense: number;
    total_income: number;
  };
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  workspace,
  monthlyReport,
  yearlyReport,
  weeklyReport,
  categoriesReport
}) => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly' | 'weekly' | 'categories'>('monthly');
  const currencySymbol = workspace.currency_symbol || 'تومان';

  // Calculate high-level highlights
  const totalIncome = monthlyReport.reduce((acc, m) => acc + m.income, 0);
  const totalExpense = monthlyReport.reduce((acc, m) => acc + m.expense, 0);
  const netSavings = totalIncome - totalExpense;
  const overallSavingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>گزارش‌ها و تحلیل وضعیت نقدینگی</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            مقایسه تحلیلی ماهانه و سالانه، گزارش‌های هفتگی و دسته‌بندی دقیق درآمدها و هزینه‌ها
          </p>
        </div>

        {/* Quick overall KPI metric badges */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 block">نرخ پس‌انداز کلی:</span>
            <span className={`font-bold tabular-nums ${overallSavingsRate >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              %{overallSavingsRate}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:border-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 block">تراز خالص دوره‌ها:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {formatCurrency(netSavings, currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Tab Navigation for Reports */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'monthly'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>مقایسه ماهانه نقدینگی</span>
        </button>

        <button
          onClick={() => setActiveTab('yearly')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'yearly'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>مقایسه سالانه نقدینگی</span>
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'weekly'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>گزارش هفتگی مخارج</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'categories'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>تفکیک دقیق دسته‌بندی‌ها</span>
        </button>
      </div>

      {/* Tab 1: Monthly Cashflow Comparison */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                نمودار مقایسه ماهانه نقدینگی، درآمد و مخارج
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                مقایسه ماه به ماه ورودی‌ها، خروجی‌ها و روند تراز خالص نقدینگی
              </p>
            </div>

            <CashflowChart data={monthlyReport} currencySymbol={currencySymbol} />
          </div>

          {/* Monthly Detailed Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                جدول جزئیات عملکرد ماهانه
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] text-slate-500 font-semibold">
                    <th className="py-3 px-4">ماه</th>
                    <th className="py-3 px-4 text-left">واریز و درآمد</th>
                    <th className="py-3 px-4 text-left">هزینه و مخارج</th>
                    <th className="py-3 px-4 text-left">تراز خالص نقدینگی</th>
                    <th className="py-3 px-4 text-left">نقدینگی تجمعی</th>
                    <th className="py-3 px-4 text-center">تعداد تراکنش</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono tabular-nums">
                  {monthlyReport.map(item => (
                    <tr key={item.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {item.key}
                      </td>
                      <td className="py-3 px-4 text-left text-emerald-600 dark:text-emerald-400 font-medium">
                        +{formatCurrency(item.income, currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-left text-rose-600 dark:text-rose-400 font-medium">
                        -{formatCurrency(item.expense, currencySymbol)}
                      </td>
                      <td className={`py-3 px-4 text-left font-bold ${
                        item.net >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600'
                      }`}>
                        {item.net >= 0 ? '+' : ''}{formatCurrency(item.net, currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-left text-slate-700 dark:text-slate-300">
                        {formatCurrency(item.cumulative_balance, currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500">
                        {item.transaction_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Yearly Cashflow Comparison */}
      {activeTab === 'yearly' && (
        <div className="space-y-6">
          <YearlyChart data={yearlyReport} currencySymbol={currencySymbol} />
        </div>
      )}

      {/* Tab 3: Weekly Reports */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          <WeeklyChart weeks={weeklyReport} currencySymbol={currencySymbol} />
        </div>
      )}

      {/* Tab 4: Categories Breakdown */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses by Category */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  تفکیک هزینه‌ها بر اساس دسته‌بندی
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  سهم درصدی و مبالغ پرخرج‌ترین سرفصل‌های زندگی و کسب‌وکار
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(categoriesReport.total_expense, currencySymbol)}
              </span>
            </div>

            <CategoryDonutChart
              categories={categoriesReport.expenses}
              totalAmount={categoriesReport.total_expense}
              currencySymbol={currencySymbol}
              type="expense"
            />
          </div>

          {/* Incomes by Category */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  تفکیک درآمدهای واریزی بر اساس منبع
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  سهم دسته‌بندی‌های حقوق، پاداش، پروژه‌ها و درآمدهای جانبی
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(categoriesReport.total_income, currencySymbol)}
              </span>
            </div>

            <CategoryDonutChart
              categories={categoriesReport.incomes}
              totalAmount={categoriesReport.total_income}
              currencySymbol={currencySymbol}
              type="income"
            />
          </div>
        </div>
      )}
    </div>
  );
};
