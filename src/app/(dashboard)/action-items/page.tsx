'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ListChecks, CheckCircle2, Clock, AlertTriangle, Filter, Search,
  Calendar, ArrowUpRight, User as UserIcon, Check, MoreVertical
} from 'lucide-react';
import { ActionStatus, ActionPriority } from '@/types';

interface ActionItemUI {
  id: string;
  meetingId: string;
  task: string;
  owner: string;
  dueDate?: string;
  priority: ActionPriority;
  status: ActionStatus;
  meetingTitle?: string;
  timestamp: number;
}

export default function ActionItemsPage() {
  const [items, setItems] = useState<ActionItemUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'open' | 'completed' | 'overdue'>('my');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [metrics, setMetrics] = useState({ open: 0, inProgress: 0, completed: 0, overdue: 0 });

  useEffect(() => {
    fetchActionItems();
  }, [activeTab, selectedPriority]);

  async function fetchActionItems() {
    setLoading(true);
    try {
      let url = `/api/action-items?limit=100`;
      if (activeTab === 'open') url += `&status=open`;
      if (activeTab === 'completed') url += `&status=completed`;
      if (activeTab === 'overdue') url += `&overdue=true`;
      if (selectedPriority !== 'all') url += `&priority=${selectedPriority}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.items) {
        let filtered = data.items;
        if (activeTab === 'my') {
          filtered = filtered.filter((i: ActionItemUI) => i.owner.toLowerCase().includes('rajesh') || i.owner.toLowerCase().includes('priya'));
        }
        setItems(filtered);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (e) {
      console.error('Failed to fetch action items:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: ActionStatus) {
    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    try {
      await fetch(`/api/action-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error('Failed to update action item status:', e);
      fetchActionItems();
    }
  }

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    return (
      item.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meetingTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getPriorityBadge = (p: ActionPriority) => {
    const config = {
      critical: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
      high: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
      medium: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
      low: { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' },
    }[p] || { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };

    return (
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          background: config.bg,
          color: config.color,
          border: `1px solid ${config.border}`,
        }}
      >
        {p}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
            Action Items & Task Hub
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
            Track, assign, and complete action items generated from enterprise meeting intelligence.
          </p>
        </div>

        {/* Metrics Bar */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary-light)' }}>
              {metrics.open + metrics.inProgress}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Active Tasks</div>
          </div>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#4ade80' }}>
              {metrics.completed}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Completed</div>
          </div>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#f87171' }}>
              {metrics.overdue}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Overdue</div>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          padding: 3,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          {[
            { id: 'my', label: 'My Tasks' },
            { id: 'all', label: 'Team Tasks' },
            { id: 'open', label: 'Open' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter & Search */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: 32, fontSize: 13, height: 34, width: 220 }}
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="input"
            style={{ fontSize: 13, height: 34, padding: '4px 10px' }}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            Loading action items...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <CheckCircle2 size={36} color="var(--color-primary-light)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>No Action Items Found</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              All deliverables in this view are completed or no matching tasks were found.
            </p>
          </div>
        ) : (
          <div>
            {filteredItems.map((item) => {
              const isCompleted = item.status === 'completed';
              const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && !isCompleted;

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isCompleted ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                    transition: 'background var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0, marginRight: 16 }}>
                    {/* Status Checkbox Button */}
                    <button
                      onClick={() => handleStatusChange(item.id, isCompleted ? 'open' : 'completed')}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        border: isCompleted ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                        background: isCompleted ? 'var(--color-primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                      title={isCompleted ? 'Mark as Open' : 'Mark as Completed'}
                    >
                      {isCompleted && <Check size={14} color="white" />}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        marginBottom: 4,
                        lineHeight: 1.4,
                      }}>
                        {item.task}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-tertiary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <UserIcon size={12} /> {item.owner}
                        </span>

                        {item.meetingTitle && (
                          <Link
                            href={`/meetings/${item.meetingId}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              color: 'var(--color-primary-light)',
                              textDecoration: 'none',
                            }}
                          >
                            <ArrowUpRight size={12} /> {item.meetingTitle}
                          </Link>
                        )}

                        {item.dueDate && (
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            color: isOverdue ? '#f87171' : 'var(--text-tertiary)',
                            fontWeight: isOverdue ? 700 : 400,
                          }}>
                            <Calendar size={12} /> Due {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {getPriorityBadge(item.priority)}

                    {/* Status Dropdown */}
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as ActionStatus)}
                      className="input"
                      style={{
                        fontSize: 12,
                        padding: '3px 8px',
                        height: 28,
                        borderRadius: 'var(--radius-sm)',
                        color: isCompleted ? '#4ade80' : 'var(--text-secondary)',
                      }}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
