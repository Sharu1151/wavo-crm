import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldAlert, BrainCircuit, MessageSquare, Mail, Award, BookOpen } from 'lucide-react';
import { api } from '../services/api';
import type { Lead, Customer } from '../services/api';

export const AIPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active sub-tool tab
  const [activeTab, setActiveTab] = useState<'score' | 'outreach' | 'replies' | 'summary'>('score');

  // Lead scoring tool states
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [scoringResult, setScoringResult] = useState<number | null>(null);
  const [scoringLoading, setScoringLoading] = useState(false);

  // Outreach generation states
  const [outreachName, setOutreachName] = useState('');
  const [outreachBusiness, setOutreachBusiness] = useState('');
  const [outreachDetails, setOutreachDetails] = useState('');
  const [outreachTone, setOutreachTone] = useState('friendly');
  const [outreachResult, setOutreachResult] = useState('');
  const [outreachLoading, setOutreachLoading] = useState(false);

  // Reply suggestion states
  const [incomingMessage, setIncomingMessage] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);

  // Timeline summary states
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [summaryResult, setSummaryResult] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Notification for copy
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchData = async () => {
    try {
      const [leadsData, custData] = await Promise.all([
        api.getLeads(),
        api.getCustomers()
      ]);
      setLeads(leadsData);
      setCustomers(custData);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize AI workspace data.');
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchData();
      setLoading(false);
    };
    init();
  }, []);

  const handleScoreLead = async () => {
    if (!selectedLeadId) return;
    setScoringLoading(true);
    setError(null);
    try {
      const res = await api.scoreLead(selectedLeadId);
      setScoringResult(res.score);
      await fetchData(); // refresh leads to show updated scores
    } catch (err: any) {
      setError(`Scoring failed: ${err.message}`);
    } finally {
      setScoringLoading(false);
    }
  };

  const handleGenerateOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outreachName || !outreachBusiness || !outreachDetails) return;
    setOutreachLoading(true);
    setError(null);
    try {
      const res = await api.generateOutreach({
        customerName: outreachName,
        businessName: outreachBusiness,
        details: outreachDetails,
        tone: outreachTone
      });
      setOutreachResult(res.content);
    } catch (err: any) {
      setError(`Generation failed: ${err.message}`);
    } finally {
      setOutreachLoading(false);
    }
  };

  const handleGetReplies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomingMessage) return;
    setRepliesLoading(true);
    setError(null);
    try {
      const res = await api.suggestReplies(incomingMessage);
      setSuggestions(res.suggestions);
    } catch (err: any) {
      setError(`Reply suggestions failed: ${err.message}`);
    } finally {
      setRepliesLoading(false);
    }
  };

  const handleSummarizeTimeline = async () => {
    if (!selectedCustomerId) return;
    setSummaryLoading(true);
    setError(null);
    try {
      const res = await api.summarizeTimeline(selectedCustomerId);
      setSummaryResult(res.summary);
    } catch (err: any) {
      setError(`Summary compilation failed: ${err.message}`);
    } finally {
      setSummaryLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <span>Warming up AI models...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <BrainCircuit size={28} style={{ color: 'var(--accent-indigo)' }} />
            AI Intelligence Workspace
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Boost team sales with predictive closing rates, smart suggested replies, and outreach scripts.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--text-danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-translucent)', paddingBottom: '0.5rem' }}>
        <button 
          className="btn" 
          style={{
            background: activeTab === 'score' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'score' ? 'var(--text-primary)' : 'var(--text-secondary)',
            border: activeTab === 'score' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
          }}
          onClick={() => setActiveTab('score')}
        >
          <Award size={16} /> Lead Scoring
        </button>
        <button 
          className="btn" 
          style={{
            background: activeTab === 'outreach' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'outreach' ? 'var(--text-primary)' : 'var(--text-secondary)',
            border: activeTab === 'outreach' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
          }}
          onClick={() => setActiveTab('outreach')}
        >
          <Mail size={16} /> Outreach Creator
        </button>
        <button 
          className="btn" 
          style={{
            background: activeTab === 'replies' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'replies' ? 'var(--text-primary)' : 'var(--text-secondary)',
            border: activeTab === 'replies' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
          }}
          onClick={() => setActiveTab('replies')}
        >
          <MessageSquare size={16} /> Reply Suggestions
        </button>
        <button 
          className="btn" 
          style={{
            background: activeTab === 'summary' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'summary' ? 'var(--text-primary)' : 'var(--text-secondary)',
            border: activeTab === 'summary' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
          }}
          onClick={() => setActiveTab('summary')}
        >
          <BookOpen size={16} /> Timeline Summaries
        </button>
      </div>

      {/* Workspace Area */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        
        {/* Tab 1: Lead Scoring */}
        {activeTab === 'score' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2>Predictive Deal Scoring</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Analyze pipeline data completeness and customer notes to estimate conversion probability.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select Active Lead</label>
                  <select 
                    className="input-field"
                    value={selectedLeadId}
                    onChange={(e) => {
                      setSelectedLeadId(e.target.value);
                      setScoringResult(null);
                    }}
                  >
                    <option value="">-- Choose Pipeline Deal --</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.title} - {l.customer?.fullName} (${Number(l.estimatedValue).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  className="btn btn-primary" 
                  disabled={!selectedLeadId || scoringLoading}
                  onClick={handleScoreLead}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <Sparkles size={16} />
                  {scoringLoading ? 'Calculating Score...' : 'Predict Conversion Probability'}
                </button>
              </div>

              {/* Visualization circular display */}
              <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', minHeight: '200px' }}>
                {scoringResult !== null ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '100px', height: '100px', borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '4px solid var(--accent-indigo)',
                      boxShadow: '0 0 20px var(--accent-neon-glow)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '2rem', fontWeight: 800, color: '#fff'
                    }}>
                      {scoringResult}%
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Probability of Winning Deal</span>
                    <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                      {scoringResult >= 80 ? 'High Closing Success' : scoringResult >= 50 ? 'Moderate Closing Likelihood' : 'Needs Nurturing'}
                    </span>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Select a pipeline lead and click "Predict" to see AI calculation results.
                  </div>
                )}
              </div>
            </div>

            {/* List showing existing scores */}
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '0.75rem' }}>Active Pipeline Conversions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {leads.map(l => (
                  <div key={l.id} className="glass-panel" style={{ padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{l.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{l.customer?.fullName}</span>
                    </div>
                    {l.leadScore !== null && l.leadScore !== undefined ? (
                      <span className="badge badge-teal" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                        {l.leadScore}%
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unranked</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Outreach Content Creator */}
        {activeTab === 'outreach' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2>AI Outreach Message Creator</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Generate personalized pitches and proposals formatted instantly with custom tone metrics.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '2rem' }}>
              <form onSubmit={handleGenerateOutreach} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Customer Full Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Robert Miller"
                    value={outreachName}
                    onChange={(e) => setOutreachName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Your Business Brand</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Wavo Systems"
                    value={outreachBusiness}
                    onChange={(e) => setOutreachBusiness(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Details / Deal Pitch Summary</label>
                  <textarea 
                    className="input-field" 
                    placeholder="e.g. finalising proposal for custom software portal development"
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    value={outreachDetails}
                    onChange={(e) => setOutreachDetails(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Outreach Script Tone</label>
                  <select 
                    className="input-field"
                    value={outreachTone}
                    onChange={(e) => setOutreachTone(e.target.value)}
                    required
                  >
                    <option value="friendly">Friendly & Casual</option>
                    <option value="formal">Formal & Corporate</option>
                    <option value="urgent">Urgent Reminder</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" disabled={outreachLoading} style={{ alignSelf: 'flex-start' }}>
                  <Sparkles size={16} />
                  {outreachLoading ? 'Drafting copy...' : 'Draft Outreach Pitch'}
                </button>
              </form>

              {/* Output block */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(15, 17, 26, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Generated AI Content</h3>
                  {outreachResult && (
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => copyToClipboard(outreachResult)}
                    >
                      {copySuccess ? 'Copied!' : 'Copy Script'}
                    </button>
                  )}
                </div>
                {outreachResult ? (
                  <pre style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.4rem'
                  }}>
                    {outreachResult}
                  </pre>
                ) : (
                  <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Generate a pitch to preview output script here.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Reply Suggestions */}
        {activeTab === 'replies' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2>Smart Suggested Answers</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Paste incoming WhatsApp or email inquiries to generate optimal response suggestions.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '2rem' }}>
              <form onSubmit={handleGetReplies} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Paste Client Message</label>
                  <textarea 
                    className="input-field" 
                    placeholder="e.g. Hello, what is the cost of your premium team workspace subscription?"
                    style={{ minHeight: '120px', resize: 'vertical' }}
                    value={incomingMessage}
                    onChange={(e) => setIncomingMessage(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={repliesLoading} style={{ alignSelf: 'flex-start' }}>
                  <Sparkles size={16} />
                  {repliesLoading ? 'Generating...' : 'Get Reply Proposals'}
                </button>
              </form>

              {/* Suggestions results lists */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3>Proposals & Templates (Click to Copy)</h3>
                {suggestions.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Enter an incoming message to fetch cognitive reply alternatives.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {suggestions.map((s, idx) => (
                      <div 
                        key={idx} 
                        className="glass-panel glass-panel-interactive" 
                        style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}
                        onClick={() => copyToClipboard(s)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', fontWeight: 600 }}>Option {idx + 1}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Click to Copy</span>
                        </div>
                        <p>{s}</p>
                      </div>
                    ))}
                  </div>
                )}
                {copySuccess && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-success)', alignSelf: 'flex-end' }}>
                    Text copied to clipboard successfully!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Timeline Summaries */}
        {activeTab === 'summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2>Timeline Smart Summaries</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Compile customer account profiles and related pipelines into unified summaries.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select Customer Record</label>
                  <select 
                    className="input-field"
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      setSummaryResult('');
                    }}
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.company || 'Direct Client'})
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  className="btn btn-primary" 
                  disabled={!selectedCustomerId || summaryLoading}
                  onClick={handleSummarizeTimeline}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <Sparkles size={16} />
                  {summaryLoading ? 'Generating Summary...' : 'Compile Account Profile'}
                </button>
              </div>

              {/* Display block */}
              <div className="glass-panel" style={{ flex: 1.25, padding: '1.5rem', minHeight: '180px', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(15, 17, 26, 0.4)' }}>
                <h3>Smart Executive Summary</h3>
                {summaryResult ? (
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5rem',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {summaryResult}
                  </p>
                ) : (
                  <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Select a customer and click "Compile" to view summarized timeline reports.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
