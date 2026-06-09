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

export const App: React.FC = () => {
  return (
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
  );
};

export default App;
