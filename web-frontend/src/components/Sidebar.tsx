import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  LayoutGrid, 
  CheckSquare, 
  MessageSquare, 
  BrainCircuit, 
  LogOut,
  Sparkles,
  FileText,
  Settings
} from 'lucide-react';
import { api } from '../services/api';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const user = api.getUser();

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/customers', label: 'Customers', icon: <Users size={18} /> },
    { to: '/leads', label: 'Leads (Kanban)', icon: <LayoutGrid size={18} /> },
    { to: '/tasks', label: 'Follow-Ups', icon: <CheckSquare size={18} /> },
    { to: '/invoices', label: 'Invoices', icon: <FileText size={18} /> },
    { to: '/whatsapp', label: 'WA Helper', icon: <MessageSquare size={18} /> },
    { to: '/ai', label: 'AI Insights', icon: <BrainCircuit size={18} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-teal))',
          padding: '0.4rem', 
          borderRadius: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
        }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Wavo CRM
        </span>
      </div>

      {/* User Session Profile Card */}
      {user && (
        <div className="glass-panel" style={{ padding: '0.75rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Workspace</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email.split('@')[0]}
          </span>
          <span className="badge badge-indigo" style={{ fontSize: '0.65rem', alignSelf: 'flex-start', marginTop: '0.2rem' }}>
            {user.role}
          </span>
        </div>
      )}

      {/* Nav List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              textDecoration: 'none',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 500,
              background: isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
              border: isActive ? '1px solid var(--border-translucent)' : '1px solid transparent',
              boxShadow: isActive ? '0 0 15px var(--accent-neon-glow)' : 'none',
              transition: 'all 0.2s ease'
            })}
            className={({ isActive }) => isActive ? 'nav-active' : ''}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout Footer */}
      <button 
        onClick={handleLogout} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--text-danger)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0.75rem 1rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginTop: 'auto',
          borderRadius: '8px',
          width: '100%',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <LogOut size={18} />
        Log Out
      </button>

      {/* Copyright Footer */}
      <div style={{
        marginTop: '1rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        textAlign: 'center',
        fontWeight: 500,
        letterSpacing: '0.02em',
      }}>
        &copy; {new Date().getFullYear()} {atob("U2hhcmF0aCBWIFNoZXR0eQ==")}. All Rights Reserved.
      </div>
    </aside>
  );
};
