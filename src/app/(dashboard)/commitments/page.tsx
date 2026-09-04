'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GitBranch, CheckCircle2, Clock, AlertTriangle, ArrowUpRight,
  User as UserIcon, Calendar, Check, Search, Filter
} from 'lucide-react';
import { CommitmentStatus } from '@/types';

interface CommitmentUI {
  id: string;
  meetingId: string;
  text: string;
  committedBy: string;
  timestamp: number;
  deadline?: string;
  status: CommitmentStatus;
  meetingTitle?: string;
}

export default function CommitmentsPage() {
  const [items, setItems] = useState<CommitmentUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [health, setHealth] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    completionRate: 0,
  });

  useEffect(() => {
    fetchCommitments();
  }, [activeTab]);

  async function fetchCommitments() {
    setLoading(true);
    try {
      let url = `/api/commitments?limit=100`;
      if (activeTab !== 'all') {
        url += `&status=${activeTab}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
        if (data.health) setHealth(data.health);
      }
    } catch (e) {
      console.error('Failed to load commitments:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: CommitmentStatus) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    try {
      await fetch(`/api/commitments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error(e);
      fetchCommitments();
    }
  }

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    return (
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.committedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meetingTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
            Organizational Commitments
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
            Verbal promises, milestones, and deliverable agreements captured from executive meeting transcripts.
          </p>
        </div>

        {/* Commitment Health Summary */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary-light)' }}>
              {health.total}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total Tracked</div>
          </div>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24' }}>
              {health.inProgress}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>In Progress</div>
          </div>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#4ade80' }}>
              {health.completionRate}%
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Health Score</div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          padding: 3,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          {[
            { id: 'all', label: 'All Commitments' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'pending', label: 'Pending' },
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

        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search commitments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ paddingLeft: 32, fontSize: 13, height: 34, width: 240 }}
          />
        </div>
      </div>

      {/* Commitments Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            Loading commitments...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <CheckCircle2 size={36} color="var(--color-primary-light)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>No Commitments Found</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              No verbal commitments matching the selected criteria.
            </p>
          </div>
        ) : (
          <div>
            {filteredItems.map((item) => {
              const isCompleted = item.status === 'completed';

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isCompleted ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, marginRight: 20 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                      textDecoration: isCompleted ? 'line-through' : 'none',
                      marginBottom: 6,
                      lineHeight: 1.4,
                    }}>
                      &ldquo;{item.text}&rdquo;
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-tertiary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                        <UserIcon size={12} /> Committed by: <strong>{item.committedBy}</strong>
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

                      {item.deadline && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} /> Target: {new Date(item.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Switcher */}
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as CommitmentStatus)}
                    className="input"
                    style={{
                      fontSize: 12,
                      padding: '4px 10px',
                      height: 30,
                      borderRadius: 'var(--radius-sm)',
                      color: isCompleted ? '#4ade80' : item.status === 'in_progress' ? '#fbbf24' : 'var(--text-secondary)',
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
