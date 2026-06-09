import React, { useEffect, useState } from 'react';
import { ShieldAlert, Settings, Award, Users, CheckCircle, Info, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import type { BillingLimits, Customer } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [limits, setLimits] = useState<BillingLimits | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // General settings state
  const [bizName, setBizName] = useState('Wavo Default Workspace');
  const [bizType, setBizType] = useState('Software Services');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchData = async () => {
    try {
      const [limitsData, customersData] = await Promise.all([
        api.getBillingLimits(),
        api.getCustomers()
      ]);
      setLimits(limitsData);
      setCustomers(customersData);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve billing limits.');
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchData();
      setLoading(false);
    };
    init();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <span>Loading tenant settings...</span>
      </div>
    );
  }

  // Calculate limit percentages
  const customerCount = customers.length;
  const maxCustomers = limits?.maxCustomers || 50;
  const customerPercentage = Math.min((customerCount / maxCustomers) * 100, 100);

  // Mock users count (typically at least 1)
  const userCount = 1; 
  const maxUsers = limits?.maxUsers || 1;
  const userPercentage = Math.min((userCount / maxUsers) * 100, 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Settings size={28} style={{ color: 'var(--accent-indigo)' }} />
            Workspace & Billing Settings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Manage your company profile details, check usage quotas, and view subscription details.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--text-danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: General Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Business Configuration</h2>
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Business Workspace Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Industry / Business Vertical</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={bizType}
                  onChange={(e) => setBizType(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary">Save Settings</button>
                {saveSuccess && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle size={14} /> Profile details updated!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Pricing tier upgrade card */}
          <div className="glass-panel pulse-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(20, 184, 166, 0.05) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-teal)' }}>
              <Sparkles size={20} />
              <strong style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subscription Tiers Plan</strong>
            </div>
            <h2>Unlock Advanced CRM Powers</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4rem' }}>
              Upgrade to the Pro or Business plans to unlock unlimited customer records, team seats, automated follow-up dispatchers, and deep AI closing forecasts.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => alert('Billing Portal Checkout session mock started!')}
                style={{ flex: 1 }}
              >
                Upgrade to Pro Plan ($29)
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => alert('Contact Enterprise Sales callback logged!')}
                style={{ flex: 1 }}
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Limits & Subscription Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Subscription Tier Info */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="var(--accent-indigo)" />
                Active Subscription
              </h2>
              <span className="badge badge-indigo" style={{ padding: '0.3rem 0.75rem' }}>
                {limits?.name || 'Free Tier'}
              </span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-translucent)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <strong style={{ color: 'var(--text-success)' }}>{limits?.status || 'ACTIVE'}</strong>
              </div>
              {limits?.billingCycleEnd && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Renewal Date:</span>
                  <strong>{new Date(limits.billingCycleEnd).toLocaleDateString(undefined, { dateStyle: 'medium' })}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Usage quotas ring / slider bars */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2>Workspace Quota Usage</h2>

            {/* Customers limit slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                  <Users size={14} /> Registered Customers
                </span>
                <strong>
                  {customerCount} / {maxCustomers === 1000000 ? 'Unlimited' : maxCustomers}
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${customerPercentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-indigo), var(--accent-teal))',
                  borderRadius: '4px',
                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
                }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {customerPercentage.toFixed(1)}% of your allowed customer slots are occupied.
              </span>
            </div>

            {/* User Seats limit slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                  <Users size={14} /> Active Team Members
                </span>
                <strong>
                  {userCount} / {maxUsers === 1000000 ? 'Unlimited' : maxUsers}
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${userPercentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-indigo), var(--accent-teal))',
                  borderRadius: '4px',
                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
                }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {userPercentage.toFixed(1)}% of user seats are occupied.
              </span>
            </div>

            {customerPercentage >= 90 && (
              <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', color: 'var(--text-warning)', fontSize: '0.75rem', display: 'flex', gap: '0.35rem' }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <span>Approaching subscription limitations. Upgrades will be required to log further client accounts.</span>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
