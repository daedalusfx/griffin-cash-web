import React, { useState, useEffect } from 'react';
import { Contact } from '../../types/finance.ts';
import { X, User, Store } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Contact>) => Promise<void>;
  initialData?: Contact | null;
}

const COMMON_CONTACT_CATEGORIES = [
  'دوست و آشنا',
  'همکار',
  'خانواده و فامیل',
  'سوپرمارکت و خوراک',
  'کارفرما / مشتری',
  'صاحبخانه / اجاره',
  'پیمانکار و مجری',
  'پزشک و خدمات درمان',
  'سایر'
];

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'person' | 'merchant'>('person');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState(COMMON_CONTACT_CATEGORIES[0]);
  const [cardOrAccount, setCardOrAccount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type || 'person');
      setPhone(initialData.phone || '');
      setCategory(initialData.category || COMMON_CONTACT_CATEGORIES[0]);
      setCardOrAccount(initialData.card_or_account || '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setType('person');
      setPhone('');
      setCategory(COMMON_CONTACT_CATEGORIES[0]);
      setCardOrAccount('');
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('لطفاً نام مخاطب یا فروشگاه را وارد کنید');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave({
        name: name.trim(),
        type,
        phone: phone.trim(),
        category: category.trim(),
        card_or_account: cardOrAccount.trim(),
        notes: notes.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت مخاطب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {initialData ? 'ویرایش مخاطب / فروشگاه' : 'افزودن مخاطب جدید'}
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

          {/* Type Selector: Person vs Merchant */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              ماهیت طرف حساب
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('person')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                  type === 'person'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <User className="w-4 h-4" />
                <span>فرد حقیقی (دوست، همکار، آشنا)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('merchant')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                  type === 'merchant'
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>فروشگاه / شرکت / کسب‌وکار</span>
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              نام و عنوان مخاطب <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={type === 'person' ? 'مثال: علی رضایی، دکتر باقری، آقای مرادی' : 'مثال: سوپرمارکت افق، دیجی‌کالا، هتزنر'}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              autoFocus
            />
          </div>

          {/* Phone & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                شماره تماس
              </label>
              <input
                type="text"
                dir="ltr"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0912..."
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                دسته‌بندی یا رابطه
              </label>
              <input
                type="text"
                list="contact-cat-list"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="انتخاب یا تایپ دسته..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              />
              <datalist id="contact-cat-list">
                {COMMON_CONTACT_CATEGORIES.map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Card / Bank account of contact */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              شماره کارت یا حساب بانکی مخاطب
            </label>
            <input
              type="text"
              dir="ltr"
              value={cardOrAccount}
              onChange={e => setCardOrAccount(e.target.value)}
              placeholder="جهت دسترسی سریع هنگام انتقال یا واریز وجه"
              className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              یادداشت / سابقه
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="توضیحات درباره توافقات مالی، سابقه کاری یا قرارهای پرداخت..."
              rows={2}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
            />
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
              {loading ? 'در حال ذخیره...' : initialData ? 'بروزرسانی مخاطب' : 'افزودن مخاطب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
