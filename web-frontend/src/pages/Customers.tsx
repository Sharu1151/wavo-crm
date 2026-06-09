import React, { useEffect, useState } from 'react';
import { Plus, ShieldAlert, Phone, Mail, Folder } from 'lucide-react';
import { api } from '../services/api';
import type { Customer } from '../services/api';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add customer form
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');

  const fetchCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer list.');
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchCustomers();
      setLoading(false);
    };
    init();
  }, []);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !mobileNumber) return;

    try {
      await api.createCustomer({
        fullName,
        mobileNumber,
        email: email || undefined,
        company: company || undefined,
        notes: notes || undefined
      });
      setShowAddModal(false);
      setFullName('');
      setMobileNumber('');
      setEmail('');
      setCompany('');
      setNotes('');
      fetchCustomers();
    } catch (err: any) {
      setError(`Failed to create customer: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <span>Loading customer records...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Customer Repository</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Store contact databases and logs for lead interactions.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--text-danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Table grid */}
      <div className="glass-panel" style={{ overflow: 'hidden', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-translucent)' }}>
              <th style={{ padding: '1rem' }}>Name / Company</th>
              <th style={{ padding: '1rem' }}>Contact Info</th>
              <th style={{ padding: '1rem' }}>Lead Source</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Registered Date</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No customer records found. Add a customer to get started!
                </td>
              </tr>
            ) : (
              customers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-translucent)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.fullName}</span>
                      {c.company && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Folder size={10} /> {c.company}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                        <Phone size={10} /> {c.mobileNumber}
                      </span>
                      {c.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                          <Mail size={10} /> {c.email}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>{c.source}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>{c.status}</span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(c.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal Overlay */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div className="glass-panel" style={{ width: '450px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2>Register New Customer</h2>
            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Alice Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mobile Number (with country code)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. +15550001"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email Address</label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="e.g. alice@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Company Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Apex Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Notes / Specifications</label>
                <textarea 
                  className="input-field" 
                  placeholder="Additional client details..."
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
