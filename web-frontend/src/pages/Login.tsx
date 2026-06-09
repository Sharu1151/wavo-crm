import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = () => {
    setEmail('owner@wavo.com');
    setPassword('password123');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: '100vh',
      padding: '1rem',
      background: 'var(--bg-space)'
    }}>
      <div className="glass-panel pulse-card" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-teal))',
            padding: '0.6rem', 
            borderRadius: '12px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
          }}>
            <Sparkles size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem' }}>Wavo CRM</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Turn Conversations Into Customers
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="glass-panel" style={{
          padding: '0.75rem 1rem',
          background: 'rgba(99, 102, 241, 0.06)',
          border: '1px dashed rgba(99, 102, 241, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#818cf8' }}>Seeded Dev Account:</span>
            <button 
              onClick={autofillDemo} 
              type="button"
              style={{
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                border: 'none',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Autofill Credentials
            </button>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <strong>Email:</strong> owner@wavo.com | <strong>Pass:</strong> password123
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: 'var(--text-danger)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Email input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={14} />
              Email Address
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={14} />
              Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
