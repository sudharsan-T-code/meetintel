'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap, Calendar, Clock, CheckCircle2, AlertTriangle, ArrowUpRight,
  TrendingUp, Shield, Sparkles, User, BarChart2, Layers
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid
} from 'recharts';
import { PersonalProductivityMetrics } from '@/lib/db/personal-productivity';

export default function PersonalProductivityPage() {
  const [data, setData] = useState<PersonalProductivityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPersonalProductivity = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/my-productivity');
      const json = await res.json();
      if (json.metrics) {
        setData(json.metrics);
      }
    } catch (e) {
      console.error('Failed to load personal productivity:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalProductivity();
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '60px 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        Loading personal productivity metrics...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '60px 0', textAlign: 'center' }}>
        No productivity metrics available.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              Personal Productivity & Focus Dashboard
            </h1>
            <span style={{
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <Shield size={12} /> Confidential & Privacy Protected
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
            {data.user.name} ({data.user.title}) • {data.user.department} Department • {data.period}
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>Meeting Hours</span>
            <Clock size={16} color="var(--color-primary-light)" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {data.kpis.meetingHours}h
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Across {data.kpis.meetingsAttended} sessions ({data.kpis.avgMeetingDurationMins}m avg)
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>Focus Hours Budget</span>
            <Zap size={16} color="#4ade80" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: '#4ade80' }}>
            {data.kpis.focusHoursAvailable}h
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Uninterrupted deep work capacity
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>Task Completion</span>
            <CheckCircle2 size={16} color="var(--color-primary-light)" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-primary-light)' }}>
            {data.kpis.actionCompletionRate}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {data.kpis.actionItemsCompleted} of {data.kpis.actionItemsAssigned} tasks completed
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>Personal Effectiveness</span>
            <Sparkles size={16} color="#fbbf24" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: '#fbbf24' }}>
            {data.kpis.personalEffectivenessScore}
            <span style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>/100</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            High decision alignment & follow-through
          </div>
        </div>
      </div>

      {/* Visualizations Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: 20,
        marginBottom: 24,
      }}>
        {/* Meeting Load by Day */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={16} color="var(--color-primary-light)" /> Weekly Meeting Load Distribution
          </h3>
          <div style={{ height: 220, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.meetingLoadByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} unit="h" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="hours" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Meeting Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Velocity */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} color="#4ade80" /> Task Completion Velocity
          </h3>
          <div style={{ height: 220, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.taskVelocity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="assigned" stroke="#60a5fa" fill="rgba(96, 165, 250, 0.2)" name="Assigned" />
                <Area type="monotone" dataKey="completed" stroke="#4ade80" fill="rgba(74, 222, 128, 0.2)" name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Constructive AI Productivity Coaching */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.03))',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        marginBottom: 24,
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color="var(--color-primary-light)" /> Constructive Productivity Insights
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.productivityInsights.map((insight, idx) => (
            <div
              key={idx}
              style={{
                fontSize: 13,
                color: 'var(--text-primary)',
                lineHeight: 1.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <span style={{ color: 'var(--color-primary-light)', fontWeight: 800 }}>•</span>
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Action Items Link Back */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
            Recent Deliverables
          </h3>
          <Link
            href="/action-items"
            style={{
              fontSize: 12,
              color: 'var(--color-primary-light)',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Open Action Items Hub <ArrowUpRight size={13} />
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.recentActionItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: 13,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: item.status === 'completed' ? '#4ade80' : '#fbbf24',
                }} />
                <span>{item.task}</span>
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
              }}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
