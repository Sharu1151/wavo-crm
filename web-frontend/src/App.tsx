import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { KanbanLeads } from './pages/KanbanLeads';
import { TasksPage } from './pages/TasksPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { WhatsAppPage } from './pages/WhatsAppPage';
import { AIPage } from './pages/AIPage';
import { SettingsPage } from './pages/SettingsPage';

// Auth Guard Wrapper
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('wavo_access_token');
  const location = useLocation();

  if (!token) {
    // Redirect to login page but save the target location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Layout wrapper for authenticated pages
const AppLayout: React.FC = () => {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="leads" element={<KanbanLeads />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="whatsapp" element={<WhatsAppPage />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const LicenseIntegrityCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const _0x4c2a = [
    'U2hhcmF0aCBWIFNoZXR0eQ==', // Sharath V Shetty
    'UHJvcHJpZXRhcnkgLSBBbGwgUmlnaHRzIFJlc2VydmVk', // Proprietary - All Rights Reserved
    'System Lock: License Integrity Violation',
    'This software application is proprietary and registered under copyright law. Any unauthorized modification, redistribution, or removal of the owner credentials will deactivate the software.',
    'Contact owner: sharath@wavo.com'
  ];

  try {
    const owner = atob(_0x4c2a[0]);
    const license = atob(_0x4c2a[1]);
    
    // Integrity verification
    if (owner !== "Sharath V Shetty" || license !== "Proprietary - All Rights Reserved") {
      throw new Error();
    }
  } catch (e) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#0c0d0e',
        color: '#e2e8f0',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '2rem',
        textAlign: 'center',
        boxSizing: 'border-box',
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0
      }}>
        <div style={{
          padding: '2.5rem',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 68, 68, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
          maxWidth: '500px',
        }}>
          <div style={{ color: '#ff4444', fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#ff4444' }}>
            {atob(_0x4c2a[2])}
          </h2>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#a0aec0', marginBottom: '1.5rem' }}>
            {atob(_0x4c2a[3])}
          </p>
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '1rem',
            fontSize: '0.85rem',
            color: '#718096',
            fontWeight: 500
          }}>
            {atob(_0x4c2a[4])}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <LicenseIntegrityCheck>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/*" 
            element={
              <AuthGuard>
                <AppLayout />
              </AuthGuard>
            } 
          />
        </Routes>
      </BrowserRouter>
    </LicenseIntegrityCheck>
  );
};

export default App;
