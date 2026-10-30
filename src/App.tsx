/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api.ts';
import {
  Workspace,
  BankAccount,
  Contact,
  Transaction,
  WorkspaceSummary,
  MonthlyReportItem,
  YearlyReportItem,
  WeeklyReportItem,
  CategorySummary,
  TransactionType
} from './types/finance.ts';

import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { TransactionsView } from './components/TransactionsView.tsx';
import { AccountsView } from './components/AccountsView.tsx';
import { ContactsView } from './components/ContactsView.tsx';
import { ReportsView } from './components/ReportsView.tsx';

import { WorkspaceModal } from './components/Modals/WorkspaceModal.tsx';
import { TransactionModal } from './components/Modals/TransactionModal.tsx';
import { AccountModal } from './components/Modals/AccountModal.tsx';
import { ContactModal } from './components/Modals/ContactModal.tsx';
import { ContactStatementModal } from './components/Modals/ContactStatementModal.tsx';
import { Loader2 } from 'lucide-react';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('radin_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('radin_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('radin_theme', 'light');
    }
  }, [isDark]);

  const toggleDark = () => setIsDark(prev => !prev);

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Workspaces
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

  // Data for active workspace
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<WorkspaceSummary | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReportItem[]>([]);
  const [yearlyReport, setYearlyReport] = useState<YearlyReportItem[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReportItem[]>([]);
  const [categoriesReport, setCategoriesReport] = useState<{
    expenses: CategorySummary[];
    incomes: CategorySummary[];
    total_expense: number;
    total_income: number;
  }>({ expenses: [], incomes: [], total_expense: 0, total_income: 0 });

  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Modals
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [defaultTxType, setDefaultTxType] = useState<TransactionType>('expense');

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [statementContact, setStatementContact] = useState<Contact | null>(null);

  // Initial Load: Workspaces
  const loadWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const wsList = await api.getWorkspaces();
      setWorkspaces(wsList);
      if (wsList.length > 0) {
        // preserve current or select first
        setCurrentWorkspace(prev => {
          if (prev && wsList.some(w => w.id === prev.id)) {
            return wsList.find(w => w.id === prev.id) || wsList[0];
          }
          return wsList[0];
        });
      }
    } catch (err: any) {
      showFeedback(err.message || 'خطا در بارگذاری اطلاعات اولیه', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  // Load details for current workspace
  const loadWorkspaceData = useCallback(async (wsId: string) => {
    try {
      const [accs, conts, txs, sum, monthly, yearly, weekly, cats] = await Promise.all([
        api.getBankAccounts(wsId),
        api.getContacts(wsId),
        api.getTransactions(wsId),
        api.getSummary(wsId),
        api.getMonthlyReport(wsId),
        api.getYearlyReport(wsId),
        api.getWeeklyReport(wsId),
        api.getCategoriesReport(wsId)
      ]);

      setAccounts(accs);
      setContacts(conts);
      setTransactions(txs);
      setSummary(sum);
      setMonthlyReport(monthly);
      setYearlyReport(yearly);
      setWeeklyReport(weekly);
      setCategoriesReport(cats);
    } catch (err: any) {
      console.error(err);
      showFeedback('خطا در همگام‌سازی اطلاعات ورک‌اسپیس', 'error');
    }
  }, []);

  useEffect(() => {
    if (currentWorkspace?.id) {
      loadWorkspaceData(currentWorkspace.id);
    }
  }, [currentWorkspace?.id, loadWorkspaceData]);

  // Handlers for Workspaces
  const handleSaveWorkspace = async (data: Partial<Workspace>) => {
    if (editingWorkspace) {
      const updated = await api.updateWorkspace(editingWorkspace.id, data);
      showFeedback('فضای کاری با موفقیت ویرایش شد');
      await loadWorkspaces();
      setCurrentWorkspace(updated);
    } else {
      const created = await api.createWorkspace(data);
      showFeedback('فضای کاری جدید ایجاد شد');
      await loadWorkspaces();
      setCurrentWorkspace(created);
    }
  };

  const handleResetDemoData = async () => {
    if (window.confirm('آیا مایلید داده‌های نمونه بازنشانی شوند؟ تمام اطلاعات آزمایشی با نمونه‌های واقع‌گرایانه بازنویسی می‌شوند.')) {
      try {
        setLoading(true);
        await api.resetDemoData();
        showFeedback('داده‌های نمونه بازنشانی شدند');
        await loadWorkspaces();
      } catch (err: any) {
        showFeedback(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handlers for Transactions
  const handleSaveTransaction = async (data: Partial<Transaction>) => {
    if (!currentWorkspace) return;
    if (editingTransaction) {
      await api.updateTransaction(editingTransaction.id, data);
      showFeedback('تراکنش با موفقیت بروزرسانی شد');
    } else {
      await api.createTransaction(currentWorkspace.id, data);
      showFeedback('تراکنش با موفقیت ثبت گردید');
    }
    await loadWorkspaceData(currentWorkspace.id);
    await loadWorkspaces(); // refresh accounts count and balance
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!currentWorkspace) return;
    await api.deleteTransaction(id);
    showFeedback('تراکنش حذف شد');
    await loadWorkspaceData(currentWorkspace.id);
    await loadWorkspaces();
  };

  // Handlers for Bank Accounts
  const handleSaveAccount = async (data: Partial<BankAccount>) => {
    if (!currentWorkspace) return;
    if (editingAccount) {
      await api.updateBankAccount(editingAccount.id, data);
      showFeedback('اطلاعات حساب بانکی ویرایش شد');
    } else {
      await api.createBankAccount(currentWorkspace.id, data);
      showFeedback('حساب بانکی جدید افزوده شد');
    }
    await loadWorkspaceData(currentWorkspace.id);
    await loadWorkspaces();
  };

  const handleDeleteAccount = async (id: string) => {
    if (!currentWorkspace) return;
    await api.deleteBankAccount(id);
    showFeedback('حساب بانکی حذف شد');
    await loadWorkspaceData(currentWorkspace.id);
    await loadWorkspaces();
  };

  // Handlers for Contacts
  const handleSaveContact = async (data: Partial<Contact>) => {
    if (!currentWorkspace) return;
    if (editingContact) {
      await api.updateContact(editingContact.id, data);
      showFeedback('اطلاعات مخاطب بروزرسانی شد');
    } else {
      await api.createContact(currentWorkspace.id, data);
      showFeedback('مخاطب جدید ثبت شد');
    }
    await loadWorkspaceData(currentWorkspace.id);
  };

  const handleDeleteContact = async (id: string) => {
    if (!currentWorkspace) return;
    await api.deleteContact(id);
    showFeedback('مخاطب حذف شد');
    await loadWorkspaceData(currentWorkspace.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed bottom-5 left-5 z-50 animate-bounce">
          <div className={`px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-rose-600 text-white'
          }`}>
            <span>{feedback.text}</span>
          </div>
        </div>
      )}

      {/* Navigation Top Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        onSelectWorkspace={ws => setCurrentWorkspace(ws)}
        onOpenNewWorkspaceModal={() => {
          setEditingWorkspace(null);
          setIsWorkspaceModalOpen(true);
        }}
        onOpenNewTransactionModal={() => {
          setEditingTransaction(null);
          setDefaultTxType('expense');
          setIsTransactionModalOpen(true);
        }}
        onResetDemoData={handleResetDemoData}
        isDark={isDark}
        toggleDark={toggleDark}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="text-xs">در حال بارگذاری پایگاه داده SQLite و اطلاعات مالی...</span>
          </div>
        ) : !currentWorkspace ? (
          <div className="text-center py-20">
            <p className="text-sm text-slate-500">فضای کاری فعالی یافت نشد.</p>
            <button
              onClick={() => {
                setEditingWorkspace(null);
                setIsWorkspaceModalOpen(true);
              }}
              className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl"
            >
              ایجاد اولین ورک‌اسپیس
            </button>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                workspace={currentWorkspace}
                summary={summary}
                accounts={accounts}
                contacts={contacts}
                transactions={transactions}
                monthlyReport={monthlyReport}
                onOpenNewTransaction={() => {
                  setEditingTransaction(null);
                  setDefaultTxType('expense');
                  setIsTransactionModalOpen(true);
                }}
                onOpenNewAccount={() => {
                  setEditingAccount(null);
                  setIsAccountModalOpen(true);
                }}
                onOpenNewContact={() => {
                  setEditingContact(null);
                  setIsContactModalOpen(true);
                }}
                onSelectTab={setCurrentTab}
                onSelectContactForStatement={c => setStatementContact(c)}
                onEditTransaction={tx => {
                  setEditingTransaction(tx);
                  setIsTransactionModalOpen(true);
                }}
              />
            )}

            {currentTab === 'transactions' && (
              <TransactionsView
                transactions={transactions}
                accounts={accounts}
                contacts={contacts}
                currencySymbol={currentWorkspace.currency_symbol}
                onOpenNewTransaction={() => {
                  setEditingTransaction(null);
                  setDefaultTxType('expense');
                  setIsTransactionModalOpen(true);
                }}
                onEditTransaction={tx => {
                  setEditingTransaction(tx);
                  setIsTransactionModalOpen(true);
                }}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}

            {currentTab === 'accounts' && (
              <AccountsView
                accounts={accounts}
                workspace={currentWorkspace}
                currencySymbol={currentWorkspace.currency_symbol}
                onOpenNewAccount={() => {
                  setEditingAccount(null);
                  setIsAccountModalOpen(true);
                }}
                onEditAccount={acc => {
                  setEditingAccount(acc);
                  setIsAccountModalOpen(true);
                }}
                onDeleteAccount={handleDeleteAccount}
                onOpenTransfer={fromAccId => {
                  setEditingTransaction(null);
                  setDefaultTxType('transfer');
                  setIsTransactionModalOpen(true);
                }}
              />
            )}

            {currentTab === 'contacts' && (
              <ContactsView
                contacts={contacts}
                workspace={currentWorkspace}
                currencySymbol={currentWorkspace.currency_symbol}
                onOpenNewContact={() => {
                  setEditingContact(null);
                  setIsContactModalOpen(true);
                }}
                onEditContact={c => {
                  setEditingContact(c);
                  setIsContactModalOpen(true);
                }}
                onDeleteContact={handleDeleteContact}
                onViewStatement={c => setStatementContact(c)}
                onNewTransactionWithContact={c => {
                  setEditingTransaction(null);
                  setIsTransactionModalOpen(true);
                }}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                workspace={currentWorkspace}
                monthlyReport={monthlyReport}
                yearlyReport={yearlyReport}
                weeklyReport={weeklyReport}
                categoriesReport={categoriesReport}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 dark:border-slate-800/80 py-4 px-6 text-center text-xs text-slate-400">
        سامانه مدیریت گردش مالی رادین · پایگاه داده محلی SQLite با تفکیک ورک‌اسپیس‌ها
      </footer>

      {/* Modals */}
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onSave={handleSaveWorkspace}
        initialData={editingWorkspace}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        accounts={accounts}
        contacts={contacts}
        currencySymbol={currentWorkspace?.currency_symbol || 'تومان'}
        defaultType={defaultTxType}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleSaveAccount}
        initialData={editingAccount}
        currencySymbol={currentWorkspace?.currency_symbol || 'تومان'}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSave={handleSaveContact}
        initialData={editingContact}
      />

      <ContactStatementModal
        isOpen={Boolean(statementContact)}
        onClose={() => setStatementContact(null)}
        contact={statementContact}
        workspaceId={currentWorkspace?.id || ''}
        currencySymbol={currentWorkspace?.currency_symbol || 'تومان'}
        onNewTransactionWithContact={c => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
      />
    </div>
  );
}
