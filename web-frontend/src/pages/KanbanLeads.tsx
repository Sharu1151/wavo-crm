import React, { useEffect, useState } from 'react';
import { Sparkles, MessageSquare, Globe, Plus, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { Lead } from '../services/api';

const STAGES = [
  { key: 'NEW', label: 'New Lead', color: 'rgba(99, 102, 241, 0.2)' },
  { key: 'CONTACTED', label: 'Contacted', color: 'rgba(245, 158, 11, 0.2)' },
  { key: 'INTERESTED', label: 'Interested', color: 'rgba(20, 184, 166, 0.2)' },
  { key: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'rgba(99, 102, 241, 0.4)' },
  { key: 'WON', label: 'Won', color: 'rgba(16, 185, 129, 0.2)' },
  { key: 'LOST', label: 'Lost', color: 'rgba(239, 68, 68, 0.2)' }
];

export const KanbanLeads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form for new Lead
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newValue, setNewValue] = useState('1000');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customers, setCustomers] = useState<{ id: string; fullName: string }[]>([]);

  const fetchLeads = async () => {
    try {
      const data = await api.getLeads();
      setLeads(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leads.');
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await fetchLeads();
        const cData = await api.getCustomers();
        setCustomers(cData);
        if (cData.length > 0) {
          setSelectedCustomerId(cData[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Initialization failed.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (!leadId) return;

    // Optimistic Update
    const originalLeads = [...leads];
    setLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, stage: targetStage } : lead));

    try {
      await api.updateLeadStage(leadId, targetStage);
    } catch (err: any) {
      setError(`Failed to update stage: ${err.message}`);
      setLeads(originalLeads); // Rollback
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !newTitle) return;

    try {
      await api.createLead({
        customerId: selectedCustomerId,
        title: newTitle,
        estimatedValue: Number(newValue)
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewValue('1000');
      fetchLeads();
    } catch (err: any) {
      setError(`Failed to create lead: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <span>Loading Kanban pipeline...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Leads Pipeline</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Drag and drop leads between columns to update their sales stages dynamically.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--text-danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Kanban Board columns */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        overflowX: 'auto', 
        flex: 1, 
        paddingBottom: '1rem',
        alignItems: 'stretch'
      }}>
        {STAGES.map(stage => {
          const stageLeads = leads.filter(lead => lead.stage === stage.key);
          
          return (
            <div 
              key={stage.key}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.key)}
              style={{
                flex: '1 0 280px',
                background: 'rgba(12, 13, 18, 0.5)',
                border: '1px solid var(--border-translucent)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                minHeight: '400px'
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge" style={{ background: stage.color, color: 'var(--text-primary)' }}>
                  {stage.label}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards wrapper */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto' }}>
                {stageLeads.map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="glass-panel glass-panel-interactive"
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      userSelect: 'none'
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {lead.title}
                    </span>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {lead.customer?.fullName}
                      </span>
                      {lead.leadScore && (
                        <span className="badge badge-teal" style={{ fontSize: '0.65rem', gap: '0.2rem' }}>
                          <Sparkles size={8} /> Sc: {lead.leadScore}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-translucent)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                        {lead.customer?.email ? <Globe size={12} /> : <MessageSquare size={12} />}
                        <span style={{ fontSize: '0.75rem' }}>
                          {lead.customer?.email ? 'Email' : 'WhatsApp'}
                        </span>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        ${Number(lead.estimatedValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal Overlay */}
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
          <div className="glass-panel" style={{ width: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2>Create New Lead</h2>
            <form onSubmit={handleAddLead} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lead Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Consulting Contract"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Associate Customer</label>
                {customers.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-danger)' }}>No customers found. Create a customer first!</span>
                ) : (
                  <select 
                    className="input-field"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.fullName}</option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Estimated Value ($)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={customers.length === 0}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
