import React, { useEffect, useState } from 'react';
import { Plus, ShieldAlert, CheckCircle, Clock, FileText } from 'lucide-react';
import { api } from '../services/api';
import type { Invoice, Customer } from '../services/api';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({ paid: 0, pending: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form states - Create Invoice
  const [customerId, setCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [tax, setTax] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Form states - Record Payment
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [transactionRef, setTransactionRef] = useState('');

  const fetchData = async () => {
    try {
      const [invData, custData, statsData] = await Promise.all([
        api.getInvoices(),
        api.getCustomers(),
        api.getRevenueStats()
      ]);
      setInvoices(invData);
      setCustomers(custData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices data.');
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchData();
      setLoading(false);
    };
    init();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !invoiceNumber || !amount || !dueDate) return;

    try {
      await api.createInvoice({
        customerId,
        invoiceNumber,
        amount: parseFloat(amount),
        tax: tax ? parseFloat(tax) : undefined,
        dueDate
      });
      setShowCreateModal(false);
      // Reset form
      setCustomerId('');
      setInvoiceNumber('');
      setAmount('');
      setTax('');
      setDueDate('');
      await fetchData();
    } catch (err: any) {
      setError(`Failed to create invoice: ${err.message}`);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !paymentAmount || !paymentMethod) return;

    try {
      await api.recordPayment({
        invoiceId: selectedInvoice.id,
        amount: parseFloat(paymentAmount),
        paymentMethod,
        transactionReference: transactionRef || undefined
      });
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentAmount('');
      setTransactionRef('');
      await fetchData();
    } catch (err: any) {
      setError(`Failed to record payment: ${err.message}`);
    }
  };

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount((Number(invoice.amount) + Number(invoice.tax)).toString());
    setShowPaymentModal(true);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID':
        return <span className="badge badge-green">Paid</span>;
      case 'SENT':
        return <span className="badge badge-indigo">Sent</span>;
      case 'OVERDUE':
        return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Overdue</span>;
      case 'CANCELLED':
        return <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>Cancelled</span>;
      case 'DRAFT':
      default:
        return <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>Draft</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <span>Loading billing ledgers...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Invoices & Revenue Ledger</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Track sales invoice requests, client payments, and workspace MRR flow.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--text-danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Revenue Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel pulse-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.75rem', borderRadius: '10px', color: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Paid Revenue</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: '#10b981' }}>
              ${stats.paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.75rem', borderRadius: '10px', color: '#818cf8' }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Outstanding</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: '#818cf8' }}>
              ${stats.pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '0.75rem', borderRadius: '10px', color: '#f87171' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Overdue Receivables</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: '#f87171' }}>
              ${stats.overdue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="glass-panel" style={{ overflow: 'hidden', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-translucent)' }}>
              <th style={{ padding: '1rem' }}>Invoice Details</th>
              <th style={{ padding: '1rem' }}>Customer</th>
              <th style={{ padding: '1rem' }}>Total Amount</th>
              <th style={{ padding: '1rem' }}>Due Date</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No billing invoices found. Create one to log workspace deals!
                </td>
              </tr>
            ) : (
              invoices.map(inv => {
                const total = Number(inv.amount) + Number(inv.tax);
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-translucent)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={16} color="var(--text-secondary)" />
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inv.invoiceNumber}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {inv.customer?.fullName || 'Unassigned Customer'}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(inv.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {getStatusBadge(inv.status)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {inv.status !== 'PAID' && inv.status !== 'CANCELLED' ? (
                        <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => openPaymentModal(inv)}>
                          Record Payment
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - Create Invoice */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999
        }}>
          <div className="glass-panel" style={{ width: '450px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2>Create New Invoice</h2>
            <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Associate Customer</label>
                <select 
                  className="input-field"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.company || 'Direct'})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Invoice Number</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. INV-2026-001"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="input-field" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tax ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="input-field" 
                    placeholder="0.00"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Due Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Record Payment */}
      {showPaymentModal && selectedInvoice && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999
        }}>
          <div className="glass-panel" style={{ width: '450px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2>Record Payment</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Confirm transaction logs for invoice <strong style={{ color: 'var(--text-primary)' }}>{selectedInvoice.invoiceNumber}</strong>.
            </p>
            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Amount Settled ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="input-field" 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Payment Method</label>
                <select 
                  className="input-field"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="WhatsApp Pay">WhatsApp Pay</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Transaction Reference (Optional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. TXN-9988223"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
