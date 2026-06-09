import React, { useEffect, useState } from 'react';
import { Plus, ShieldAlert, MessageSquare, Send, Smartphone } from 'lucide-react';
import { api } from '../services/api';
import type { WhatsappTemplate, WhatsappCampaign } from '../services/api';

export const WhatsAppPage: React.FC = () => {
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<WhatsappCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states - Template
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [tmplName, setTmplName] = useState('');
  const [tmplCategory, setTmplCategory] = useState('WELCOME');
  const [tmplBodyText, setTmplBodyText] = useState('');
  const [tmplLang, setTmplLang] = useState('en');

  // Form states - Campaign
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campName, setCampName] = useState('');
  const [campTemplateId, setCampTemplateId] = useState('');
  const [campRecipients, setCampRecipients] = useState('');
  const [campScheduled, setCampScheduled] = useState('');

  const fetchData = async () => {
    try {
      const [tmplData, campData] = await Promise.all([
        api.getTemplates(),
        api.getCampaigns()
      ]);
      setTemplates(tmplData);
      setCampaigns(campData);
    } catch (err: any) {
      setError(err.message || 'Failed to load WhatsApp marketing data.');
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchData();
      setLoading(false);
    };
    init();
  }, []);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmplName || !tmplCategory || !tmplBodyText) return;

    try {
      await api.createTemplate({
        name: tmplName,
        category: tmplCategory,
        bodyText: tmplBodyText,
        languageCode: tmplLang
      });
      setShowTemplateModal(false);
      setTmplName('');
      setTmplBodyText('');
      await fetchData();
    } catch (err: any) {
      setError(`Failed to create template: ${err.message}`);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName || !campTemplateId || !campRecipients) return;

    try {
      await api.createCampaign({
        name: campName,
        templateId: campTemplateId,
        recipientCount: parseInt(campRecipients),
        scheduledAt: campScheduled ? campScheduled : undefined
      });
      setShowCampaignModal(false);
      setCampName('');
      setCampTemplateId('');
      setCampRecipients('');
      setCampScheduled('');
      await fetchData();
    } catch (err: any) {
      setError(`Failed to launch campaign: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <span>Loading WhatsApp workspace records...</span>
      </div>
    );
  }

  // Calculate quick metrics
  const activeTemplatesCount = templates.length;
  const totalCampaignsDispatched = campaigns.length;
  const totalRecipientsReached = campaigns.reduce((acc, c) => acc + c.recipientCount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>WhatsApp Marketing & Campaigns</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Design approved message templates and launch automated client broadcasts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowTemplateModal(true)}>
            <Plus size={16} /> New Template
          </button>
          <button className="btn btn-primary" onClick={() => setShowCampaignModal(true)}>
            <Send size={16} /> Dispatch Campaign
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--text-danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Marketing Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(20, 184, 166, 0.15)', padding: '0.75rem', borderRadius: '10px', color: '#14b8a6' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Active Templates</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: '#14b8a6' }}>{activeTemplatesCount} Approved</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.75rem', borderRadius: '10px', color: '#818cf8' }}>
            <Send size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Broadcast Campaigns</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: '#818cf8' }}>{totalCampaignsDispatched} Dispatched</h2>
          </div>
        </div>

        <div className="glass-panel pulse-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.75rem', borderRadius: '10px', color: '#34d399' }}>
            <Smartphone size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Recipient Reach</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem', color: '#34d399' }}>
              {totalRecipientsReached.toLocaleString()} Clients
            </h2>
          </div>
        </div>
      </div>

      {/* Main Workspace split */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Campaigns logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2>Campaign Broadcast History</h2>
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-translucent)' }}>
                  <th style={{ padding: '1rem' }}>Campaign</th>
                  <th style={{ padding: '1rem' }}>Template Used</th>
                  <th style={{ padding: '1rem' }}>Target Reach</th>
                  <th style={{ padding: '1rem' }}>Launch Date</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No campaigns dispatched yet. Schedule a launch broadcast!
                    </td>
                  </tr>
                ) : (
                  campaigns.map(camp => (
                    <tr key={camp.id} style={{ borderBottom: '1px solid var(--border-translucent)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{camp.name}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                        {camp.template?.name || 'Unknown Template'}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{camp.recipientCount} clients</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {camp.scheduledAt 
                          ? new Date(camp.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                          : new Date(camp.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                        }
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {camp.status === 'COMPLETED' ? (
                          <span className="badge badge-green">Sent</span>
                        ) : camp.status === 'SCHEDULED' ? (
                          <span className="badge badge-indigo">Scheduled</span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>{camp.status}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Templates summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2>Approved Content Templates</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '550px' }}>
            {templates.length === 0 ? (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No messaging templates saved. Create one to standardise outreach!
              </div>
            ) : (
              templates.map(tmpl => (
                <div key={tmpl.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{tmpl.name}</strong>
                    <span className="badge badge-indigo" style={{ fontSize: '0.6rem' }}>{tmpl.category}</span>
                  </div>
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    background: 'rgba(15, 17, 26, 0.5)',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-translucent)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {tmpl.bodyText}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Language: {tmpl.languageCode.toUpperCase()}</span>
                    <span style={{ color: 'var(--text-success)', fontWeight: 600 }}>{tmpl.metaStatus}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Modal - Create Template */}
      {showTemplateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999
        }}>
          <div className="glass-panel" style={{ width: '450px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2>Design Approved Template</h2>
            <form onSubmit={handleCreateTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Template Name (no spaces)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. follow_up_promo"
                  value={tmplName}
                  onChange={(e) => setTmplName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category</label>
                <select 
                  className="input-field"
                  value={tmplCategory}
                  onChange={(e) => setTmplCategory(e.target.value)}
                  required
                >
                  <option value="WELCOME">Welcome Greetings</option>
                  <option value="FOLLOW_UP">Follow Up Reminders</option>
                  <option value="PAYMENT_REMINDER">Payment Pending Notifications</option>
                  <option value="APPOINTMENT_REMINDER">Booking Reminders</option>
                  <option value="PROMOTIONS">Marketing Offers & Promotions</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Body Content Text</label>
                <textarea 
                  className="input-field" 
                  placeholder="Hello {{1}}, thank you for choosing our services. Your deal total is {{2}}."
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  value={tmplBodyText}
                  onChange={(e) => setTmplBodyText(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Language Code</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. en, es, fr"
                  value={tmplLang}
                  onChange={(e) => setTmplLang(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTemplateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Schedule Campaign */}
      {showCampaignModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999
        }}>
          <div className="glass-panel" style={{ width: '450px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2>Dispatch Broadcast Campaign</h2>
            <form onSubmit={handleCreateCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Campaign Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. June Summer Sale Alert"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Message Template</label>
                <select 
                  className="input-field"
                  value={campTemplateId}
                  onChange={(e) => setCampTemplateId(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Select Approved Template --</option>
                  {templates.map(tmpl => (
                    <option key={tmpl.id} value={tmpl.id}>{tmpl.name} ({tmpl.category})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target Recipient Count</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="e.g. 150"
                  value={campRecipients}
                  onChange={(e) => setCampRecipients(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Scheduled Dispatch (Leave empty for instant)</label>
                <input 
                  type="datetime-local" 
                  className="input-field" 
                  value={campScheduled}
                  onChange={(e) => setCampScheduled(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCampaignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Launch/Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
