import React, { useEffect, useState } from 'react';
import { Plus, CheckSquare, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { Task } from '../services/api';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Task Modal Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const fetchTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks.');
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchTasks();
      setLoading(false);
    };
    init();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      await api.createTask({
        title,
        description: description || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        priority
      });
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('MEDIUM');
      fetchTasks();
    } catch (err: any) {
      setError(`Failed to create task: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <span>Loading follow-up tasks...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Follow-Up Tasks</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Manage lead outreach schedules, phone calls, and appointment alerts.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--text-danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Tasks List Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tasks.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No pending follow-ups or schedules active.
          </div>
        ) : (
          tasks.map(t => (
            <div 
              key={t.id} 
              className="glass-panel" 
              style={{ 
                padding: '1.25rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderLeft: t.priority === 'HIGH' ? '4px solid var(--text-danger)' : 
                             t.priority === 'MEDIUM' ? '4px solid var(--text-warning)' : '4px solid var(--border-active)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--accent-indigo)' }}>
                  <CheckSquare size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</span>
                  {t.description && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.description}</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {t.dueDate && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Calendar size={12} />
                    {new Date(t.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                )}
                <span className={`badge ${t.priority === 'HIGH' ? 'badge-teal' : 'badge-indigo'}`}>
                  {t.priority}
                </span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-translucent)', color: 'var(--text-secondary)' }}>
                  {t.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal Overlay */}
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
          <div className="glass-panel" style={{ width: '420px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2>Schedule Follow-Up Task</h2>
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Task / Call Action</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Call client for proposal review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Description</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Focus on pricing and SLA details"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Due Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Priority</label>
                <select 
                  className="input-field"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
