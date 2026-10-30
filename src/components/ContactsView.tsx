import React, { useState, useMemo } from 'react';
import { Contact, Workspace } from '../types/finance.ts';
import {
  Plus,
  User,
  Store,
  Phone,
  CreditCard,
  Edit2,
  Trash2,
  FileText,
  Search,
  HandCoins,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { formatCurrency, formatCardNumber } from '../utils/persianDate.ts';

interface ContactsViewProps {
  contacts: Contact[];
  workspace: Workspace;
  currencySymbol?: string;
  onOpenNewContact: () => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => Promise<void>;
  onViewStatement: (contact: Contact) => void;
  onNewTransactionWithContact: (contact: Contact) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  workspace,
  currencySymbol = 'تومان',
  onOpenNewContact,
  onEditContact,
  onDeleteContact,
  onViewStatement,
  onNewTransactionWithContact
}) => {
  const [filterType, setFilterType] = useState<'all' | 'person' | 'merchant'>('all');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      if (filterType !== 'all' && c.type !== filterType) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const inName = c.name.toLowerCase().includes(q);
        const inCat = (c.category || '').toLowerCase().includes(q);
        const inPhone = (c.phone || '').includes(q);
        const inNotes = (c.notes || '').toLowerCase().includes(q);
        if (!inName && !inCat && !inPhone && !inNotes) return false;
      }
      return true;
    });
  }, [contacts, filterType, search]);

  const handleDelete = async (id: string) => {
    if (window.confirm('آیا از حذف این مخاطب اطمینان دارید؟')) {
      try {
        setDeletingId(id);
        await onDeleteContact(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const totalReceivables = contacts.reduce((sum, c) => sum + (c.receivable_amount || 0), 0);
  const totalPayables = contacts.reduce((sum, c) => sum + (c.payable_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header and KPI strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              دفتر مخاطبین و طرف‌حساب‌ها
            </h2>
            <span className="text-xs text-slate-400 font-mono">({contacts.length} طرف‌حساب)</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            افراد، دوستان، فروشگاه‌ها، کارفرمایان و وضعیت بدهی‌ها و مطالبات
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">طلب‌های جاری:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{formatCurrency(totalReceivables, currencySymbol)}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:border-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 block">بدهی‌های جاری:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400 tabular-nums">
                -{formatCurrency(totalPayables, currencySymbol)}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenNewContact}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن مخاطب</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            همه طرف‌حساب‌ها
          </button>
          <button
            onClick={() => setFilterType('person')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'person'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            اشخاص حقیقی ({contacts.filter(c => c.type === 'person').length})
          </button>
          <button
            onClick={() => setFilterType('merchant')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'merchant'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            فروشگاه‌ها و شرکت‌ها ({contacts.filter(c => c.type === 'merchant').length})
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="جستجوی نام، تلفن یا دسته‌بندی..."
            className="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Contacts Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
          <User className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            مخاطبی با این مشخصات یافت نشد
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            افراد حقیقی (مثل دوستان و همکاران) یا فروشگاه‌هایی که خرید می‌کنید را ثبت کنید تا مطالبات و پرداختی‌ها دقیق رهگیری شوند.
          </p>
          <button
            onClick={onOpenNewContact}
            className="mt-4 px-4 py-2 text-xs font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            افزودن اولین مخاطب
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(c => {
            const isPerson = c.type === 'person';
            const net = (c.receivable_amount || 0) - (c.payable_amount || 0);

            return (
              <div
                key={c.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  {/* Top: Avatar/Icon, Name, Category */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shadow-xs ${
                        isPerson
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                      }`}>
                        {isPerson ? <User className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {c.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{isPerson ? 'شخص حقیقی' : 'فروشگاه / شرکت'}</span>
                          {c.category && (
                            <>
                              <span>·</span>
                              <span>{c.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditContact(c)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="ویرایش مخاطب"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={deletingId === c.id}
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                        title="حذف مخاطب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Net Debt/Loan status indicator box */}
                  <div className={`p-3 rounded-xl border text-xs ${
                    net > 0
                      ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                      : net < 0
                      ? 'border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-300'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium">
                        {net > 0 ? 'طلبکاریم (او بدهکار است):' :
                         net < 0 ? 'بدهکاریم (بدهی ما به او):' :
                         'وضعیت حساب قرض و بدهی:'}
                      </span>
                      <span className="font-mono font-bold tabular-nums text-xs">
                        {net !== 0 ? formatCurrency(Math.abs(net), currencySymbol) : 'بی‌حساب / تسویه'}
                      </span>
                    </div>
                  </div>

                  {/* Financial stats with this contact */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-1 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block">کل پرداختی‌ها به او:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-medium tabular-nums">
                        {formatCurrency(c.total_paid, currencySymbol)}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block">کل دریافتی‌ها از او:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-medium tabular-nums">
                        {formatCurrency(c.total_received, currencySymbol)}
                      </span>
                    </div>
                  </div>

                  {/* Phone & Bank details */}
                  {(c.phone || c.card_or_account) && (
                    <div className="space-y-1.5 pt-1 text-[11px] text-slate-500 font-mono">
                      {c.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span dir="ltr">{c.phone}</span>
                        </div>
                      )}
                      {c.card_or_account && (
                        <div className="flex items-center gap-1.5 truncate">
                          <CreditCard className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate" dir="ltr">{c.card_or_account}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {c.notes && (
                    <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                      "{c.notes}"
                    </p>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onViewStatement(c)}
                    className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>صورت‌حساب ({c.transaction_count || 0})</span>
                  </button>

                  <button
                    onClick={() => onNewTransactionWithContact(c)}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    + ثبت تراکنش
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
