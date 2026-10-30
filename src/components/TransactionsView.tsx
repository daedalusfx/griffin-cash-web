import React, { useState, useMemo } from 'react';
import { Transaction, BankAccount, Contact, TransactionType } from '../types/finance.ts';
import {
  Search,
  Filter,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  Landmark,
  ArrowLeftRight,
  Trash2,
  Edit2,
  FileText
} from 'lucide-react';
import { formatCurrency, formatPersianDate } from '../utils/persianDate.ts';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  contacts: Contact[];
  currencySymbol?: string;
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => Promise<void>;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  contacts,
  currencySymbol = 'تومان',
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter client-side
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (selectedType !== 'all' && tx.type !== selectedType) return false;
      if (selectedAccount !== 'all' && tx.bank_account_id !== selectedAccount && tx.destination_account_id !== selectedAccount) return false;
      if (selectedContact !== 'all' && tx.contact_id !== selectedContact) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const inTitle = tx.title.toLowerCase().includes(q);
        const inCat = tx.category.toLowerCase().includes(q);
        const inNotes = (tx.notes || '').toLowerCase().includes(q);
        const inCode = (tx.tracking_code || '').toLowerCase().includes(q);
        const inContact = (tx.contact_name || '').toLowerCase().includes(q);
        if (!inTitle && !inCat && !inNotes && !inCode && !inContact) return false;
      }
      return true;
    });
  }, [transactions, selectedType, selectedAccount, selectedContact, search]);

  const handleDelete = async (id: string) => {
    if (window.confirm('آیا از حذف این تراکنش اطمینان دارید؟')) {
      try {
        setDeletingId(id);
        await onDeleteTransaction(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const types = [
    { id: 'all', label: 'همه تراکنش‌ها' },
    { id: 'expense', label: 'پرداخت / هزینه' },
    { id: 'income', label: 'واریز / دریافت' },
    { id: 'loan', label: 'قرض دادم (طلب)' },
    { id: 'debt', label: 'قرض گرفتم (بدهی)' },
    { id: 'transfer', label: 'انتقال حساب' },
  ];

  return (
    <div className="space-y-4">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            دفتر کل و ریز گردش مالی
          </h2>
          <p className="text-xs text-slate-500">
            نمایش، جستجو و فیلتر تمام تراکنش‌های ثبت‌شده در این فضای کاری
          </p>
        </div>

        <button
          onClick={onOpenNewTransaction}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت تراکنش جدید</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        {/* Type pills filter (Interactive controls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {types.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedType === t.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Input filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="جستجو در عنوان، دسته‌بندی، کد پیگیری..."
              className="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <select
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
            >
              <option value="all">تمام حساب‌های بانکی</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.bank_name} - {acc.account_title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedContact}
              onChange={e => setSelectedContact(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
            >
              <option value="all">تمام مخاطبین و فروشگاه‌ها</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === 'merchant' ? 'فروشگاه' : 'شخص'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">تراکنشی یافت نشد</h3>
            <p className="text-xs text-slate-400 mt-1">با معیارهای جستجوی فعلی یا فیلترهای بالا موردی وجود ندارد</p>
            <button
              onClick={onOpenNewTransaction}
              className="mt-4 px-4 py-2 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              ثبت اولین تراکنش
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] text-slate-500 font-semibold">
                  <th className="py-3 px-4">نوع</th>
                  <th className="py-3 px-4">عنوان و شرح</th>
                  <th className="py-3 px-4">دسته‌بندی</th>
                  <th className="py-3 px-4">حساب بانکی</th>
                  <th className="py-3 px-4">مخاطب / طرف‌حساب</th>
                  <th className="py-3 px-4">تاریخ</th>
                  <th className="py-3 px-4 text-left">مبلغ ({currencySymbol})</th>
                  <th className="py-3 px-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filtered.map(tx => {
                  const isIncome = tx.type === 'income';
                  const isExpense = tx.type === 'expense';
                  const isLoan = tx.type === 'loan';
                  const isDebt = tx.type === 'debt';
                  const isTransfer = tx.type === 'transfer';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Type icon & label */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`p-1.5 rounded-lg ${
                            isIncome ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' :
                            isExpense ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40' :
                            isLoan ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40' :
                            isDebt ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40' :
                            'bg-blue-50 text-blue-600 dark:bg-blue-950/40'
                          }`}>
                            {isIncome && <ArrowDownLeft className="w-3.5 h-3.5" />}
                            {isExpense && <ArrowUpRight className="w-3.5 h-3.5" />}
                            {isLoan && <HandCoins className="w-3.5 h-3.5" />}
                            {isDebt && <Landmark className="w-3.5 h-3.5" />}
                            {isTransfer && <ArrowLeftRight className="w-3.5 h-3.5" />}
                          </span>
                          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                            {isIncome ? 'واریز' :
                             isExpense ? 'پرداخت' :
                             isLoan ? 'قرض (طلب)' :
                             isDebt ? 'بدهی (قرض)' : 'انتقال'}
                          </span>
                        </div>
                      </td>

                      {/* Title & Tracking code */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {tx.title}
                        </div>
                        {tx.tracking_code && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            کد پیگیری: {tx.tracking_code}
                          </div>
                        )}
                        {tx.notes && (
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">
                            {tx.notes}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        {tx.category}
                      </td>

                      {/* Account */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {isTransfer ? (
                          <span className="text-[11px] font-mono">
                            {tx.bank_account_title} ← {tx.destination_account_title}
                          </span>
                        ) : (
                          tx.bank_account_title || '—'
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {tx.contact_name ? (
                          <span className="font-medium">{tx.contact_name}</span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-500 tabular-nums">
                        {formatPersianDate(tx.transaction_date)}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 whitespace-nowrap text-left font-mono tabular-nums font-bold">
                        <span className={
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' :
                          isExpense ? 'text-rose-600 dark:text-rose-400' :
                          isLoan ? 'text-amber-600 dark:text-amber-400' :
                          isDebt ? 'text-purple-600 dark:text-purple-400' :
                          'text-blue-600 dark:text-blue-400'
                        }>
                          {isIncome ? '+' : isExpense ? '-' : ''}
                          {formatCurrency(tx.amount, currencySymbol, false)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            title="ویرایش"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={deletingId === tx.id}
                            onClick={() => handleDelete(tx.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
