import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  initDatabase,
  seedDemoData,
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getBankAccounts,
  getBankAccount,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlyReport,
  getYearlyReport,
  getWeeklyReport,
  getCategoriesReport,
  getWorkspaceSummary
} from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB schema & seed
initDatabase();

const app = express();
app.use(express.json());

// API Routes
app.get('/api/workspaces', (req, res) => {
  try {
    const list = getWorkspaces();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workspaces', (req, res) => {
  try {
    const { name, description, currency, currency_symbol, color, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'نام ورک‌اسپیس الزامی است' });
    const ws = createWorkspace({ name, description, currency, currency_symbol, color, icon });
    res.status(201).json(ws);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/workspaces/:id', (req, res) => {
  try {
    const ws = updateWorkspace(req.params.id, req.body);
    if (!ws) return res.status(404).json({ error: 'ورک‌اسپیس یافت نشد' });
    res.json(ws);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/workspaces/:id', (req, res) => {
  try {
    deleteWorkspace(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workspaces/reset-demo', (req, res) => {
  try {
    seedDemoData();
    res.json({ success: true, message: 'داده‌های نمونه مجدداً بارگذاری شدند' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Bank Accounts
app.get('/api/workspaces/:workspaceId/accounts', (req, res) => {
  try {
    const accounts = getBankAccounts(req.params.workspaceId);
    res.json(accounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workspaces/:workspaceId/accounts', (req, res) => {
  try {
    const { bank_name, account_title, account_number, card_number, iban, holder_name, initial_balance, color, icon } = req.body;
    if (!bank_name || !account_title) {
      return res.status(400).json({ error: 'نام بانک و عنوان حساب الزامی است' });
    }
    const acc = createBankAccount({
      workspace_id: req.params.workspaceId,
      bank_name,
      account_title,
      account_number,
      card_number,
      iban,
      holder_name,
      initial_balance: Number(initial_balance) || 0,
      color,
      icon
    });
    res.status(201).json(acc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/accounts/:id', (req, res) => {
  try {
    const acc = updateBankAccount(req.params.id, req.body);
    if (!acc) return res.status(404).json({ error: 'حساب بانکی یافت نشد' });
    res.json(acc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/accounts/:id', (req, res) => {
  try {
    deleteBankAccount(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Contacts
app.get('/api/workspaces/:workspaceId/contacts', (req, res) => {
  try {
    const contacts = getContacts(req.params.workspaceId);
    res.json(contacts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workspaces/:workspaceId/contacts', (req, res) => {
  try {
    const { name, type, phone, category, card_or_account, notes } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: 'نام و نوع مخاطب الزامی است' });
    }
    const contact = createContact({
      workspace_id: req.params.workspaceId,
      name,
      type: type === 'merchant' ? 'merchant' : 'person',
      phone,
      category,
      card_or_account,
      notes
    });
    res.status(201).json(contact);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/contacts/:id', (req, res) => {
  try {
    const contact = updateContact(req.params.id, req.body);
    if (!contact) return res.status(404).json({ error: 'مخاطب یافت نشد' });
    res.json(contact);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/contacts/:id', (req, res) => {
  try {
    deleteContact(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Transactions
app.get('/api/workspaces/:workspaceId/transactions', (req, res) => {
  try {
    const txs = getTransactions(req.params.workspaceId, {
      type: req.query.type as string,
      bank_account_id: req.query.bank_account_id as string,
      contact_id: req.query.contact_id as string,
      category: req.query.category as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      search: req.query.search as string,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined
    });
    res.json(txs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workspaces/:workspaceId/transactions', (req, res) => {
  try {
    const { type, amount, title, category, bank_account_id, destination_account_id, contact_id, transaction_date, tracking_code, notes, status } = req.body;
    if (!type || !amount || !title) {
      return res.status(400).json({ error: 'نوع تراکنش، مبلغ و عنوان الزامی است' });
    }
    const tx = createTransaction({
      workspace_id: req.params.workspaceId,
      type,
      amount: Number(amount),
      title,
      category,
      bank_account_id,
      destination_account_id,
      contact_id,
      transaction_date,
      tracking_code,
      notes,
      status
    });
    res.status(201).json(tx);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/transactions/:id', (req, res) => {
  try {
    const tx = updateTransaction(req.params.id, req.body);
    if (!tx) return res.status(404).json({ error: 'تراکنش یافت نشد' });
    res.json(tx);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', (req, res) => {
  try {
    deleteTransaction(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics & Reports
app.get('/api/workspaces/:workspaceId/summary', (req, res) => {
  try {
    const summary = getWorkspaceSummary(req.params.workspaceId);
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workspaces/:workspaceId/reports/monthly', (req, res) => {
  try {
    const report = getMonthlyReport(req.params.workspaceId);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workspaces/:workspaceId/reports/yearly', (req, res) => {
  try {
    const report = getYearlyReport(req.params.workspaceId);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workspaces/:workspaceId/reports/weekly', (req, res) => {
  try {
    const report = getWeeklyReport(req.params.workspaceId);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workspaces/:workspaceId/reports/categories', (req, res) => {
  try {
    const report = getCategoriesReport(req.params.workspaceId);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server & Vite Integration
const port = process.env.PORT || 3000;

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

startServer();
