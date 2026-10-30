import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'finance.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      currency TEXT DEFAULT 'IRR',
      currency_symbol TEXT DEFAULT 'تومان',
      color TEXT DEFAULT '#10b981',
      icon TEXT DEFAULT 'wallet',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bank_accounts (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      account_title TEXT NOT NULL,
      account_number TEXT,
      card_number TEXT,
      iban TEXT,
      holder_name TEXT,
      initial_balance REAL DEFAULT 0,
      color TEXT DEFAULT '#3b82f6',
      icon TEXT DEFAULT 'credit-card',
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('person', 'merchant')),
      phone TEXT,
      category TEXT,
      card_or_account TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'loan', 'debt', 'transfer')),
      amount REAL NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      bank_account_id TEXT,
      destination_account_id TEXT,
      contact_id TEXT,
      transaction_date TEXT NOT NULL,
      tracking_code TEXT,
      notes TEXT,
      status TEXT DEFAULT 'completed',
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL,
      FOREIGN KEY (destination_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
    );
  `);

  // Check if workspaces is empty, if so, seed demo data
  const checkWorkspaces = db.prepare('SELECT count(*) as count FROM workspaces').get() as { count: number };
  if (checkWorkspaces.count === 0) {
    seedDemoData();
  }
}

export function seedDemoData() {
  const ws1Id = 'ws_personal';
  const ws2Id = 'ws_freelance';
  const now = new Date().toISOString();

  // Insert Workspaces
  const insertWs = db.prepare(`
    INSERT INTO workspaces (id, name, description, currency, currency_symbol, color, icon, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertWs.run(
    ws1Id,
    'حساب شخصی و منزل',
    'مدیریت گردش حساب‌های روزمره، حقوق، خرج خانه، کارت‌های بانکی و طلب/بدهی',
    'IRR',
    'تومان',
    '#10b981',
    'home',
    now
  );

  insertWs.run(
    ws2Id,
    'کسب‌وکار و فریلنسری',
    'پروژه‌های برنامه‌نویسی، درآمد مشاوره‌ها، پیمانکاران و هزینه‌های سرور',
    'IRR',
    'تومان',
    '#6366f1',
    'briefcase',
    now
  );

  // Bank Accounts for Workspace 1
  const insertAcc = db.prepare(`
    INSERT INTO bank_accounts (id, workspace_id, bank_name, account_title, account_number, card_number, iban, holder_name, initial_balance, color, icon, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAcc.run('acc_saman', ws1Id, 'بانک سامان', 'حساب اصلی حقوق و درآمد', '8201-1234567-1', '6219861012345678', 'IR120560082000000123456789', 'علیرضا رادین', 32000000, '#0284c7', 'landmark', now);
  insertAcc.run('acc_blu', ws1Id, 'بلو بانک (سامان)', 'کارت خرید و روزمره بلو', '4502-9876543-2', '6219861988887777', 'IR450560045000000987654321', 'علیرضا رادین', 8500000, '#06b6d4', 'credit-card', now);
  insertAcc.run('acc_melli', ws1Id, 'بانک ملی', 'سپرده پس‌انداز و اضطراری', '0105-5555555-0', '6037997188223344', 'IR980170000000010555555550', 'علیرضا رادین', 95000000, '#eab308', 'shield', now);
  insertAcc.run('acc_cash', ws1Id, 'کیف پول نقدی', 'موجودی نقد داخل خانه', '', '', '', 'علیرضا رادین', 4200000, '#10b981', 'wallet', now);

  // Bank Accounts for Workspace 2
  insertAcc.run('acc_pasargad', ws2Id, 'بانک پاسارگاد', 'حساب ارزی و دریافتی فریلنس', '201-888-1234-1', '5022291077665544', 'IR550570020100000888123456', 'استودیو نرم‌افزار', 68000000, '#6366f1', 'briefcase', now);
  insertAcc.run('acc_mellat', ws2Id, 'بانک ملت', 'کارت هزینه‌های ابزار و سرور', '4123-7777777-9', '6104337899881122', 'IR330120000000041237777777', 'استودیو نرم‌افزار', 14500000, '#ef4444', 'credit-card', now);

  // Contacts for Workspace 1
  const insertContact = db.prepare(`
    INSERT INTO contacts (id, workspace_id, name, type, phone, category, card_or_account, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertContact.run('c_ali', ws1Id, 'علی رضایی', 'person', '09121112233', 'دوست و همکار', '6037991823451122', 'هم‌دانشگاهی، بابت قرض سفر', now);
  insertContact.run('c_moradi', ws1Id, 'آقای مرادی (صاحبخانه)', 'person', '09123334455', 'مسکن / اجاره', '6104337788990011', 'اجاره‌بهای ماهانه آپارتمان', now);
  insertContact.run('c_ofogh', ws1Id, 'سوپرمارکت افق کوروش', 'merchant', '02188776655', 'خوراک و سوپرمارکت', '', 'خرید خواربار هفتگی خانه', now);
  insertContact.run('c_digikala', ws1Id, 'دیجی‌کالا', 'merchant', '02161930000', 'خرید آنلاین و تجهیزات', '', 'خرید اقلام دیجیتال و خانه', now);
  insertContact.run('c_bagheri', ws1Id, 'دکتر باقری (دندانپزشک)', 'person', '09124445566', 'پزشکی و سلامت', '6274121199887766', 'ارتودنسی و درمان', now);
  insertContact.run('c_company', ws1Id, 'شرکت فناوری نوآوران (کارفرما)', 'merchant', '02122334455', 'کارفرما', '', 'واریز حقوق پایه و پاداش فصلی', now);

  // Contacts for Workspace 2
  insertContact.run('c_hetzner', ws2Id, 'هتزنر آلمان (Hetzner Cloud)', 'merchant', '', 'سرور و هاستینگ', '', 'زیرساخت ابری و سرورها', now);
  insertContact.run('c_client_sam', ws2Id, 'شرکت پترو صنعت (کارفرما)', 'merchant', '02188990011', 'مشتری شرکتی', '', 'پروژه پرتال جامع داخلی', now);

  // Generate date helper
  const dateOffset = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  };

  // Transactions for Workspace 1
  const insertTx = db.prepare(`
    INSERT INTO transactions (id, workspace_id, type, amount, title, category, bank_account_id, destination_account_id, contact_id, transaction_date, tracking_code, notes, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const txs = [
    // Month 0 (Current Month)
    { id: 'tx_1', type: 'income', amount: 48000000, title: 'واریز حقوق ماهانه', category: 'حقوق و دستمزد', acc: 'acc_saman', dest: null, contact: 'c_company', date: dateOffset(2), code: 'TRK-98231', notes: 'حقوق ماه جاری + پاداش ارزیابی' },
    { id: 'tx_2', type: 'expense', amount: 12000000, title: 'اجاره بهای ماه جاری', category: 'اجاره و مسکن', acc: 'acc_saman', dest: null, contact: 'c_moradi', date: dateOffset(4), code: 'TRK-98102', notes: 'اجاره ماه مهر آپارتمان' },
    { id: 'tx_3', type: 'transfer', amount: 6000000, title: 'شارژ کارت خرج روزمره بلو', category: 'انتقال حساب', acc: 'acc_saman', dest: 'acc_blu', contact: null, date: dateOffset(5), code: 'TRK-97880', notes: 'انتقال داخلی بین حساب سامان به بلو' },
    { id: 'tx_4', type: 'expense', amount: 2450000, title: 'خرید مواد غذایی هفتگی', category: 'خوراک و سوپرمارکت', acc: 'acc_blu', dest: null, contact: 'c_ofogh', date: dateOffset(6), code: 'POS-44321', notes: 'گوشت، برنج، لبنیات' },
    { id: 'tx_5', type: 'loan', amount: 7500000, title: 'قرض به علی برای شهریه', category: 'قرض و مطالبات', acc: 'acc_saman', dest: null, contact: 'c_ali', date: dateOffset(8), code: 'TRK-96541', notes: 'مقرر شد تا پایان ماه بعد بازگرداند' },
    { id: 'tx_6', type: 'expense', amount: 3800000, title: 'خرید مانیتور کار', category: 'تجهیزات و فناوری', acc: 'acc_blu', dest: null, contact: 'c_digikala', date: dateOffset(11), code: 'DK-778899', notes: 'تجهیزات هوم آفیس' },
    { id: 'tx_7', type: 'expense', amount: 1900000, title: 'هزینه دندانپزشکی', category: 'پزشکی و سلامت', acc: 'acc_blu', dest: null, contact: 'c_bagheri', date: dateOffset(14), code: 'POS-11223', notes: 'ویزیت دوره‌ای' },
    { id: 'tx_8', type: 'expense', amount: 850000, title: 'بنزین و عوارض اتوبان', category: 'حمل‌ونقل', acc: 'acc_cash', dest: null, contact: null, date: dateOffset(16), code: '', notes: 'پرداخت نقدی' },
    { id: 'tx_9', type: 'income', amount: 9500000, title: 'تسویه طلب قدیمی از شرکت', category: 'سایر درآمدها', acc: 'acc_saman', dest: null, contact: 'c_company', date: dateOffset(19), code: 'TRK-94301', notes: 'حق ماموریت ماه قبل' },
    { id: 'tx_10', type: 'debt', amount: 10000000, title: 'دریافت وام/قرض از دوست', category: 'بدهی و تعهدات', acc: 'acc_saman', dest: null, contact: 'c_ali', date: dateOffset(22), code: 'TRK-92100', notes: 'قرض کوتاه مدت' },
    
    // Month -1
    { id: 'tx_11', type: 'income', amount: 46000000, title: 'واریز حقوق ماه گذشته', category: 'حقوق و دستمزد', acc: 'acc_saman', dest: null, contact: 'c_company', date: dateOffset(33), code: 'TRK-91001', notes: 'حقوق شهریور' },
    { id: 'tx_12', type: 'expense', amount: 12000000, title: 'اجاره بهای ماه گذشته', category: 'اجاره و مسکن', acc: 'acc_saman', dest: null, contact: 'c_moradi', date: dateOffset(34), code: 'TRK-90998', notes: 'اجاره شهریور' },
    { id: 'tx_13', type: 'expense', amount: 5600000, title: 'خرید مایحتاج منزل و سوپرمارکت', category: 'خوراک و سوپرمارکت', acc: 'acc_blu', dest: null, contact: 'c_ofogh', date: dateOffset(38), code: 'POS-88991', notes: 'خرید کلی اول ماه' },
    { id: 'tx_14', type: 'expense', amount: 3200000, title: 'سرویس دوره‌ای خودرو', category: 'حمل‌ونقل', acc: 'acc_saman', dest: null, contact: null, date: dateOffset(42), code: 'POS-55441', notes: 'تعویض روغن و لنت' },
    { id: 'tx_15', type: 'transfer', amount: 15000000, title: 'انتقال به صندوق اضطراری ملی', category: 'پس‌انداز و سرمایه‌گذاری', acc: 'acc_saman', dest: 'acc_melli', contact: null, date: dateOffset(45), code: 'TRK-88120', notes: 'پس‌انداز ماهانه' },
    
    // Month -2
    { id: 'tx_16', type: 'income', amount: 45000000, title: 'واریز حقوق مرداد', category: 'حقوق و دستمزد', acc: 'acc_saman', dest: null, contact: 'c_company', date: dateOffset(65), code: 'TRK-86001', notes: 'حقوق مرداد' },
    { id: 'tx_17', type: 'expense', amount: 12000000, title: 'اجاره بهای مرداد', category: 'اجاره و مسکن', acc: 'acc_saman', dest: null, contact: 'c_moradi', date: dateOffset(66), code: 'TRK-85901', notes: 'اجاره مرداد' },
    { id: 'tx_18', type: 'expense', amount: 7800000, title: 'سفر تفریحی شمال', category: 'تفریح و سفر', acc: 'acc_blu', dest: null, contact: null, date: dateOffset(70), code: 'POS-33211', notes: 'اقامتگاه و مخارج سفر' },
    { id: 'tx_19', type: 'income', amount: 14000000, title: 'پاداش پروژه نرم‌افزاری', category: 'پاداش و پورسانت', acc: 'acc_saman', dest: null, contact: 'c_company', date: dateOffset(75), code: 'TRK-84321', notes: 'پاداش فاز اول پروژه' },
    { id: 'tx_20', type: 'expense', amount: 4100000, title: 'پوشاک و لوازم شخصی', category: 'پوشاک و لوازم', acc: 'acc_blu', dest: null, contact: null, date: dateOffset(80), code: 'POS-22119', notes: 'خرید فصلی' },

    // Month -3
    { id: 'tx_21', type: 'income', amount: 44000000, title: 'حقوق تیرماه', category: 'حقوق و دستمزد', acc: 'acc_saman', dest: null, contact: 'c_company', date: dateOffset(95), code: 'TRK-80120', notes: 'حقوق تیرماه' },
    { id: 'tx_22', type: 'expense', amount: 11500000, title: 'اجاره بهای مسکن', category: 'اجاره و مسکن', acc: 'acc_saman', dest: null, contact: 'c_moradi', date: dateOffset(96), code: 'TRK-80011', notes: 'اجاره تیر' },
    { id: 'tx_23', type: 'expense', amount: 6200000, title: 'بیمه تکمیلی و دارو', category: 'پزشکی و سلامت', acc: 'acc_saman', dest: null, contact: null, date: dateOffset(102), code: 'POS-10029', notes: 'تمدید بیمه سالانه' },

    // Month -4
    { id: 'tx_24', type: 'income', amount: 43000000, title: 'حقوق خردادماه', category: 'حقوق و دستمزد', acc: 'acc_saman', dest: null, contact: 'c_company', date: dateOffset(125), code: 'TRK-75432', notes: 'حقوق خرداد' },
    { id: 'tx_25', type: 'expense', amount: 11500000, title: 'اجاره مسکن', category: 'اجاره و مسکن', acc: 'acc_saman', dest: null, contact: 'c_moradi', date: dateOffset(126), code: 'TRK-75400', notes: 'اجاره خرداد' },
    { id: 'tx_26', type: 'expense', amount: 3900000, title: 'خرید کتاب و آموزش آنلاین', category: 'آموزش و توسعه', acc: 'acc_blu', dest: null, contact: null, date: dateOffset(130), code: 'ONL-44123', notes: 'دوره معماری نرم‌افزار' },

    // Month -5
    { id: 'tx_27', type: 'income', amount: 42000000, title: 'حقوق اردیبهشت', category: 'حقوق و دستمزد', acc: 'acc_saman', dest: null, contact: 'c_company', date: dateOffset(155), code: 'TRK-70981', notes: 'حقوق اردیبهشت' },
    { id: 'tx_28', type: 'expense', amount: 11500000, title: 'اجاره مسکن', category: 'اجاره و مسکن', acc: 'acc_saman', dest: null, contact: 'c_moradi', date: dateOffset(156), code: 'TRK-70900', notes: 'اجاره اردیبهشت' }
  ];

  for (const t of txs) {
    insertTx.run(
      t.id,
      ws1Id,
      t.type,
      t.amount,
      t.title,
      t.category,
      t.acc,
      t.dest,
      t.contact,
      t.date,
      t.code,
      t.notes,
      'completed',
      now
    );
  }

  // Workspace 2 Transactions
  insertTx.run('tx_freelance_1', ws2Id, 'income', 85000000, 'پیش‌پرداخت پروژه اتوماسیون پتروشیمی', 'قرارداد نرم‌افزاری', 'acc_pasargad', null, 'c_client_sam', dateOffset(7), 'PAY-88210', 'فاز ۱ طراحی و دیتابیس', 'completed', now);
  insertTx.run('tx_freelance_2', ws2Id, 'expense', 4800000, 'تمدید سرورهای اختصاصی Hetzner', 'سرور و هاستینگ', 'acc_mellat', null, 'c_hetzner', dateOffset(12), 'INV-HETZ-99', 'سه ماهه اختصاصی', 'completed', now);
  insertTx.run('tx_freelance_3', ws2Id, 'income', 32000000, 'پروژه مشاوره فنی سیستم‌های توزیع‌شده', 'مشاوره و طراحی', 'acc_pasargad', null, null, dateOffset(25), 'PAY-77123', 'تسویه نهایی مشاوره', 'completed', now);
}

// ==========================================
// DB Query & Mutation Helpers
// ==========================================

export function getWorkspaces() {
  const query = db.prepare(`
    SELECT 
      w.*,
      (SELECT COUNT(*) FROM bank_accounts ba WHERE ba.workspace_id = w.id) as accounts_count,
      (SELECT COUNT(*) FROM contacts c WHERE c.workspace_id = w.id) as contacts_count
    FROM workspaces w
    ORDER BY w.created_at ASC
  `);
  const list = query.all() as any[];

  // Attach calculated total balance for each workspace
  return list.map(ws => {
    const balance = calculateWorkspaceTotalBalance(ws.id);
    return { ...ws, total_balance: balance };
  });
}

export function getWorkspace(id: string) {
  const query = db.prepare('SELECT * FROM workspaces WHERE id = ?');
  return query.get(id);
}

export function createWorkspace(data: { name: string; description?: string; currency?: string; currency_symbol?: string; color?: string; icon?: string }) {
  const id = 'ws_' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO workspaces (id, name, description, currency, currency_symbol, color, icon, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    data.name,
    data.description || '',
    data.currency || 'IRR',
    data.currency_symbol || 'تومان',
    data.color || '#10b981',
    data.icon || 'wallet',
    now
  );
  return getWorkspace(id);
}

export function updateWorkspace(id: string, data: { name?: string; description?: string; currency?: string; currency_symbol?: string; color?: string; icon?: string }) {
  const current = getWorkspace(id) as any;
  if (!current) return null;
  const stmt = db.prepare(`
    UPDATE workspaces
    SET name = ?, description = ?, currency = ?, currency_symbol = ?, color = ?, icon = ?
    WHERE id = ?
  `);
  stmt.run(
    data.name ?? current.name,
    data.description ?? current.description,
    data.currency ?? current.currency,
    data.currency_symbol ?? current.currency_symbol,
    data.color ?? current.color,
    data.icon ?? current.icon,
    id
  );
  return getWorkspace(id);
}

export function deleteWorkspace(id: string) {
  const stmt = db.prepare('DELETE FROM workspaces WHERE id = ?');
  stmt.run(id);
  return true;
}

// ------------------------------------------
// Bank Accounts
// ------------------------------------------

export function getBankAccounts(workspaceId: string) {
  const query = db.prepare(`
    SELECT * FROM bank_accounts WHERE workspace_id = ? ORDER BY created_at ASC
  `);
  const accounts = query.all(workspaceId) as any[];

  return accounts.map(acc => {
    const computed = computeAccountBalance(acc.id, acc.initial_balance);
    return {
      ...acc,
      current_balance: computed.currentBalance,
      total_inflow: computed.totalInflow,
      total_outflow: computed.totalOutflow
    };
  });
}

export function getBankAccount(id: string) {
  const query = db.prepare('SELECT * FROM bank_accounts WHERE id = ?');
  const acc = query.get(id) as any;
  if (!acc) return null;
  const computed = computeAccountBalance(acc.id, acc.initial_balance);
  return {
    ...acc,
    current_balance: computed.currentBalance,
    total_inflow: computed.totalInflow,
    total_outflow: computed.totalOutflow
  };
}

export function createBankAccount(data: {
  workspace_id: string;
  bank_name: string;
  account_title: string;
  account_number?: string;
  card_number?: string;
  iban?: string;
  holder_name?: string;
  initial_balance?: number;
  color?: string;
  icon?: string;
}) {
  const id = 'acc_' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO bank_accounts (id, workspace_id, bank_name, account_title, account_number, card_number, iban, holder_name, initial_balance, color, icon, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    data.workspace_id,
    data.bank_name,
    data.account_title,
    data.account_number || '',
    data.card_number || '',
    data.iban || '',
    data.holder_name || '',
    Number(data.initial_balance) || 0,
    data.color || '#3b82f6',
    data.icon || 'credit-card',
    now
  );
  return getBankAccount(id);
}

export function updateBankAccount(id: string, data: any) {
  const current = getBankAccount(id) as any;
  if (!current) return null;
  const stmt = db.prepare(`
    UPDATE bank_accounts
    SET bank_name = ?, account_title = ?, account_number = ?, card_number = ?, iban = ?, holder_name = ?, initial_balance = ?, color = ?, icon = ?
    WHERE id = ?
  `);
  stmt.run(
    data.bank_name ?? current.bank_name,
    data.account_title ?? current.account_title,
    data.account_number ?? current.account_number,
    data.card_number ?? current.card_number,
    data.iban ?? current.iban,
    data.holder_name ?? current.holder_name,
    data.initial_balance !== undefined ? Number(data.initial_balance) : current.initial_balance,
    data.color ?? current.color,
    data.icon ?? current.icon,
    id
  );
  return getBankAccount(id);
}

export function deleteBankAccount(id: string) {
  const stmt = db.prepare('DELETE FROM bank_accounts WHERE id = ?');
  stmt.run(id);
  return true;
}

function computeAccountBalance(accountId: string, initialBalance: number) {
  // Inflow: type 'income', or 'debt' (borrowing increases cash in bank), or transfer into this destination account
  const inStmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM transactions
    WHERE status = 'completed' AND (
      (bank_account_id = ? AND type IN ('income', 'debt'))
      OR
      (destination_account_id = ? AND type = 'transfer')
    )
  `);
  const inRes = inStmt.get(accountId, accountId) as { total: number };

  // Outflow: type 'expense', or 'loan' (giving cash to someone decreases bank), or transfer out of this bank account
  const outStmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM transactions
    WHERE status = 'completed' AND bank_account_id = ? AND type IN ('expense', 'loan', 'transfer')
  `);
  const outRes = outStmt.get(accountId) as { total: number };

  const totalInflow = inRes.total;
  const totalOutflow = outRes.total;
  const currentBalance = (initialBalance || 0) + totalInflow - totalOutflow;

  return { currentBalance, totalInflow, totalOutflow };
}

function calculateWorkspaceTotalBalance(workspaceId: string) {
  const accounts = db.prepare('SELECT id, initial_balance FROM bank_accounts WHERE workspace_id = ?').all(workspaceId) as any[];
  let total = 0;
  for (const acc of accounts) {
    const comp = computeAccountBalance(acc.id, acc.initial_balance);
    total += comp.currentBalance;
  }
  return total;
}

// ------------------------------------------
// Contacts
// ------------------------------------------

export function getContacts(workspaceId: string) {
  const query = db.prepare('SELECT * FROM contacts WHERE workspace_id = ? ORDER BY name ASC');
  const contacts = query.all(workspaceId) as any[];

  return contacts.map(c => {
    // Loans given to this person (we are owed / receivable)
    const loanStmt = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM transactions
      WHERE workspace_id = ? AND contact_id = ? AND type = 'loan' AND status = 'completed'
    `);
    const loanRes = loanStmt.get(workspaceId, c.id) as { total: number };

    // Debts taken from this person (we owe / payable)
    const debtStmt = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM transactions
      WHERE workspace_id = ? AND contact_id = ? AND type = 'debt' AND status = 'completed'
    `);
    const debtRes = debtStmt.get(workspaceId, c.id) as { total: number };

    // Expense paid to this contact (e.g. merchant)
    const expStmt = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM transactions
      WHERE workspace_id = ? AND contact_id = ? AND type = 'expense' AND status = 'completed'
    `);
    const expRes = expStmt.get(workspaceId, c.id) as { total: number };

    // Income received from this contact (e.g. employer, payer)
    const incStmt = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM transactions
      WHERE workspace_id = ? AND contact_id = ? AND type = 'income' AND status = 'completed'
    `);
    const incRes = incStmt.get(workspaceId, c.id) as { total: number };

    const countStmt = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE workspace_id = ? AND contact_id = ?');
    const countRes = countStmt.get(workspaceId, c.id) as { count: number };

    return {
      ...c,
      receivable_amount: loanRes.total,
      payable_amount: debtRes.total,
      net_balance: loanRes.total - debtRes.total,
      total_paid: expRes.total,
      total_received: incRes.total,
      transaction_count: countRes.count
    };
  });
}

export function getContact(id: string) {
  const stmt = db.prepare('SELECT * FROM contacts WHERE id = ?');
  return stmt.get(id);
}

export function createContact(data: {
  workspace_id: string;
  name: string;
  type: 'person' | 'merchant';
  phone?: string;
  category?: string;
  card_or_account?: string;
  notes?: string;
}) {
  const id = 'c_' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO contacts (id, workspace_id, name, type, phone, category, card_or_account, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    data.workspace_id,
    data.name,
    data.type,
    data.phone || '',
    data.category || '',
    data.card_or_account || '',
    data.notes || '',
    now
  );
  return getContact(id);
}

export function updateContact(id: string, data: any) {
  const current = getContact(id) as any;
  if (!current) return null;
  const stmt = db.prepare(`
    UPDATE contacts
    SET name = ?, type = ?, phone = ?, category = ?, card_or_account = ?, notes = ?
    WHERE id = ?
  `);
  stmt.run(
    data.name ?? current.name,
    data.type ?? current.type,
    data.phone ?? current.phone,
    data.category ?? current.category,
    data.card_or_account ?? current.card_or_account,
    data.notes ?? current.notes,
    id
  );
  return getContact(id);
}

export function deleteContact(id: string) {
  const stmt = db.prepare('DELETE FROM contacts WHERE id = ?');
  stmt.run(id);
  return true;
}

// ------------------------------------------
// Transactions
// ------------------------------------------

export function getTransactions(workspaceId: string, filters: {
  type?: string;
  bank_account_id?: string;
  contact_id?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  let sql = `
    SELECT 
      t.*,
      src.account_title as bank_account_title,
      src.bank_name as bank_name,
      dst.account_title as destination_account_title,
      dst.bank_name as destination_bank_name,
      c.name as contact_name,
      c.type as contact_type
    FROM transactions t
    LEFT JOIN bank_accounts src ON t.bank_account_id = src.id
    LEFT JOIN bank_accounts dst ON t.destination_account_id = dst.id
    LEFT JOIN contacts c ON t.contact_id = c.id
    WHERE t.workspace_id = ?
  `;

  const params: any[] = [workspaceId];

  if (filters.type && filters.type !== 'all') {
    sql += ' AND t.type = ?';
    params.push(filters.type);
  }

  if (filters.bank_account_id && filters.bank_account_id !== 'all') {
    sql += ' AND (t.bank_account_id = ? OR t.destination_account_id = ?)';
    params.push(filters.bank_account_id, filters.bank_account_id);
  }

  if (filters.contact_id && filters.contact_id !== 'all') {
    sql += ' AND t.contact_id = ?';
    params.push(filters.contact_id);
  }

  if (filters.category && filters.category !== 'all') {
    sql += ' AND t.category = ?';
    params.push(filters.category);
  }

  if (filters.startDate) {
    sql += ' AND t.transaction_date >= ?';
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    sql += ' AND t.transaction_date <= ?';
    params.push(filters.endDate);
  }

  if (filters.search) {
    sql += ' AND (t.title LIKE ? OR t.category LIKE ? OR t.notes LIKE ? OR t.tracking_code LIKE ?)';
    const term = `%${filters.search}%`;
    params.push(term, term, term, term);
  }

  sql += ' ORDER BY t.transaction_date DESC, t.created_at DESC';

  if (filters.limit) {
    sql += ' LIMIT ?';
    params.push(Number(filters.limit));
    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(Number(filters.offset));
    }
  }

  const query = db.prepare(sql);
  return query.all(...params);
}

export function getTransaction(id: string) {
  const stmt = db.prepare(`
    SELECT 
      t.*,
      src.account_title as bank_account_title,
      src.bank_name as bank_name,
      dst.account_title as destination_account_title,
      dst.bank_name as destination_bank_name,
      c.name as contact_name,
      c.type as contact_type
    FROM transactions t
    LEFT JOIN bank_accounts src ON t.bank_account_id = src.id
    LEFT JOIN bank_accounts dst ON t.destination_account_id = dst.id
    LEFT JOIN contacts c ON t.contact_id = c.id
    WHERE t.id = ?
  `);
  return stmt.get(id);
}

export function createTransaction(data: {
  workspace_id: string;
  type: string;
  amount: number;
  title: string;
  category: string;
  bank_account_id?: string;
  destination_account_id?: string;
  contact_id?: string;
  transaction_date: string;
  tracking_code?: string;
  notes?: string;
  status?: string;
}) {
  const id = 'tx_' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO transactions (id, workspace_id, type, amount, title, category, bank_account_id, destination_account_id, contact_id, transaction_date, tracking_code, notes, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    data.workspace_id,
    data.type,
    Number(data.amount) || 0,
    data.title,
    data.category || 'متفرقه',
    data.bank_account_id || null,
    data.destination_account_id || null,
    data.contact_id || null,
    data.transaction_date || new Date().toISOString().slice(0, 10),
    data.tracking_code || '',
    data.notes || '',
    data.status || 'completed',
    now
  );
  return getTransaction(id);
}

export function updateTransaction(id: string, data: any) {
  const current = getTransaction(id) as any;
  if (!current) return null;
  const stmt = db.prepare(`
    UPDATE transactions
    SET type = ?, amount = ?, title = ?, category = ?, bank_account_id = ?, destination_account_id = ?, contact_id = ?, transaction_date = ?, tracking_code = ?, notes = ?, status = ?
    WHERE id = ?
  `);
  stmt.run(
    data.type ?? current.type,
    data.amount !== undefined ? Number(data.amount) : current.amount,
    data.title ?? current.title,
    data.category ?? current.category,
    data.bank_account_id !== undefined ? (data.bank_account_id || null) : current.bank_account_id,
    data.destination_account_id !== undefined ? (data.destination_account_id || null) : current.destination_account_id,
    data.contact_id !== undefined ? (data.contact_id || null) : current.contact_id,
    data.transaction_date ?? current.transaction_date,
    data.tracking_code ?? current.tracking_code,
    data.notes ?? current.notes,
    data.status ?? current.status,
    id
  );
  return getTransaction(id);
}

export function deleteTransaction(id: string) {
  const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
  stmt.run(id);
  return true;
}

// ------------------------------------------
// Reports & Analytics
// ------------------------------------------

export function getMonthlyReport(workspaceId: string) {
  // Query monthly aggregates over the past 12 months
  const query = db.prepare(`
    SELECT 
      strftime('%Y-%m', transaction_date) as month_key,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
      SUM(CASE WHEN type = 'loan' THEN amount ELSE 0 END) as loan_given,
      SUM(CASE WHEN type = 'debt' THEN amount ELSE 0 END) as debt_taken,
      COUNT(*) as count
    FROM transactions
    WHERE workspace_id = ? AND status = 'completed'
    GROUP BY strftime('%Y-%m', transaction_date)
    ORDER BY month_key ASC
  `);

  const rows = query.all(workspaceId) as any[];

  // Fill in past 6-12 months if sparse
  let cumulative = 0;
  return rows.map(r => {
    const net = (r.income || 0) - (r.expense || 0);
    cumulative += net;
    return {
      key: r.month_key,
      income: r.income || 0,
      expense: r.expense || 0,
      net,
      loan_given: r.loan_given || 0,
      debt_taken: r.debt_taken || 0,
      cumulative_balance: cumulative,
      transaction_count: r.count
    };
  });
}

export function getYearlyReport(workspaceId: string) {
  const query = db.prepare(`
    SELECT 
      strftime('%Y', transaction_date) as year,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
      SUM(CASE WHEN type = 'loan' THEN amount ELSE 0 END) as loan_given,
      SUM(CASE WHEN type = 'debt' THEN amount ELSE 0 END) as debt_taken
    FROM transactions
    WHERE workspace_id = ? AND status = 'completed'
    GROUP BY strftime('%Y', transaction_date)
    ORDER BY year ASC
  `);
  const rows = query.all(workspaceId) as any[];

  return rows.map(r => ({
    year: Number(r.year),
    income: r.income || 0,
    expense: r.expense || 0,
    net: (r.income || 0) - (r.expense || 0),
    loan_given: r.loan_given || 0,
    debt_taken: r.debt_taken || 0
  }));
}

export function getWeeklyReport(workspaceId: string) {
  // Last 28 days grouped by 7-day intervals (4 weeks)
  const today = new Date();
  const weeks = [];

  for (let i = 0; i < 4; i++) {
    const end = new Date(today);
    end.setDate(end.getDate() - (i * 7));
    const start = new Date(end);
    start.setDate(start.getDate() - 6);

    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    const stmt = db.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE workspace_id = ? AND status = 'completed' AND transaction_date BETWEEN ? AND ?
    `);
    const res = stmt.get(workspaceId, startStr, endStr) as any;

    // Day by day details for this week
    const days = [];
    for (let d = 0; d < 7; d++) {
      const cur = new Date(start);
      cur.setDate(cur.getDate() + d);
      const curStr = cur.toISOString().slice(0, 10);
      const dayStmt = db.prepare(`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM transactions
        WHERE workspace_id = ? AND status = 'completed' AND transaction_date = ?
      `);
      const dayRes = dayStmt.get(workspaceId, curStr) as any;
      days.push({
        date: curStr,
        day_name: cur.toLocaleDateString('fa-IR', { weekday: 'short' }),
        income: dayRes.income || 0,
        expense: dayRes.expense || 0
      });
    }

    const income = res.income || 0;
    const expense = res.expense || 0;
    weeks.unshift({
      week_label: i === 0 ? 'هفته جاری' : `هفته ${i + 1} قبل`,
      start_date: startStr,
      end_date: endStr,
      income,
      expense,
      net: income - expense,
      daily_average: Math.round(expense / 7),
      days
    });
  }

  return weeks;
}

export function getCategoriesReport(workspaceId: string) {
  const expStmt = db.prepare(`
    SELECT category, SUM(amount) as amount, COUNT(*) as count
    FROM transactions
    WHERE workspace_id = ? AND type = 'expense' AND status = 'completed'
    GROUP BY category
    ORDER BY amount DESC
  `);
  const expenseRows = expStmt.all(workspaceId) as any[];
  const totalExp = expenseRows.reduce((acc, r) => acc + (r.amount || 0), 0) || 1;

  const expenses = expenseRows.map(r => ({
    category: r.category,
    amount: r.amount,
    percentage: Math.round((r.amount / totalExp) * 100),
    count: r.count,
    type: 'expense'
  }));

  const incStmt = db.prepare(`
    SELECT category, SUM(amount) as amount, COUNT(*) as count
    FROM transactions
    WHERE workspace_id = ? AND type = 'income' AND status = 'completed'
    GROUP BY category
    ORDER BY amount DESC
  `);
  const incomeRows = incStmt.all(workspaceId) as any[];
  const totalInc = incomeRows.reduce((acc, r) => acc + (r.amount || 0), 0) || 1;

  const incomes = incomeRows.map(r => ({
    category: r.category,
    amount: r.amount,
    percentage: Math.round((r.amount / totalInc) * 100),
    count: r.count,
    type: 'income'
  }));

  return { expenses, incomes, total_expense: totalExp, total_income: totalInc };
}

export function getWorkspaceSummary(workspaceId: string) {
  const totalBalance = calculateWorkspaceTotalBalance(workspaceId);

  // Current month income & expense
  const now = new Date();
  const curMonthPrefix = now.toISOString().slice(0, 7); // YYYY-MM
  const monthStmt = db.prepare(`
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM transactions
    WHERE workspace_id = ? AND status = 'completed' AND transaction_date LIKE ?
  `);
  const monthRes = monthStmt.get(workspaceId, `${curMonthPrefix}%`) as any;

  // Receivables (loans given)
  const recStmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM transactions
    WHERE workspace_id = ? AND type = 'loan' AND status = 'completed'
  `);
  const recRes = recStmt.get(workspaceId) as { total: number };

  // Payables (debts taken)
  const payStmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM transactions
    WHERE workspace_id = ? AND type = 'debt' AND status = 'completed'
  `);
  const payRes = payStmt.get(workspaceId) as { total: number };

  const accCountStmt = db.prepare('SELECT COUNT(*) as count FROM bank_accounts WHERE workspace_id = ?');
  const accCount = (accCountStmt.get(workspaceId) as any)?.count || 0;

  const contactCountStmt = db.prepare('SELECT COUNT(*) as count FROM contacts WHERE workspace_id = ?');
  const contactCount = (contactCountStmt.get(workspaceId) as any)?.count || 0;

  return {
    total_balance: totalBalance,
    monthly_income: monthRes.income || 0,
    monthly_expense: monthRes.expense || 0,
    monthly_net: (monthRes.income || 0) - (monthRes.expense || 0),
    total_receivable: recRes.total,
    total_payable: payRes.total,
    active_accounts_count: accCount,
    active_contacts_count: contactCount
  };
}
