import React, { useState, useEffect } from 'react';
import { BankAccount } from '../../types/finance.ts';
import { X, Check } from 'lucide-react';
import { formatCardNumber, formatCurrency } from '../../utils/persianDate.ts';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<BankAccount>) => Promise<void>;
  initialData?: BankAccount | null;
  currencySymbol?: string;
}

const COMMON_BANKS = [
  'بانک سامان',
  'بلو بانک (سامان)',
  'بانک ملی',
  'بانک ملت',
  'بانک پاسارگاد',
  'بانک تجارت',
  'بانک صادرات',
  'بانک رسالت',
  'بانک پارسیان',
  'بانک سپه',
  'بانک آینده',
  'کیف پول نقدی'
];

const ACCOUNT_COLORS = [
  '#0284c7', // Sky / Saman
  '#06b6d4', // Cyan / Blu
  '#eab308', // Gold / Melli
  '#ef4444', // Red / Mellat
  '#6366f1', // Indigo / Pasargad
  '#10b981', // Emerald / Cash
  '#8b5cf6', // Purple
  '#334155'  // Slate
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currencySymbol = 'تومان'
}) => {
  const [bankName, setBankName] = useState(COMMON_BANKS[0]);
  const [accountTitle, setAccountTitle] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [holderName, setHolderName] = useState('');
  const [initialBalanceStr, setInitialBalanceStr] = useState('0');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setBankName(initialData.bank_name);
      setAccountTitle(initialData.account_title);
      setCardNumber(initialData.card_number || '');
      setAccountNumber(initialData.account_number || '');
      setIban(initialData.iban || '');
      setHolderName(initialData.holder_name || '');
      setInitialBalanceStr(String(initialData.initial_balance || 0));
      setColor(initialData.color || ACCOUNT_COLORS[0]);
    } else {
      setBankName(COMMON_BANKS[0]);
      setAccountTitle('');
      setCardNumber('');
      setAccountNumber('');
      setIban('');
      setHolderName('');
      setInitialBalanceStr('0');
      setColor(ACCOUNT_COLORS[0]);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const rawBalance = parseFloat(initialBalanceStr.replace(/,/g, '')) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !accountTitle.trim()) {
      setError('لطفاً نام بانک و عنوان حساب را مشخص کنید');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave({
        bank_name: bankName.trim(),
        account_title: accountTitle.trim(),
        card_number: cardNumber.replace(/\D/g, ''),
        account_number: accountNumber.trim(),
        iban: iban.trim().toUpperCase(),
        holder_name: holderName.trim(),
        initial_balance: rawBalance,
        color
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ذخیره حساب بانکی');
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    setCardNumber(clean);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {initialData ? 'ویرایش حساب بانکی' : 'ثبت حساب یا کارت بانکی جدید'}
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

          {/* Bank selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                نام بانک یا صندوق <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="bank-suggestions"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                placeholder="انتخاب یا تایپ بانک..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
              <datalist id="bank-suggestions">
                {COMMON_BANKS.map(b => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                عنوان حساب <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={accountTitle}
                onChange={e => setAccountTitle(e.target.value)}
                placeholder="مثال: حساب حقوق، کارت خرج روزمره، پس‌انداز"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Card & Account number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                شماره کارت (۱۶ رقمی)
              </label>
              <input
                type="text"
                dir="ltr"
                value={formatCardNumber(cardNumber)}
                onChange={e => handleCardNumberChange(e.target.value)}
                placeholder="XXXX - XXXX - XXXX - XXXX"
                maxLength={25}
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                شماره حساب بانکی
              </label>
              <input
                type="text"
                dir="ltr"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder="مثال: 8201-123456-1"
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* IBAN & Holder name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                شماره شبا (IBAN)
              </label>
              <input
                type="text"
                dir="ltr"
                value={iban}
                onChange={e => setIban(e.target.value)}
                placeholder="IR120560000000000000000000"
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                نام صاحب حساب
              </label>
              <input
                type="text"
                value={holderName}
                onChange={e => setHolderName(e.target.value)}
                placeholder="نام و نام خانوادگی..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Initial Balance */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              موجودی اولیه حساب ({currencySymbol})
            </label>
            <input
              type="text"
              dir="ltr"
              value={initialBalanceStr}
              onChange={e => {
                const clean = e.target.value.replace(/\D/g, '');
                setInitialBalanceStr(clean ? parseInt(clean, 10).toLocaleString('en-US') : '');
              }}
              placeholder="0"
              className="w-full px-3.5 py-2 text-sm font-mono font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
            />
            {rawBalance > 0 && (
              <p className="mt-1 text-[11px] text-slate-500">
                موجودی اولیه: {formatCurrency(rawBalance, currencySymbol)}
              </p>
            )}
          </div>

          {/* Card theme color */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              رنگ تم کارت بانکی
            </label>
            <div className="flex items-center gap-2">
              {ACCOUNT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

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
              {loading ? 'در حال ذخیره...' : initialData ? 'بروزرسانی حساب' : 'افزودن حساب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
