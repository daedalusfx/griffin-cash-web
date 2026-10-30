import React, { useState, useEffect } from 'react';
import { Contact, Transaction } from '../../types/finance.ts';
import { api } from '../../services/api.ts';
import { X, ArrowDownLeft, ArrowUpRight, HandCoins, Landmark, Phone, CreditCard } from 'lucide-react';
import { formatCurrency, formatPersianDate, formatCardNumber } from '../../utils/persianDate.ts';

interface ContactStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  workspaceId: string;
  currencySymbol?: string;
  onNewTransactionWithContact?: (contact: Contact) => void;
}

export const ContactStatementModal: React.FC<ContactStatementModalProps> = ({
  isOpen,
  onClose,
  contact,
  workspaceId,
  currencySymbol = 'تومان',
  onNewTransactionWithContact
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contact && isOpen) {
      loadHistory();
    }
  }, [contact, isOpen]);

  const loadHistory = async () => {
    if (!contact) return;
    try {
      setLoading(true);
      const list = await api.getTransactions(workspaceId, { contact_id: contact.id });
      setTransactions(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !contact) return null;

  const netBalance = (contact.receivable_amount || 0) - (contact.payable_amount || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
              {contact.name.slice(0, 1)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                صورت‌حساب و گردش مالی: {contact.name}
              </h3>
              <p className="text-xs text-slate-500">
                {contact.type === 'merchant' ? 'فروشگاه / شرکت' : 'شخص حقیقی'} · {contact.category || 'عمومی'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact Info & Net Ledger Cards */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-500 block mb-1">طلب ما از این مخاطب (قرض داده شده)</span>
              <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(contact.receivable_amount, currencySymbol)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-500 block mb-1">بدهی ما به این مخاطب (قرض گرفته شده)</span>
              <span className="text-sm font-bold font-mono text-purple-600 dark:text-purple-400 tabular-nums">
                {formatCurrency(contact.payable_amount, currencySymbol)}
              </span>
            </div>

            <div className={`p-3.5 rounded-xl border ${
              netBalance > 0
                ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
                : netBalance < 0
                ? 'border-rose-200 bg-rose-50/40 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              <span className="text-[11px] opacity-80 block mb-1">تراز نهایی مطالبات و بدهی</span>
              <span className="text-sm font-bold font-mono tabular-nums">
                {netBalance > 0 && '+ '}
                {netBalance < 0 && '- '}
                {formatCurrency(Math.abs(netBalance), currencySymbol)}
              </span>
              <span className="text-[10px] block mt-0.5 opacity-75">
                {netBalance > 0 ? '(او به ما بدهکار است)' : netBalance < 0 ? '(ما به او بدهکاریم)' : '(تسویه کامل / بی‌حساب)'}
              </span>
            </div>
          </div>

          {/* Quick contact metadata strip */}
          {(contact.phone || contact.card_or_account) && (
            <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
              {contact.phone && (
                <div className="flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span dir="ltr">{contact.phone}</span>
                </div>
              )}
              {contact.card_or_account && (
                <div className="flex items-center gap-1.5 font-mono">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>کارت/حساب: {contact.card_or_account}</span>
                </div>
              )}
            </div>
          )}

          {/* Action to log transaction */}
          <div className="flex items-center justify-between pt-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              ریز گردش‌های ثبت‌شده ({transactions.length} تراکنش)
            </h4>
            {onNewTransactionWithContact && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewTransactionWithContact(contact);
                }}
                className="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors"
              >
                + ثبت تراکنش با این مخاطب
              </button>
            )}
          </div>

          {/* Transactions List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">در حال بارگذاری تراکنش‌ها...</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">تراکنشی برای این مخاطب ثبت نشده است</div>
            ) : (
              transactions.map(tx => {
                const isPositive = tx.type === 'income' || tx.type === 'debt';
                return (
                  <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        tx.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' :
                        tx.type === 'expense' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40' :
                        tx.type === 'loan' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40' :
                        'bg-purple-50 text-purple-600 dark:bg-purple-950/40'
                      }`}>
                        {tx.type === 'income' && <ArrowDownLeft className="w-4 h-4" />}
                        {tx.type === 'expense' && <ArrowUpRight className="w-4 h-4" />}
                        {tx.type === 'loan' && <HandCoins className="w-4 h-4" />}
                        {tx.type === 'debt' && <Landmark className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{tx.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{formatPersianDate(tx.transaction_date)}</span>
                          <span>·</span>
                          <span>{tx.bank_account_title || 'بدون حساب'}</span>
                          {tx.tracking_code && (
                            <>
                              <span>·</span>
                              <span className="font-mono">کد: {tx.tracking_code}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-left font-mono tabular-nums">
                      <div className={`text-xs font-bold ${
                        tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' :
                        tx.type === 'expense' ? 'text-rose-600 dark:text-rose-400' :
                        tx.type === 'loan' ? 'text-amber-600 dark:text-amber-400' :
                        'text-purple-600 dark:text-purple-400'
                      }`}>
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                        {formatCurrency(tx.amount, currencySymbol)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {tx.type === 'income' ? 'دریافتی' :
                         tx.type === 'expense' ? 'پرداختی' :
                         tx.type === 'loan' ? 'قرض داده شده' : 'قرض گرفته شده'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
