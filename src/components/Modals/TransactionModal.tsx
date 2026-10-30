import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, BankAccount, Contact } from '../../types/finance.ts';
import { X, ArrowDownLeft, ArrowUpRight, HandCoins, Landmark, ArrowLeftRight } from 'lucide-react';
import { formatCurrency, formatPersianDate } from '../../utils/persianDate.ts';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Transaction>) => Promise<void>;
  initialData?: Transaction | null;
  accounts: BankAccount[];
  contacts: Contact[];
  currencySymbol?: string;
  defaultType?: TransactionType;
}

const EXPENSE_CATEGORIES = [
  'خوراک و سوپرمارکت',
  'اجاره و مسکن',
  'حمل‌ونقل و بنزین',
  'پزشکی و سلامت',
  'قبوض و شارژ ساختمان',
  'پوشاک و لوازم شخصی',
  'تجهیزات و ابزار کار',
  'تفریح، رستوران و سفر',
  'آموزش و کتاب',
  'تعمیرات خودرو و خانه',
  'بیمه و خدمات مالی',
  'متفرقه'
];

const INCOME_CATEGORIES = [
  'حقوق و دستمزد',
  'پاداش و مزایا',
  'فروش کالا / فریلنسری',
  'سود بانکی و سرمایه',
  'هدیه و کمک هزینه',
  'تسویه طلبکاری',
  'سایر درآمدها'
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  accounts,
  contacts,
  currencySymbol = 'تومان',
  defaultType = 'expense'
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amountStr, setAmountStr] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [contactId, setContactId] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmountStr(String(initialData.amount));
      setTitle(initialData.title);
      setCategory(initialData.category);
      setBankAccountId(initialData.bank_account_id || '');
      setDestinationAccountId(initialData.destination_account_id || '');
      setContactId(initialData.contact_id || '');
      setTransactionDate(initialData.transaction_date || new Date().toISOString().slice(0, 10));
      setTrackingCode(initialData.tracking_code || '');
      setNotes(initialData.notes || '');
    } else {
      setType(defaultType);
      setAmountStr('');
      setTitle('');
      setCategory(defaultType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
      setBankAccountId(accounts[0]?.id || '');
      setDestinationAccountId(accounts[1]?.id || '');
      setContactId('');
      setTransactionDate(new Date().toISOString().slice(0, 10));
      setTrackingCode('');
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen, defaultType, accounts]);

  if (!isOpen) return null;

  const rawAmount = parseFloat(amountStr.replace(/,/g, '')) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rawAmount <= 0) {
      setError('لطفاً مبلغ معتبر وارد کنید');
      return;
    }
    if (!title.trim()) {
      setError('لطفاً عنوان تراکنش را وارد کنید');
      return;
    }
    if (type === 'transfer' && (!bankAccountId || !destinationAccountId || bankAccountId === destinationAccountId)) {
      setError('لطفاً حساب مبدأ و مقصد متفاوتی را انتخاب کنید');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave({
        type,
        amount: rawAmount,
        title: title.trim(),
        category: category || (type === 'transfer' ? 'انتقال حساب' : 'متفرقه'),
        bank_account_id: bankAccountId || undefined,
        destination_account_id: type === 'transfer' ? destinationAccountId : undefined,
        contact_id: contactId || undefined,
        transaction_date: transactionDate,
        tracking_code: trackingCode.trim(),
        notes: notes.trim(),
        status: 'completed'
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت تراکنش');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (val: string) => {
    // Keep only numbers
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      setAmountStr('');
      return;
    }
    const num = parseInt(clean, 10);
    setAmountStr(num.toLocaleString('en-US'));
  };

  const typeConfig = [
    { key: 'expense', label: 'پرداخت / هزینه', icon: ArrowUpRight, color: 'text-rose-600 border-rose-500 bg-rose-50/60 dark:bg-rose-950/30' },
    { key: 'income', label: 'واریز / دریافت', icon: ArrowDownLeft, color: 'text-emerald-600 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30' },
    { key: 'loan', label: 'قرض دادم (طلب)', icon: HandCoins, color: 'text-amber-600 border-amber-500 bg-amber-50/60 dark:bg-amber-950/30' },
    { key: 'debt', label: 'قرض گرفتم (بدهی)', icon: Landmark, color: 'text-purple-600 border-purple-500 bg-purple-50/60 dark:bg-purple-950/30' },
    { key: 'transfer', label: 'انتقال حساب', icon: ArrowLeftRight, color: 'text-blue-600 border-blue-500 bg-blue-50/60 dark:bg-blue-950/30' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {initialData ? 'ویرایش تراکنش' : 'ثبت تراکنش مالی جدید'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg">
              {error}
            </div>
          )}

          {/* Transaction Type Segmented Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              نوع گردش مالی
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {typeConfig.map(t => {
                const Icon = t.icon;
                const isSelected = type === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setType(t.key as TransactionType);
                      if (t.key === 'income') setCategory(INCOME_CATEGORIES[0]);
                      else if (t.key === 'expense') setCategory(EXPENSE_CATEGORIES[0]);
                      else if (t.key === 'loan') setCategory('قرض و مطالبات');
                      else if (t.key === 'debt') setCategory('بدهی و تعهدات');
                      else if (t.key === 'transfer') setCategory('انتقال حساب');
                    }}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 text-xs font-medium rounded-lg transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate text-[11px]">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount input with live formatting */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              مبلغ تراکنش ({currencySymbol}) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                dir="ltr"
                value={amountStr}
                onChange={e => handleAmountChange(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 text-base font-mono font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                autoFocus
              />
              <span className="absolute left-3 top-3 text-xs text-slate-400 font-medium">
                {currencySymbol}
              </span>
            </div>
            {rawAmount > 0 && (
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                مبلغ معادل: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(rawAmount, currencySymbol)}</span>
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              عنوان / شرح مختصر <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: خرید مواد غذایی هفتگی، واریز حقوق مهر، قرض به علی..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Accounts selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {type === 'transfer' ? 'از حساب مبدأ' : 'حساب بانکی'}
              </label>
              <select
                value={bankAccountId}
                onChange={e => setBankAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              >
                <option value="">-- بدون انتخاب حساب --</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bank_name} - {acc.account_title} ({formatCurrency(acc.current_balance, currencySymbol)})
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  به حساب مقصد
                </label>
                <select
                  value={destinationAccountId}
                  onChange={e => setDestinationAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                >
                  <option value="">-- انتخاب حساب مقصد --</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bank_name} - {acc.account_title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  طرف حساب / مخاطب (فرد یا فروشگاه)
                </label>
                <select
                  value={contactId}
                  onChange={e => setContactId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                >
                  <option value="">-- بدون ارتباط با مخاطب خاص --</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type === 'merchant' ? 'فروشگاه' : 'شخص'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                دسته‌بندی
              </label>
              <input
                type="text"
                list="category-suggestions"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="انتخاب یا تایپ دسته‌بندی..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
              <datalist id="category-suggestions">
                {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                تاریخ تراکنش
              </label>
              <input
                type="date"
                value={transactionDate}
                onChange={e => setTransactionDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                معادل شمسی: {formatPersianDate(transactionDate, { showMonthName: true })}
              </p>
            </div>
          </div>

          {/* Tracking code & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                شماره پیگیری بانکی
              </label>
              <input
                type="text"
                value={trackingCode}
                onChange={e => setTrackingCode(e.target.value)}
                placeholder="کد پیگیری یا شماره ارجاع"
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                یادداشت تکمیلی
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="توضیحات اختیاری..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs"
            >
              {loading ? 'در حال ثبت...' : initialData ? 'بروزرسانی تراکنش' : 'ثبت تراکنش'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
