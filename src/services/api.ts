import {
  Workspace,
  BankAccount,
  Contact,
  Transaction,
  WorkspaceSummary,
  MonthlyReportItem,
  YearlyReportItem,
  WeeklyReportItem,
  CategorySummary
} from '../types/finance.ts';

const API_BASE = '/api';

export const api = {
  // Workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    const res = await fetch(`${API_BASE}/workspaces`);
    if (!res.ok) throw new Error('خطا در دریافت لیست ورک‌اسپیس‌ها');
    return res.json();
  },

  async createWorkspace(data: Partial<Workspace>): Promise<Workspace> {
    const res = await fetch(`${API_BASE}/workspaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('خطا در ایجاد ورک‌اسپیس');
    return res.json();
  },

  async updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace> {
    const res = await fetch(`${API_BASE}/workspaces/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('خطا در ویرایش ورک‌اسپیس');
    return res.json();
  },

  async deleteWorkspace(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/workspaces/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('خطا در حذف ورک‌اسپیس');
  },

  async resetDemoData(): Promise<void> {
    const res = await fetch(`${API_BASE}/workspaces/reset-demo`, { method: 'POST' });
    if (!res.ok) throw new Error('خطا در بازنشانی داده‌ها');
  },

  // Bank Accounts
  async getBankAccounts(workspaceId: string): Promise<BankAccount[]> {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/accounts`);
    if (!res.ok) throw new Error('خطا در دریافت حساب‌های بانکی');
    return res.json();
  },

  async createBankAccount(workspaceId: string, data: Partial<BankAccount>): Promise<BankAccount> {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('خطا در ثبت حساب بانکی');
    return res.json();
  },

  async updateBankAccount(id: string, data: Partial<BankAccount>): Promise<BankAccount> {
    const res = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('خطا در ویرایش حساب بانکی');
    return res.json();
  },

  async deleteBankAccount(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/accounts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('خطا در حذف حساب بانکی');
  },

  // Contacts
  async getContacts(workspaceId: string): Promise<Contact[]> {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/contacts`);
    if (!res.ok) throw new Error('خطا در دریافت مخاطبین');
    return res.json();
  },

  async createContact(workspaceId: string, data: Partial<Contact>): Promise<Contact> {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('خطا در ثبت مخاطب');
    return res.json();
  },

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    const res = await fetch(`${API_BASE}/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('خطا در ویرایش مخاطب');
    return res.json();
  },

  async deleteContact(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/contacts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('خطا در حذف مخاطب');
  },

  // Transactions
  async getTransactions(workspaceId: string, filters: Record<string, any> = {}): Promise<Transaction[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') {
        params.append(k, String(v));
      }
    });
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/transactions?${params.toString()}`);
    if (!res.ok) throw new Error('خطا در دریافت تراکنش‌ها');
    return res.json();
  },

  async createTransaction(workspaceId: string, data: Partial<Transaction>): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('خطا در ثبت تراکنش');
    return res.json();
  },

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('خطا در ویرایش تراکنش');
    return res.json();
  },

  async deleteTransaction(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('خطا در حذف تراکنش');
  },

  // Reports
  async getSummary(workspaceId: string): Promise<WorkspaceSummary> {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/summary`);
    if (!res.ok) throw new Error('خطا در دریافت خلاصه مالی');
    return res.json();
  },

  async getMonthlyReport(workspaceId: string): Promise<MonthlyReportItem[]> {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/reports/monthly`);
    if (!res.ok) throw new Error('خطا در دریافت گزارش ماهانه');
    return res.json();
  },

  async getYearlyReport(workspaceId: string): Promise<YearlyReportItem[]> {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/reports/yearly`);
    if (!res.ok) throw new Error('خطا در دریافت گزارش سالانه');
    return res.json();
  },

  async getWeeklyReport(workspaceId: string): Promise<WeeklyReportItem[]> {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/reports/weekly`);
    if (!res.ok) throw new Error('خطا در دریافت گزارش هفتگی');
    return res.json();
  },

  async getCategoriesReport(workspaceId: string): Promise<{ expenses: CategorySummary[]; incomes: CategorySummary[]; total_expense: number; total_income: number }> {
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/reports/categories`);
    if (!res.ok) throw new Error('خطا در دریافت گزارش دسته‌بندی‌ها');
    return res.json();
  }
};
