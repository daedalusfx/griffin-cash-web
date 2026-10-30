import React, { useState } from 'react';
import { BankAccount, Workspace } from '../types/finance.ts';
import {
  Plus,
  CreditCard,
  Copy,
  Check,
  Edit2,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Layers
} from 'lucide-react';
import { formatCurrency, formatCardNumber } from '../utils/persianDate.ts';

interface AccountsViewProps {
  accounts: BankAccount[];
  workspace: Workspace;
  currencySymbol?: string;
  onOpenNewAccount: () => void;
  onEditAccount: (account: BankAccount) => void;
  onDeleteAccount: (id: string) => Promise<void>;
  onOpenTransfer: (fromAccountId?: string) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  workspace,
  currencySymbol = 'تومان',
  onOpenNewAccount,
  onEditAccount,
  onDeleteAccount,
  onOpenTransfer
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('آیا از حذف این حساب بانکی اطمینان دارید؟ توجه داشته باشید تراکنش‌های مرتبط با این حساب بدون اتصال باقی می‌مانند.')) {
      try {
        setDeletingId(id);
        await onDeleteAccount(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + (a.current_balance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Total Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              حساب‌ها و کارت‌های بانکی
            </h2>
            <span className="text-xs text-slate-400 font-mono">({accounts.length} حساب)</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ورک‌اسپیس: <span className="font-semibold text-slate-700 dark:text-slate-300">{workspace.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-left font-mono">
            <span className="text-[11px] text-slate-400 block">مجموع کل نقدینگی حساب‌ها:</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(totalBalance, currencySymbol)}
            </span>
          </div>

          <button
            onClick={onOpenNewAccount}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن حساب جدید</span>
          </button>
        </div>
      </div>

      {/* Bank Cards Grid */}
      {accounts.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
          <Landmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            هیچ حساب بانکی در این ورک‌اسپیس ثبت نشده است
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            برای ثبت تراکنش‌ها، کارت‌ها یا حساب‌های بانکی خود (مثل سامان، بلو، ملی، ملت یا وجه نقد) را اضافه کنید.
          </p>
          <button
            onClick={onOpenNewAccount}
            className="mt-4 px-4 py-2 text-xs font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            ثبت اولین حساب بانکی
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map(acc => {
            const cardCopyKey = `card-${acc.id}`;
            const ibanCopyKey = `iban-${acc.id}`;

            return (
              <div
                key={acc.id}
                className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Visual Card Top Strip with custom brand color */}
                <div
                  className="h-2.5 w-full"
                  style={{ backgroundColor: acc.color || '#3b82f6' }}
                />

                <div className="p-5 space-y-4">
                  {/* Bank name and actions */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: acc.color || '#3b82f6' }}
                      >
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {acc.bank_name}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {acc.account_title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditAccount(acc)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="ویرایش حساب"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={deletingId === acc.id}
                        onClick={() => handleDelete(acc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                        title="حذف حساب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Current Balance Hero Display */}
                  <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-0.5">
                      موجودی در دسترس:
                    </span>
                    <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatCurrency(acc.current_balance, currencySymbol)}
                    </div>
                  </div>

                  {/* Card Number & IBAN with copy buttons */}
                  <div className="space-y-2 text-xs">
                    {acc.card_number ? (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 font-mono">
                        <span className="text-slate-700 dark:text-slate-300 tracking-wider" dir="ltr">
                          {formatCardNumber(acc.card_number)}
                        </span>
                        <button
                          onClick={() => handleCopy(acc.card_number || '', cardCopyKey)}
                          className="text-slate-400 hover:text-emerald-600 transition-colors"
                          title="کپی شماره کارت"
                        >
                          {copiedId === cardCopyKey ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400">شماره کارت ثبت نشده است</div>
                    )}

                    {acc.iban && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono px-1">
                        <span dir="ltr">{acc.iban}</span>
                        <button
                          onClick={() => handleCopy(acc.iban || '', ibanCopyKey)}
                          className="text-slate-400 hover:text-emerald-600 transition-colors"
                          title="کپی شبا"
                        >
                          {copiedId === ibanCopyKey ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Account Inflow & Outflow stats */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
                      <div className="truncate font-mono tabular-nums">
                        <span>ورودی: </span>
                        <span>{formatCurrency(acc.total_inflow, currencySymbol, false)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                      <div className="truncate font-mono tabular-nums">
                        <span>خروجی: </span>
                        <span>{formatCurrency(acc.total_outflow, currencySymbol, false)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card footer with quick action */}
                <div className="px-5 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    صاحب حساب: {acc.holder_name || '—'}
                  </span>
                  <button
                    onClick={() => onOpenTransfer(acc.id)}
                    className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    انتقال وجه
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
