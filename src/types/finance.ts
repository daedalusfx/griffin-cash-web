export type TransactionType = 'income' | 'expense' | 'loan' | 'debt' | 'transfer';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  currency: string;
  currency_symbol: string;
  color: string;
  icon?: string;
  created_at: string;
  accounts_count?: number;
  contacts_count?: number;
  total_balance?: number;
}

export interface BankAccount {
  id: string;
  workspace_id: string;
  bank_name: string;
  account_title: string;
  account_number?: string;
  card_number?: string;
  iban?: string;
  holder_name?: string;
  initial_balance: number;
  current_balance: number;
  color: string;
  icon?: string;
  created_at: string;
  total_inflow?: number;
  total_outflow?: number;
}

export interface Contact {
  id: string;
  workspace_id: string;
  name: string;
  type: 'person' | 'merchant';
  phone?: string;
  category?: string;
  card_or_account?: string;
  notes?: string;
  created_at: string;
  // Computed balances
  receivable_amount?: number; // ما از او طلب داریم (قرض داده شده)
  payable_amount?: number;    // ما به او بدهکاریم (قرض گرفته شده)
  net_balance?: number;       // طلب منهای بدهی
  total_paid?: number;        // کل پرداختی‌ها به این مخاطب (هزینه‌ها)
  total_received?: number;    // کل دریافتی‌ها از این مخاطب (درآمدها)
  transaction_count?: number;
}

export interface Transaction {
  id: string;
  workspace_id: string;
  type: TransactionType;
  amount: number;
  title: string;
  category: string;
  bank_account_id?: string;
  destination_account_id?: string;
  contact_id?: string;
  transaction_date: string; // YYYY-MM-DD
  tracking_code?: string;
  notes?: string;
  status: 'completed' | 'pending' | 'cleared';
  created_at: string;

  // Joined metadata
  bank_account_title?: string;
  bank_name?: string;
  destination_account_title?: string;
  destination_bank_name?: string;
  contact_name?: string;
  contact_type?: 'person' | 'merchant';
}

export interface MonthlyReportItem {
  key: string; // e.g. "2024-10" or "1403-08"
  month_name: string;
  year: number;
  month: number;
  income: number;
  expense: number;
  net: number; // income - expense
  cumulative_balance: number;
  transaction_count: number;
}

export interface YearlyReportItem {
  year: number;
  income: number;
  expense: number;
  net: number;
  loan_given: number;
  debt_taken: number;
}

export interface WeeklyReportItem {
  week_label: string;
  start_date: string;
  end_date: string;
  income: number;
  expense: number;
  net: number;
  daily_average: number;
  days: {
    day_name: string;
    date: string;
    income: number;
    expense: number;
  }[];
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  type: 'expense' | 'income';
}

export interface WorkspaceSummary {
  total_balance: number;
  monthly_income: number;
  monthly_expense: number;
  monthly_net: number;
  total_receivable: number; // طلب‌های تسویه نشده
  total_payable: number;    // بدهی‌های تسویه نشده
  active_accounts_count: number;
  active_contacts_count: number;
}
