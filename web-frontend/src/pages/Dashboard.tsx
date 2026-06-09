import React, { useEffect, useState } from 'react';
import { 
  Users, 
  LayoutGrid, 
  CheckSquare, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import type { Customer, Lead, Task } from '../services/api';

export const Dashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cData, lData, tData] = await Promise.all([
          api.getCustomers(),
          api.getLeads(),
          api.getTasks()
        ]);
        setCustomers(cData);
        setLeads(lData);
        setTasks(tData);
      } catch (err: any) {
        console.error(err.message || 'Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <Clock className="pulse-card" size={32} color="var(--accent-indigo)" />
          <span>Synchronizing dashboard metrics...</span>
        </div>
      </div>
    );
  }

  const overdueTasksCount = tasks.filter(t => t.status !== 'DONE').length;
  const estimatedPipelineValue = leads.reduce((sum, lead) => sum + Number(lead.estimatedValue || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Real-time business pipelines and conversational sales performance.
          </p>
        </div>
        <div className="badge badge-teal" style={{ padding: '0.4rem 0.8rem', gap: '0.35rem' }}>
          <Sparkles size={12} />
          AI System Online
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {/* Card 1 */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL CUSTOMERS</span>
            <div style={{ color: 'var(--accent-indigo)' }}><Users size={20} /></div>
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 700 }}>{customers.length}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-success)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <TrendingUp size={12} /> +12.4% vs last month
          </span>
        </div>

        {/* Card 2 */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ACTIVE LEADS</span>
            <div style={{ color: 'var(--accent-teal)' }}><LayoutGrid size={20} /></div>
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 700 }}>{leads.length}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Seeded inside sales pipeline
          </span>
        </div>

        {/* Card 3 */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PENDING FOLLOW-UPS</span>
            <div style={{ color: 'var(--text-warning)' }}><CheckSquare size={20} /></div>
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 700 }}>{overdueTasksCount}</span>
          <span style={{ fontSize: '0.75rem', color: overdueTasksCount > 0 ? 'var(--text-danger)' : 'var(--text-secondary)', fontWeight: 600 }}>
            {overdueTasksCount > 0 ? 'Action required today' : 'All clear for now'}
          </span>
        </div>

        {/* Card 4 */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ESTIMATED REVENUE</span>
            <div style={{ color: 'var(--text-success)' }}><DollarSign size={20} /></div>
          </div>
          <span style={{ fontSize: '2rem', fontWeight: 700 }}>
            ${estimatedPipelineValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-success)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <TrendingUp size={12} /> Pipeline gross weight
          </span>
        </div>
      </div>

      {/* Analytics Visual Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {/* Line Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>REVENUE TRENDS (30-DAY COHORT)</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '1rem 0', borderLeft: '1px solid var(--border-translucent)', borderBottom: '1px solid var(--border-translucent)', position: 'relative' }}>
            {/* SVG Wave lines */}
            <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, overflow: 'visible' }}>
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-indigo)" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="var(--accent-indigo)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="50" x2="100%" y2="50" stroke="var(--border-translucent)" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="100%" y2="100" stroke="var(--border-translucent)" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="100%" y2="150" stroke="var(--border-translucent)" strokeDasharray="4 4" />
              
              {/* Smooth trend curve */}
              <path 
                d="M 10 180 Q 80 80, 160 140 T 320 60 T 480 30" 
                fill="none" 
                stroke="var(--accent-indigo)" 
                strokeWidth="3" 
                strokeLinecap="round" 
              />
              <path 
                d="M 10 180 Q 80 80, 160 140 T 320 60 T 480 30 L 480 200 L 10 200 Z" 
                fill="url(#chart-grad)" 
              />
            </svg>
            <div style={{ position: 'absolute', bottom: '5px', left: '15px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Jan</div>
            <div style={{ position: 'absolute', bottom: '5px', left: '33%', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Feb</div>
            <div style={{ position: 'absolute', bottom: '5px', left: '66%', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mar</div>
            <div style={{ position: 'absolute', bottom: '5px', right: '15px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Apr</div>
          </div>
        </div>

        {/* Lead Funnel */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>LEAD FUNNEL DISTRIBUTION</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span>New Opportunities</span>
                <span>100%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', background: 'linear-gradient(to right, var(--accent-indigo), var(--accent-teal))', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span>Contacted / Replied</span>
                <span>78%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '78%', background: 'linear-gradient(to right, var(--accent-indigo), var(--accent-teal))', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span>Proposal Transmitted</span>
                <span>45%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '45%', background: 'linear-gradient(to right, var(--accent-indigo), var(--accent-teal))', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span>Closed Won</span>
                <span>28%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '28%', background: 'linear-gradient(to right, var(--accent-indigo), var(--accent-teal))', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
