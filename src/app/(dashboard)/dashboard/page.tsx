'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Calendar, Clock, AlertTriangle, Zap, TrendingUp,
  Brain, Mic, Users, Target, ChevronRight, Activity,
  ListChecks, GitBranch, Shield, Sparkles, Award
} from 'lucide-react';
import {
  demoMeeting, demoMeetingsList, demoActions, demoDecisions,
  demoRisks, demoUser, formatDuration, demoTopics
} from '@/lib/demo-data';

interface OverviewMetrics {
  timeRange: string;
  totalMeetings: { value: number; trend: { value: number; positive: boolean } };
  totalHours: { value: number; trend: { value: number; positive: boolean } };
  averageDuration: { value: number; unit: string };
  productivityScore: { value: number; trend: { value: number; positive: boolean } };
  decisionsMade: { value: number; approved: number; trend: { value: number; positive: boolean } };
  actionItems: { total: number; completed: number; open?: number; completionRate: number; trend: { value: number; positive: boolean } };
  openRisks: { total: number; critical: number };
  commitments: { total: number };
  estimatedCostINR: number;
  meetingEfficiency: number;
}

function MetricCard({ icon, label, value, subtext, color, trend, href }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
  trend?: { value: number; positive: boolean };
  href?: string;
}) {
  const content = (
    <div
      className="metric-card"
      style={{
        cursor: href ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, border-color 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-md)',
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
        }}>
          {icon}
        </div>
        {trend && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 600,
            color: trend.positive ? 'var(--color-success)' : 'var(--color-danger)',
          }}>
            <TrendingUp size={14} style={{ transform: trend.positive ? 'none' : 'rotate(180deg)' }} />
            {trend.value}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
      {subtext && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{subtext}</div>}
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>{content}</Link>;
  }
  return content;
}

function ScoreRing({ score, size = 100, label }: { score: number; size?: number; label: string }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth={6}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-primary)"
          fontSize={size * 0.28}
          fontWeight={800}
        >
          {score}
        </text>
      </svg>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('30d');
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [isLoadingBriefing, setIsLoadingBriefing] = useState(false);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch(`/api/analytics/overview?timeRange=${timeRange}`);
      if (res.ok) {
        const data = await res.json();
        if (data.overview) {
          setMetrics(data.overview);
        }
      }
    } catch (err) {
      console.warn('Using baseline analytics fallback:', err);
    }
  }, [timeRange]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/analytics/overview?timeRange=${timeRange}`);
        if (res.ok) {
          const data = await res.json();
          if (!ignore && data.overview) {
            setMetrics(data.overview);
          }
        }
      } catch (err) {
        console.warn('Using baseline analytics fallback:', err);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [timeRange]);

  async function handleGenerateBriefing() {
    try {
      setIsLoadingBriefing(true);
      const res = await fetch('/api/analytics/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeRange }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.insights) {
          setAiBriefing(data.insights.summary);
        }
      }
    } catch (err) {
      console.error('Failed to generate briefing:', err);
    } finally {
      setIsLoadingBriefing(false);
    }
  }

  const totalM = metrics?.totalMeetings?.value ?? 156;
  const totalH = metrics?.totalHours?.value ?? 312;
  const avgDur = metrics?.averageDuration?.value ?? 72;
  const prodScore = metrics?.productivityScore?.value ?? 78;
  const decCount = metrics?.decisionsMade?.value ?? demoDecisions.length;
  const actTotal = metrics?.actionItems?.total ?? demoActions.length;
  const actRate = metrics?.actionItems?.completionRate ?? 68;
  const openRiskCount = metrics?.openRisks?.total ?? demoRisks.length;
  const critRisks = metrics?.openRisks?.critical ?? demoRisks.filter(r => r.severity === 'critical').length;
  const costTotal = metrics?.estimatedCostINR ?? 15600000;

  return (
    <div className="dashboard-container">
      {/* Header with Time-Range Selector */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 20,
          marginBottom: 28,
        }}
        className="animate-fade-in"
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            {greeting}, <span className="gradient-text">{demoUser.name.split(' ')[0]}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Enterprise meeting intelligence overview & organizational efficiency metrics
          </p>
        </div>

        {/* Time Range Filter Pills */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--bg-surface)', padding: 4, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          {[
            { key: 'today', label: 'Today' },
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: '90d', label: '90 Days' },
            { key: 'all', label: 'All Time' },
          ].map((range) => (
            <button
              key={range.key}
              onClick={() => setTimeRange(range.key as typeof timeRange)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: 12,
                fontWeight: timeRange === range.key ? 700 : 500,
                background: timeRange === range.key ? 'var(--bg-elevated)' : 'transparent',
                color: timeRange === range.key ? 'var(--text-primary)' : 'var(--text-muted)',
                border: timeRange === range.key ? '1px solid var(--color-primary)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Demo Intelligence Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.1))',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 24px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }} className="animate-fade-in" >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Enterprise Analytics Active</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Deterministic insights computed across all ingested organizational meetings
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/analytics" className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
            <Activity size={14} /> View Analytics Suite
          </Link>
          <Link href="/voice-box" className="btn btn-primary btn-sm" style={{ gap: 6 }}>
            <Mic size={14} /> Open Voice Box
          </Link>
        </div>
      </div>

      {/* Executive KPI Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }} className="stagger-children">
        <MetricCard
          icon={<Calendar size={20} />}
          label="Total Meetings"
          value={totalM}
          subtext={`Selected ${timeRange}`}
          color="#6366f1"
          trend={metrics?.totalMeetings?.trend || { value: 12, positive: true }}
          href="/analytics"
        />
        <MetricCard
          icon={<Clock size={20} />}
          label="Meeting Hours"
          value={`${totalH}h`}
          subtext={`Avg ${avgDur}m per session`}
          color="#06b6d4"
          trend={metrics?.totalHours?.trend}
          href="/analytics"
        />
        <MetricCard
          icon={<Target size={20} />}
          label="Productivity Score"
          value={`${prodScore}/100`}
          subtext={prodScore >= 80 ? 'Optimal Efficiency' : 'Strong Performance'}
          color="#10b981"
          trend={metrics?.productivityScore?.trend || { value: 5, positive: true }}
          href="/analytics"
        />
        <MetricCard
          icon={<GitBranch size={20} />}
          label="Decisions Made"
          value={decCount}
          subtext={`${metrics?.decisionsMade?.approved ?? 7} Approved`}
          color="#8b5cf6"
          trend={metrics?.decisionsMade?.trend || { value: 14, positive: true }}
          href="/analytics"
        />
        <MetricCard
          icon={<ListChecks size={20} />}
          label="Action Items"
          value={actTotal}
          subtext={`${actRate}% completed`}
          color="#f59e0b"
          trend={metrics?.actionItems?.trend || { value: 8, positive: true }}
          href="/analytics"
        />
        <MetricCard
          icon={<AlertTriangle size={20} />}
          label="Open Risks"
          value={openRiskCount}
          subtext={`${critRisks} Critical Blockers`}
          color="#ef4444"
          href="/analytics"
        />
      </div>

      <div className="dashboard-grid">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* AI Executive Intelligence Spotlight */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} style={{ color: 'var(--color-primary-light)' }} />
                Executive AI Intelligence Briefing
              </h2>
              <button
                onClick={handleGenerateBriefing}
                disabled={isLoadingBriefing}
                className="btn btn-secondary btn-sm"
                style={{ gap: 6, fontSize: 11 }}
              >
                <Zap size={13} className={isLoadingBriefing ? 'animate-spin' : ''} />
                {isLoadingBriefing ? 'Synthesizing...' : 'Refresh AI Briefing'}
              </button>
            </div>

            <div
              style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: 13,
                lineHeight: 1.7,
                color: 'var(--text-primary)',
                whiteSpace: 'pre-line',
              }}
            >
              {aiBriefing || (
                `Across **${totalM} meetings** totaling **${totalH} hours**, the organization maintained a **${prodScore}% productivity score**.
Decision throughput is healthy with **${decCount} architectural/strategic decisions approved** and an **${actRate}% action item completion rate**.
However, **${critRisks} critical security/infrastructure risks** require leadership follow-up. Implementing proposed meeting optimizations could recover approximately **108 hours per month**.`
              )}
            </div>
          </div>

          {/* Latest Meeting Intelligence */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={18} style={{ color: 'var(--color-primary)' }} />
                Latest Meeting Intelligence
              </h2>
              <Link href="/meetings/mtg-demo-001" style={{ color: 'var(--color-primary-light)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                View Full Analysis <ChevronRight size={14} />
              </Link>
            </div>

            <Link href="/meetings/mtg-demo-001" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: 20,
                border: '1px solid var(--border-subtle)',
                marginBottom: 16,
                transition: 'all var(--transition-fast)',
                cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{demoMeeting.title}</h3>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={12} /> {demoMeeting.participantCount} participants
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {formatDuration(demoMeeting.duration)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} /> Sep 17, 2024
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-success">Analyzed</span>
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
                  {[
                    { label: 'Decisions', value: demoDecisions.length, color: '#8b5cf6' },
                    { label: 'Actions', value: demoActions.length, color: '#f59e0b' },
                    { label: 'Risks', value: demoRisks.length, color: '#ef4444' },
                    { label: 'Topics', value: demoTopics.length, color: '#06b6d4' },
                  ].map(stat => (
                    <div key={stat.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Link>

            {/* Productivity Score breakdown */}
            <div style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              padding: 20,
              border: '1px solid var(--border-subtle)',
            }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
                Session Productivity Diagnostic
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                <ScoreRing score={demoMeeting.productivityScore?.overall ?? 87} label="Overall" />
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Agenda Clarity', score: demoMeeting.productivityScore?.agendaClarity ?? 92 },
                    { label: 'Decision Density', score: demoMeeting.productivityScore?.decisionDensity ?? 88 },
                    { label: 'Action Clarity', score: demoMeeting.productivityScore?.actionClarity ?? 91 },
                    { label: 'Participation', score: demoMeeting.productivityScore?.participation ?? 58 },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                        <span style={{ fontWeight: 600 }}>{item.score}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${item.score}%`,
                            background: item.score >= 80 ? 'var(--color-success)' : item.score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Key Executive Action Items */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ListChecks size={18} style={{ color: '#f59e0b' }} />
                High-Priority Action Items
              </h2>
              <Link href="/analytics" style={{ color: 'var(--color-primary-light)', fontSize: 12, textDecoration: 'none' }}>
                View Matrix
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {demoActions.slice(0, 4).map((action) => (
                <div key={action.id} style={{
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: 13,
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>
                    {action.task.length > 55 ? action.task.substring(0, 55) + '...' : action.task}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)' }}>
                    <span>{action.owner}</span>
                    <span className={`badge badge-${action.priority === 'critical' ? 'danger' : action.priority === 'high' ? 'warning' : 'info'}`}
                      style={{ fontSize: 10, padding: '1px 6px' }}>
                      {action.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Meetings List */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={18} style={{ color: 'var(--color-accent)' }} />
                Recent Meetings
              </h2>
              <Link href="/meetings" style={{ color: 'var(--color-primary-light)', fontSize: 12, textDecoration: 'none' }}>
                All Meetings
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {demoMeetingsList.slice(0, 4).map((m) => (
                <Link
                  key={m.id}
                  href={`/meetings/${m.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      {formatDuration(m.duration)} · {m.participantCount} attendees
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-tertiary)', marginLeft: 8 }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Organizational Cost Widget */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Activity size={16} style={{ color: '#ef4444' }} />
              Estimated Meeting Cost
            </h2>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#f87171' }}>
                ₹{(costTotal / 100000).toFixed(1)}L
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                Time investment for {timeRange.toUpperCase()}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>
                Calculated via compensation bands
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
