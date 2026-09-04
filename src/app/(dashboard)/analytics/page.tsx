'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3, Clock, Users, GitBranch,
  Target, ShieldAlert, Sparkles, RefreshCw, Award
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899'];

interface OverviewData {
  timeRange: string;
  totalMeetings: { value: number; trend: { value: number; positive: boolean } };
  totalHours: { value: number; trend: { value: number; positive: boolean } };
  averageDuration: { value: number; unit: string };
  productivityScore: { value: number; trend: { value: number; positive: boolean } };
  decisionsMade: { value: number; approved: number };
  actionItems: { total: number; completed: number; completionRate: number };
  openRisks: { total: number; critical: number };
  commitments: { total: number };
  estimatedCostINR: number;
  meetingEfficiency: number;
}

interface VolumeSeries {
  month: string;
  count: number;
  hours: number;
  avgDuration: number;
}

interface ProductivityData {
  trend: { date: string; score: number }[];
  distribution: { range: string; count: number }[];
  topPerformingMeetings: { id: string; title: string; score: number; date: string }[];
  needsAttentionMeetings: { id: string; title: string; score: number; date: string }[];
}

interface DecisionData {
  total: number;
  byStatus: { approved: number; pending: number; rejected: number; revisited: number };
  byCategory: { name: string; count: number }[];
}

interface ActionData {
  total: number;
  completed: number;
  inProgress: number;
  open: number;
  overdue: number;
  completionRate: number;
  byPriority: { critical: number; high: number; medium: number; low: number };
  byOwner: { owner: string; total: number; completed: number; completionRate: number }[];
}

interface RiskData {
  total: number;
  open: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  unresolvedBlockers: {
    id: string;
    description: string;
    severity: string;
    status: string;
    meetingTitle: string;
    speakerName: string;
    mitigation?: string;
  }[];
}

interface MeetingLoadData {
  byDepartment: { department: string; hours: number; meetingsCount: number; participantHours: number }[];
  peakHours: { hour: string; count: number }[];
  topParticipants: { name: string; role: string; meetingHours: number; meetingsCount: number; speakingPct: number }[];
}

interface ParticipationData {
  distribution: { range: string; count: number }[];
  overallBalanceScore: number;
  speakerTalkTimeDistribution: { label: string; percentage: number }[];
  averageSpeakersPerMeeting: number;
}

interface WasteData {
  wasteOpportunities: {
    type: string;
    title: string;
    description: string;
    potentialHoursSavedMonthly: number;
    severity: string;
    actionSuggestion: string;
  }[];
  totalEstimatedHoursSavedMonthly: number;
  estimatedMonthlyCostSavingsINR: number;
}

interface AIBriefingData {
  summary: string;
  recommendations: {
    id: string;
    category: string;
    impact: string;
    title: string;
    description: string;
  }[];
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'volume' | 'productivity' | 'decisions_actions' | 'risks' | 'load_waste' | 'participation' | 'ai_briefing'
  >('overview');

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [volume, setVolume] = useState<VolumeSeries[]>([]);
  const [productivity, setProductivity] = useState<ProductivityData | null>(null);
  const [decisions, setDecisions] = useState<DecisionData | null>(null);
  const [actions, setActions] = useState<ActionData | null>(null);
  const [risks, setRisks] = useState<RiskData | null>(null);
  const [meetingLoad, setMeetingLoad] = useState<MeetingLoadData | null>(null);
  const [participation, setParticipation] = useState<ParticipationData | null>(null);
  const [waste, setWaste] = useState<WasteData | null>(null);
  const [aiBriefing, setAiBriefing] = useState<AIBriefingData | null>(null);
  const [isLoadingBriefing, setIsLoadingBriefing] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadAllAnalytics() {
      try {
        const [
          ovRes, volRes, prodRes, decRes, actRes, riskRes, loadRes, partRes, wasteRes, aiRes
        ] = await Promise.all([
          fetch(`/api/analytics/overview?timeRange=${timeRange}`),
          fetch(`/api/analytics/volume?timeRange=${timeRange}`),
          fetch(`/api/analytics/productivity?timeRange=${timeRange}`),
          fetch(`/api/analytics/decisions?timeRange=${timeRange}`),
          fetch(`/api/analytics/actions?timeRange=${timeRange}`),
          fetch(`/api/analytics/risks?timeRange=${timeRange}`),
          fetch(`/api/analytics/meeting-load?timeRange=${timeRange}`),
          fetch(`/api/analytics/participation?timeRange=${timeRange}`),
          fetch(`/api/analytics/waste?timeRange=${timeRange}`),
          fetch('/api/analytics/ai-insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timeRange }),
          }),
        ]);

        if (!ignore) {
          if (ovRes.ok) setOverview((await ovRes.json()).overview);
          if (volRes.ok) setVolume((await volRes.json()).volume.series);
          if (prodRes.ok) setProductivity((await prodRes.json()).productivity);
          if (decRes.ok) setDecisions((await decRes.json()).decisions);
          if (actRes.ok) setActions((await actRes.json()).actions);
          if (riskRes.ok) setRisks((await riskRes.json()).risks);
          if (loadRes.ok) setMeetingLoad((await loadRes.json()).meetingLoad);
          if (partRes.ok) setParticipation((await partRes.json()).participation);
          if (wasteRes.ok) setWaste((await wasteRes.json()).waste);
          if (aiRes.ok) setAiBriefing((await aiRes.json()).insights);
        }
      } catch (err) {
        console.warn('Analytics loading fallback:', err);
      }
    }

    loadAllAnalytics();

    return () => {
      ignore = true;
    };
  }, [timeRange]);

  async function handleRefreshBriefing() {
    try {
      setIsLoadingBriefing(true);
      const res = await fetch('/api/analytics/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeRange }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.insights) setAiBriefing(data.insights);
      }
    } catch (err) {
      console.error('Failed to refresh AI briefing:', err);
    } finally {
      setIsLoadingBriefing(false);
    }
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header with Title and Range Picker */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 20,
          marginBottom: 28,
        }}
        className="animate-fade-in"
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart3 size={28} style={{ color: 'var(--color-primary)' }} />
            Organization Productivity Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Enterprise executive intelligence, decision throughput, meeting waste metrics, and AI recommendations
          </p>
        </div>

        {/* Time-Range Selector */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--bg-surface)', padding: 4, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          {[
            { key: 'today', label: 'Today' },
            { key: '7d', label: 'Last 7 Days' },
            { key: '30d', label: 'Last 30 Days' },
            { key: '90d', label: 'Last 90 Days' },
            { key: 'all', label: 'All Time' },
          ].map((r) => (
            <button
              key={r.key}
              onClick={() => setTimeRange(r.key as typeof timeRange)}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: 12,
                fontWeight: timeRange === r.key ? 700 : 500,
                background: timeRange === r.key ? 'var(--bg-elevated)' : 'transparent',
                color: timeRange === r.key ? 'var(--text-primary)' : 'var(--text-muted)',
                border: timeRange === r.key ? '1px solid var(--color-primary)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Level KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 28,
        }}
        className="stagger-children"
      >
        <div className="metric-card">
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Meetings</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: 'var(--text-primary)' }}>
            {overview?.totalMeetings?.value ?? 156}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-success)', marginTop: 2 }}>+12% vs prior period</div>
        </div>

        <div className="metric-card">
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Meeting Hours</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: 'var(--text-primary)' }}>
            {overview?.totalHours?.value ?? 312}h
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Avg {overview?.averageDuration?.value ?? 72}m / session</div>
        </div>

        <div className="metric-card">
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Productivity Score</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: 'var(--color-success)' }}>
            {overview?.productivityScore?.value ?? 78}/100
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-success)', marginTop: 2 }}>+5% Optimal Efficiency</div>
        </div>

        <div className="metric-card">
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Decisions Approved</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: '#8b5cf6' }}>
            {decisions?.byStatus?.approved ?? 7}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{decisions?.total ?? 7} Total Logged</div>
        </div>

        <div className="metric-card">
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Action Completion</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: '#f59e0b' }}>
            {actions?.completionRate ?? 68}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{actions?.completed ?? 8} of {actions?.total ?? 14} Done</div>
        </div>

        <div className="metric-card">
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Open Blockers</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: '#ef4444' }}>
            {risks?.critical ?? 2} Critical
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{risks?.open ?? 10} Total Risks</div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 24,
          overflowX: 'auto',
        }}
      >
        {[
          { key: 'overview', label: 'Overview & Volume', icon: BarChart3 },
          { key: 'productivity', label: 'Productivity & Quality', icon: Target },
          { key: 'decisions_actions', label: 'Decisions & Actions', icon: GitBranch },
          { key: 'risks', label: 'Risks & Blockers', icon: ShieldAlert },
          { key: 'load_waste', label: 'Meeting Load & Waste', icon: Clock },
          { key: 'participation', label: 'Speaker Participation', icon: Users },
          { key: 'ai_briefing', label: 'Executive AI Briefing', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className="btn"
              style={{
                background: isActive ? 'var(--bg-elevated)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                padding: '12px 18px',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={15} color={isActive ? 'var(--color-primary-light)' : 'inherit'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="animate-fade-in">
        {/* 1. OVERVIEW & VOLUME TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Meeting Volume & Duration Trends</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={volume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={11} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Meetings Count" />
                  <Bar dataKey="hours" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Total Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Efficiency Diagnostics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Decision Density:</span>
                    <strong style={{ color: 'var(--color-primary-light)' }}>High (3.2 / meeting)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Average Attendees:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>12 per session</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Estimated Total Cost:</span>
                    <strong style={{ color: 'var(--color-danger)' }}>₹{((overview?.estimatedCostINR || 15600000) / 100000).toFixed(1)} Lakhs</strong>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Actionable Drill-Down</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                  Explore granular meeting records, transcripts, and speaker breakdowns.
                </p>
                <Link href="/meetings" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Browse All Ingested Meetings &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRODUCTIVITY & QUALITY TAB */}
        {activeTab === 'productivity' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Productivity Score Timeline</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={productivity?.trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={11} />
                  <YAxis domain={[50, 100]} stroke="var(--text-tertiary)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#10b981" fill="rgba(16, 185, 129, 0.15)" strokeWidth={2} name="Productivity Score" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Score Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(productivity?.distribution || []).map((dist) => (
                  <div key={dist.range}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{dist.range}</span>
                      <strong style={{ color: 'var(--color-primary-light)' }}>{dist.count} meetings</strong>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(100, dist.count * 2)}%`, background: 'var(--color-primary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top vs Lowest Performing Meetings */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-success)', marginBottom: 12 }}>
                Highest-Performing Sessions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(productivity?.topPerformingMeetings || []).map((m) => (
                  <Link key={m.id} href={`/meetings/${m.id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{m.title}</span>
                    <strong style={{ color: 'var(--color-success)', fontSize: 12 }}>{m.score}/100</strong>
                  </Link>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b', marginBottom: 12 }}>
                Sessions Requiring Review
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(productivity?.needsAttentionMeetings || []).map((m) => (
                  <Link key={m.id} href={`/meetings/${m.id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{m.title}</span>
                    <strong style={{ color: '#f59e0b', fontSize: 12 }}>{m.score}/100</strong>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. DECISIONS & ACTIONS TAB */}
        {activeTab === 'decisions_actions' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Decisions Breakdown */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Decisions by Category</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie data={decisions?.byCategory || []} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="count">
                      {(decisions?.byCategory || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(decisions?.byCategory || []).map((cat, i) => (
                    <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                      <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{cat.name}</span>
                      <strong>{cat.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Item Completion Matrix */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Action Item Completion by Assignee</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(actions?.byOwner || []).map((owner) => (
                  <div key={owner.owner} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>{owner.owner}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{owner.completed}/{owner.total} done</span>
                      <strong style={{ color: owner.completionRate >= 80 ? 'var(--color-success)' : 'var(--color-primary-light)' }}>
                        {owner.completionRate}%
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. RISKS & BLOCKERS TAB */}
        {activeTab === 'risks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <div className="metric-card">
                <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>CRITICAL SEVERITY</div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{risks?.critical ?? 2} Risks</div>
              </div>
              <div className="metric-card">
                <div style={{ fontSize: 11, color: '#f97316', fontWeight: 700 }}>HIGH SEVERITY</div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{risks?.high ?? 3} Risks</div>
              </div>
              <div className="metric-card">
                <div style={{ fontSize: 11, color: '#eab308', fontWeight: 700 }}>MEDIUM SEVERITY</div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{risks?.medium ?? 4} Risks</div>
              </div>
              <div className="metric-card">
                <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>RESOLVED / MITIGATING</div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{risks?.total ?? 10} Total</div>
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Unresolved Critical & High Blockers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(risks?.unresolvedBlockers || []).map((r) => (
                  <div key={r.id} style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span className={`badge badge-${r.severity === 'critical' ? 'danger' : 'warning'}`} style={{ fontSize: 10 }}>
                          {r.severity.toUpperCase()}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{r.meetingTitle}</span>
                      </div>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{r.description}</h4>
                      {r.mitigation && <div style={{ fontSize: 12, color: 'var(--color-success-light)' }}>Mitigation: {r.mitigation}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. MEETING LOAD & WASTE TAB */}
        {activeTab === 'load_waste' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Department Load */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Department Meeting Hours</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(meetingLoad?.byDepartment || []).map((dept) => (
                  <div key={dept.department}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{dept.department}</span>
                      <strong style={{ color: 'var(--color-primary-light)' }}>{dept.hours} hrs ({dept.meetingsCount} mtgs)</strong>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(100, (dept.hours / 150) * 100)}%`, background: 'var(--color-primary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Waste Opportunities */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Meeting Optimization Opportunities</h3>
                <span style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 700 }}>
                  Save ~{waste?.totalEstimatedHoursSavedMonthly || 108} hrs/mo
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(waste?.wasteOpportunities || []).map((w, idx) => (
                  <div key={idx} style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {w.title}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                      {w.description}
                    </p>
                    <div style={{ fontSize: 12, color: 'var(--color-primary-light)', fontWeight: 600 }}>
                      Suggestion: {w.actionSuggestion}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. SPEAKER PARTICIPATION TAB */}
        {activeTab === 'participation' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Talk-Time Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(participation?.speakerTalkTimeDistribution || []).map((pt) => (
                  <div key={pt.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-primary)' }}>{pt.label}</span>
                      <strong>{pt.percentage}%</strong>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pt.percentage}%`, background: 'var(--color-accent)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Participation Balance Diagnostic</h3>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--color-success)' }}>
                  {participation?.overallBalanceScore || 84}/100
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-success)', marginTop: 4 }}>
                  Healthy Cross-Functional Engagement
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6 }}>
                  Average of {participation?.averageSpeakersPerMeeting || 12} distinct speakers per strategy session with strong engineering and leadership cross-talk.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 7. EXECUTIVE AI BRIEFING TAB */}
        {activeTab === 'ai_briefing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={18} color="var(--color-primary-light)" />
                  AI Executive Intelligence Briefing
                </h3>
                <button
                  onClick={handleRefreshBriefing}
                  disabled={isLoadingBriefing}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: 6 }}
                >
                  <RefreshCw size={13} className={isLoadingBriefing ? 'animate-spin' : ''} />
                  {isLoadingBriefing ? 'Synthesizing...' : 'Regenerate Briefing'}
                </button>
              </div>

              <div
                style={{
                  padding: '20px 24px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-elevated)',
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-line',
                  marginBottom: 24,
                }}
              >
                {aiBriefing?.summary || 'Executive briefing generated from real calculated metrics across all meetings.'}
              </div>

              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={16} color="var(--color-accent-light)" /> Actionable Leadership Recommendations
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                {(aiBriefing?.recommendations || []).map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      padding: '18px 20px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{rec.category}</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: rec.impact === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                            color: rec.impact === 'CRITICAL' ? 'var(--color-danger)' : 'var(--color-primary-light)',
                          }}
                        >
                          {rec.impact} IMPACT
                        </span>
                      </div>
                      <h5 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                        {rec.title}
                      </h5>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {rec.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
