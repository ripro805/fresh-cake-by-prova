import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, RefreshCw, PieChart, CreditCard, Receipt } from 'lucide-react';
import { api } from '../../../api/client';
import { Pagination } from '../../../components/common/Pagination';

export const FinanceTab: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [expPage, setExpPage] = useState(1);
  const [expPageSize, setExpPageSize] = useState(10);

  // Add expense modal state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseCategoryId, setNewExpenseCategoryId] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState<number>(0);
  const [newExpenseMethod, setNewExpenseMethod] = useState('CASH');
  const [newExpenseDate, setNewExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [newExpenseNotes, setNewExpenseNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sum, exps, cats] = await Promise.all([
        api.getFinanceSummary(),
        api.getExpenses(),
        api.getExpenseCategories()
      ]);
      setSummary(sum);
      setExpenses(Array.isArray(exps) ? exps : []);
      setCategories(Array.isArray(cats) ? cats : []);
      if (Array.isArray(cats) && cats.length > 0 && !newExpenseCategoryId) {
        setNewExpenseCategoryId(cats[0].id);
      }
    } catch (err) {
      console.warn('Error loading financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseTitle || newExpenseAmount <= 0 || !newExpenseCategoryId) return;
    setIsSubmitting(true);
    try {
      await api.recordExpense({
        category: newExpenseCategoryId,
        title: newExpenseTitle,
        amount: newExpenseAmount,
        payment_method: newExpenseMethod,
        date: newExpenseDate,
        notes: newExpenseNotes
      });
      setIsAddExpenseOpen(false);
      setNewExpenseTitle('');
      setNewExpenseAmount(0);
      setNewExpenseNotes('');
      await loadData();
    } catch (err) {
      alert('Failed to record expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 1rem auto' }} />
        <p>Calculating P&amp;L accounting metrics from PostgreSQL...</p>
      </div>
    );
  }

  const recognizedRevenue = parseFloat(summary?.recognized_revenue || '0');
  const totalExpenses = parseFloat(summary?.total_expenses || '0');
  const netProfit = parseFloat(summary?.net_profit || '0');
  const cashCollected = parseFloat(summary?.cash_collected || '0');
  const isProfitPositive = netProfit >= 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Business Accounting &amp; Profit/Loss</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Accurate revenue recognition, cash collections, and categorized operating expenses.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadData} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} />
            <span>Refresh Financials</span>
          </button>
          <button onClick={() => setIsAddExpenseOpen(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Card 1: Recognized Revenue */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Recognized Revenue</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#22C55E" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            ৳{recognizedRevenue.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>From verified &amp; delivered orders</span>
        </div>

        {/* Card 2: Cash Collected */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Direct Cash Collected</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#3B82F6" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            ৳{cashCollected.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cash on delivery counter receipts</span>
        </div>

        {/* Card 3: Total Expenses */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Operating Expenses</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={18} color="#EF4444" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            ৳{totalExpenses.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ingredients, boxes, gas &amp; utilities</span>
        </div>

        {/* Card 4: Net Profit */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Net Business Profit</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: isProfitPositive ? 'rgba(217, 185, 155, 0.2)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={18} color="var(--brand-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: isProfitPositive ? '#15803D' : '#EF4444' }}>
            ৳{netProfit.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Net Operating Margin</span>
        </div>
      </div>

      {/* EXPENSE CATEGORY BREAKDOWN */}
      {summary?.categories_breakdown && summary.categories_breakdown.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>Expenses by Category</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {summary.categories_breakdown.map((cat: any) => (
              <div key={cat.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {cat.name}
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ৳{parseFloat(cat.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT EXPENSES LOG */}
      <div className="card">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Recorded Business Expenses</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Showing {expenses.length} expense record{expenses.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Title &amp; Notes</th>
                <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                <th style={{ padding: '0.85rem 1rem' }}>Method</th>
                <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No expenses recorded yet.
                  </td>
                </tr>
              ) : (
                expenses.slice((expPage - 1) * expPageSize, expPage * expPageSize).map((exp) => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ fontWeight: 600 }}>{exp.title}</div>
                      {exp.notes && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{exp.notes}</div>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {exp.category_name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                        {exp.payment_method}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {exp.date}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: 700, color: '#EF4444' }}>
                      -৳{parseFloat(exp.amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '0 1.25rem 1rem 1.25rem' }}>
          <Pagination
            currentPage={expPage}
            totalPages={Math.ceil(expenses.length / expPageSize) || 1}
            totalCount={expenses.length}
            pageSize={expPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            onPageChange={setExpPage}
            onPageSizeChange={(sz) => { setExpPageSize(sz); setExpPage(1); }}
          />
        </div>
      </div>

      {/* RECORD EXPENSE MODAL */}
      {isAddExpenseOpen && (
        <div className="modal-overlay" onClick={() => setIsAddExpenseOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontWeight: 800 }}>
              Record Business Expense
            </h3>

            <form onSubmit={handleAddExpenseSubmit}>
              <div className="form-group">
                <label className="form-label">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Callebaut Dark Chocolate Restock"
                  value={newExpenseTitle}
                  onChange={(e) => setNewExpenseTitle(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  required
                  value={newExpenseCategoryId}
                  onChange={(e) => setNewExpenseCategoryId(e.target.value)}
                  className="form-control"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Amount (৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="1"
                    value={newExpenseAmount || ''}
                    onChange={(e) => setNewExpenseAmount(parseFloat(e.target.value) || 0)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    value={newExpenseMethod}
                    onChange={(e) => setNewExpenseMethod(e.target.value)}
                    className="form-control"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="BANK">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  required
                  value={newExpenseDate}
                  onChange={(e) => setNewExpenseDate(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes / Supplier Details</label>
                <input
                  type="text"
                  placeholder="e.g. Receipt #1042 from Kushtia Market"
                  value={newExpenseNotes}
                  onChange={(e) => setNewExpenseNotes(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Recording...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
