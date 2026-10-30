import React from 'react';
import {
  Workspace,
  WorkspaceSummary,
  BankAccount,
  Contact,
  Transaction,
  MonthlyReportItem
} from '../types/finance.ts';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Scale,
  HandCoins,
  Landmark,
  CreditCard,
  Plus,
  ChevronLeft,
  ArrowLeftRight
} from 'lucide-react';
import { formatCurrency, formatPersianDate, formatCardNumber } from '../utils/persianDate.ts';
import { CashflowChart } from './Charts/CashflowChart.tsx';

interface DashboardViewProps {
  workspace: Workspace;
  summary: WorkspaceSummary | null;
  accounts: BankAccount[];
  contacts: Contact[];
  transactions: Transaction[];
  monthlyReport: MonthlyReportItem[];
  onOpenNewTransaction: () => void;
  onOpenNewAccount: () => void;
  onOpenNewContact: () => void;
  onSelectTab: (tab: string) => void;
  onSelectContactForStatement: (contact: Contact) => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  workspace,
  summary,
  accounts,
  contacts,
  transactions,
  monthlyReport,
  onOpenNewTransaction,
  onOpenNewAccount,
  onOpenNewContact,
  onSelectTab,
  onSelectContactForStatement,
  onEditTransaction
}) => {
  const currencySymbol = workspace.currency_symbol || 'تومان';

  // Get top receivables & payables
  const debtors = contacts.filter(c => (c.receivable_amount || 0) > 0);
  const creditors = contacts.filter(c => (c.payable_amount || 0) > 0);

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Liquidity */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 col-span-2 sm:col-span-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>کل نقدینگی حساب‌ها</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(summary?.total_balance || 0, currencySymbol)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            مجموع موجودی در {accounts.length} حساب
          </span>
        </div>

        {/* Monthly Income */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>درآمد ماه جاری</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{formatCurrency(summary?.monthly_income || 0, currencySymbol)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">واریز و دریافت‌ها</span>
        </div>

        {/* Monthly Expense */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>مخارج ماه جاری</span>
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
            -{formatCurrency(summary?.monthly_expense || 0, currencySymbol)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">هزینه‌ها و پرداخت‌ها</span>
        </div>

        {/* Net Monthly Cashflow */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>تراز نقدینگی ماه</span>
            <Scale className="w-4 h-4 text-indigo-500" />
          </div>
          <div className={`text-base sm:text-lg font-bold font-mono tabular-nums ${
            (summary?.monthly_net || 0) >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600'
          }`}>
            {(summary?.monthly_net || 0) >= 0 ? '+' : ''}
            {formatCurrency(summary?.monthly_net || 0, currencySymbol)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">خالص ماندگار ماه</span>
        </div>

        {/* Total Receivables (Loans Given) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>طلب‌ها و مطالبات</span>
            <HandCoins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
            {formatCurrency(summary?.total_receivable || 0, currencySymbol)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">قرض‌های داده شده</span>
        </div>

        {/* Total Payables (Debts Taken) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>بدهی‌ها و تعهدات</span>
            <Landmark className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-purple-600 dark:text-purple-400 tabular-nums">
            {formatCurrency(summary?.total_payable || 0, currencySymbol)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">قرض‌های تسویه نشده</span>
        </div>
      </div>

      {/* Main Split: Cashflow Chart & Bank Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Chart (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                روند گردش نقدینگی و مقایسه ماهانه
              </h3>
              <p className="text-xs text-slate-500">
                مقایسه درآمد، مخارج و تراز خالص نقدینگی در ماه‌های اخیر
              </p>
            </div>
            <button
              onClick={() => onSelectTab('reports')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>تحلیل پیشرفته</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <CashflowChart data={monthlyReport} currencySymbol={currencySymbol} />
        </div>

        {/* Bank Accounts Mini Cards (1 Col) */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  حساب‌های بانکی
                </h3>
                <p className="text-xs text-slate-500">
                  {accounts.length} حساب و کارت متصل
                </p>
              </div>
              <button
                onClick={onOpenNewAccount}
                className="p-1.5 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors flex items-center gap-1 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>حساب جدید</span>
              </button>
            </div>

            <div className="space-y-3">
              {accounts.slice(0, 4).map(acc => (
                <div
                  key={acc.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: acc.color }} />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {acc.bank_name}
                      </span>
                      <span className="text-[10px] text-slate-400">· {acc.account_title}</span>
                    </div>
                    {acc.card_number && (
                      <span className="text-[10px] font-mono text-slate-400" dir="ltr">
                        *{acc.card_number.slice(-4)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">موجودی فعلی:</span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatCurrency(acc.current_balance, currencySymbol)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectTab('accounts')}
            className="w-full mt-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors text-center"
          >
            مشاهده و مدیریت تمام حساب‌ها
          </button>
        </div>
      </div>

      {/* Secondary Split: Recent Transactions & Debt/Loan Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Ledger (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                آخرین گردش‌های مالی
              </h3>
              <p className="text-xs text-slate-500">
                ۱۰ تراکنش اخیر ثبت شده در این ورک‌اسپیس
              </p>
            </div>
            <button
              onClick={() => onSelectTab('transactions')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>مشاهده دفتر کل</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.slice(0, 8).map(tx => {
              const isIncome = tx.type === 'income';
              const isExpense = tx.type === 'expense';
              const isLoan = tx.type === 'loan';
              const isDebt = tx.type === 'debt';
              const isTransfer = tx.type === 'transfer';

              return (
                <div
                  key={tx.id}
                  onClick={() => onEditTransaction(tx)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      isIncome ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                      isExpense ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' :
                      isLoan ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                      isDebt ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' :
                      'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                    }`}>
                      {isIncome && <ArrowDownLeft className="w-4 h-4" />}
                      {isExpense && <ArrowUpRight className="w-4 h-4" />}
                      {isLoan && <HandCoins className="w-4 h-4" />}
                      {isDebt && <Landmark className="w-4 h-4" />}
                      {isTransfer && <ArrowLeftRight className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {tx.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{formatPersianDate(tx.transaction_date)}</span>
                        <span>·</span>
                        <span>{tx.category}</span>
                        {tx.bank_account_title && (
                          <>
                            <span>·</span>
                            <span>{tx.bank_name}</span>
                          </>
                        )}
                        {tx.contact_name && (
                          <>
                            <span>·</span>
                            <span className="text-slate-600 dark:text-slate-300 font-medium">{tx.contact_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left font-mono tabular-nums">
                    <div className={`text-xs font-bold ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' :
                      isExpense ? 'text-rose-600 dark:text-rose-400' :
                      isLoan ? 'text-amber-600 dark:text-amber-400' :
                      isDebt ? 'text-purple-600 dark:text-purple-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`}>
                      {isIncome ? '+' : isExpense ? '-' : ''}
                      {formatCurrency(tx.amount, currencySymbol)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {isIncome ? 'واریز' :
                       isExpense ? 'پرداخت' :
                       isLoan ? 'قرض داده شد' :
                       isDebt ? 'قرض گرفته شد' : 'انتقال حساب'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Debt & Loan Overview (1 Col) */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  وضعیت بدهی و مطالبات
                </h3>
                <p className="text-xs text-slate-500">
                  افرادی که بدهکار یا طلبکار هستید
                </p>
              </div>
              <button
                onClick={() => onSelectTab('contacts')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>مخاطبین</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Debtors (They owe you) */}
            <div className="space-y-3 mb-4">
              <span className="text-[11px] font-semibold text-slate-400 block">
                طلبکاریم از (قرض‌های پس‌داده نشده):
              </span>
              {debtors.length === 0 ? (
                <div className="text-xs text-slate-400 py-2">هیچ طلبی از کسی ثبت نشده است</div>
              ) : (
                debtors.map(c => (
                  <div
                    key={c.id}
                    onClick={() => onSelectContactForStatement(c)}
                    className="p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/30 dark:bg-emerald-950/10 flex items-center justify-between cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {c.phone || c.category || 'مخاطب'}
                      </span>
                    </div>
                    <div className="text-left font-mono tabular-nums text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(c.receivable_amount, currencySymbol)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Creditors (You owe them) */}
            <div className="space-y-3">
              <span className="text-[11px] font-semibold text-slate-400 block">
                بدهکاریم به (بدهی‌های جاری):
              </span>
              {creditors.length === 0 ? (
                <div className="text-xs text-slate-400 py-2">هیچ بدهی به کسی ثبت نشده است</div>
              ) : (
                creditors.map(c => (
                  <div
                    key={c.id}
                    onClick={() => onSelectContactForStatement(c)}
                    className="p-2.5 rounded-xl border border-purple-100 dark:border-purple-950/40 bg-purple-50/30 dark:bg-purple-950/10 flex items-center justify-between cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {c.phone || c.category || 'مخاطب'}
                      </span>
                    </div>
                    <div className="text-left font-mono tabular-nums text-xs font-bold text-purple-600 dark:text-purple-400">
                      -{formatCurrency(c.payable_amount, currencySymbol)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={onOpenNewContact}
            className="w-full mt-4 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
          >
            + ثبت مخاطب یا بدهکار/طلبکار جدید
          </button>
        </div>
      </div>
    </div>
  );
};
