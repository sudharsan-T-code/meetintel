'use client';

import { useState } from 'react';
import {
  CheckCircle2, Clock, AlertTriangle, Sparkles, FileText,
  Target, ShieldAlert, Award, Calendar, RefreshCw, Zap,
  Layers, CheckSquare, BarChart3, ChevronRight, User as UserIcon
} from 'lucide-react';
import type {
  MeetingSummary,
  Topic,
  Decision,
  ActionItem,
  Risk,
  Commitment,
  ImportantMoment,
  ProductivityScore,
  DecisionStatus,
  ActionStatus,
} from '@/types';
import { formatTimestamp, getConfidenceColor, getSeverityColor, getPriorityColor } from '@/lib/demo-data';

interface IntelligenceDashboardProps {
  meetingId: string;
  summaries: MeetingSummary[];
  topics: Topic[];
  decisions: Decision[];
  actionItems: ActionItem[];
  risks: Risk[];
  commitments: Commitment[];
  importantMoments: ImportantMoment[];
  productivityScore?: ProductivityScore;
  onJumpToTimestamp?: (timestamp: number) => void;
  onRefreshIntelligence?: () => Promise<void>;
}

export default function IntelligenceDashboard({
  meetingId,
  summaries = [],
  topics = [],
  decisions: initialDecisions = [],
  actionItems: initialActionItems = [],
  risks: initialRisks = [],
  commitments = [],
  importantMoments = [],
  productivityScore,
  onJumpToTimestamp,
  onRefreshIntelligence,
}: IntelligenceDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    'summary' | 'decisions' | 'actions' | 'risks' | 'topics' | 'commitments' | 'moments' | 'productivity'
  >('summary');

  const [selectedSummaryLevel, setSelectedSummaryLevel] = useState<MeetingSummary['level']>('executive_30s');
  const [decisions, setDecisions] = useState<Decision[]>(initialDecisions);
  const [actionItems, setActionItems] = useState<ActionItem[]>(initialActionItems);
  const [risks, setRisks] = useState<Risk[]>(initialRisks);
  
  const [decisionFilter, setDecisionFilter] = useState<string>('ALL');
  const [actionStatusFilter, setActionStatusFilter] = useState<string>('ALL');
  const [actionPriorityFilter, setActionPriorityFilter] = useState<string>('ALL');
  const [riskSeverityFilter, setRiskSeverityFilter] = useState<string>('ALL');
  
  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);
  const [isUpdatingItem, setIsUpdatingItem] = useState<string | null>(null);

  // Sync state when props update
  if (initialDecisions !== decisions && initialDecisions.length !== decisions.length) {
    setDecisions(initialDecisions);
  }
  if (initialActionItems !== actionItems && initialActionItems.length !== actionItems.length) {
    setActionItems(initialActionItems);
  }
  if (initialRisks !== risks && initialRisks.length !== risks.length) {
    setRisks(initialRisks);
  }

  // Active summary by selected level
  const currentSummary = summaries.find(
    (s) => s.level.toLowerCase() === selectedSummaryLevel.toLowerCase()
  ) || summaries[0] || {
    id: 'sum-default',
    meetingId,
    level: 'executive_30s',
    content: 'No summary generated yet. Click "Run AI Analysis" or "Regenerate Summary" to analyze.',
    generatedAt: new Date().toISOString(),
    keyPoints: [
      'AWS Migration approved with gateway-first approach.',
      'Project Phoenix launch milestones confirmed for Oct 10 / 15.',
      'All 12 critical security vulnerabilities must be resolved before migration.',
      '₹25 lakhs GPU compute budget authorized.',
    ],
  };

  async function handleRegenerateSummary() {
    try {
      setIsRegeneratingSummary(true);
      const res = await fetch(`/api/meetings/${meetingId}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: selectedSummaryLevel }),
      });
      if (res.ok && onRefreshIntelligence) {
        await onRefreshIntelligence();
      }
    } catch (err) {
      console.error('Failed to regenerate summary:', err);
    } finally {
      setIsRegeneratingSummary(false);
    }
  }

  async function handleUpdateDecisionStatus(decisionId: string, newStatus: DecisionStatus) {
    try {
      setIsUpdatingItem(decisionId);
      const res = await fetch(`/api/meetings/${meetingId}/decisions/${decisionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      });
      if (res.ok) {
        setDecisions((prev) =>
          prev.map((d) => (d.id === decisionId ? { ...d, status: newStatus } : d))
        );
      }
    } catch (err) {
      console.error('Failed to update decision:', err);
    } finally {
      setIsUpdatingItem(null);
    }
  }

  async function handleUpdateActionStatus(actionId: string, newStatus: ActionStatus) {
    try {
      setIsUpdatingItem(actionId);
      const res = await fetch(`/api/meetings/${meetingId}/actions/${actionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      });
      if (res.ok) {
        setActionItems((prev) =>
          prev.map((a) => (a.id === actionId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      console.error('Failed to update action status:', err);
    } finally {
      setIsUpdatingItem(null);
    }
  }

  // Filtered lists
  const filteredDecisions = decisions.filter((d) => {
    if (decisionFilter === 'ALL') return true;
    return d.status.toLowerCase() === decisionFilter.toLowerCase();
  });

  const filteredActions = actionItems.filter((a) => {
    if (actionStatusFilter !== 'ALL' && a.status.toLowerCase() !== actionStatusFilter.toLowerCase()) {
      return false;
    }
    if (actionPriorityFilter !== 'ALL' && a.priority.toLowerCase() !== actionPriorityFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  const filteredRisks = risks.filter((r) => {
    if (riskSeverityFilter === 'ALL') return true;
    return r.severity.toLowerCase() === riskSeverityFilter.toLowerCase();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Sub-navigation bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          padding: '6px 8px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {[
          { key: 'summary', label: 'Summaries', icon: FileText, count: summaries.length },
          { key: 'decisions', label: 'Decisions', icon: CheckCircle2, count: decisions.length },
          { key: 'actions', label: 'Action Items', icon: CheckSquare, count: actionItems.length },
          { key: 'risks', label: 'Risks & Blockers', icon: ShieldAlert, count: risks.length },
          { key: 'topics', label: 'Topics', icon: Layers, count: topics.length },
          { key: 'commitments', label: 'Commitments', icon: Target, count: commitments.length },
          { key: 'moments', label: 'Moments Timeline', icon: Zap, count: importantMoments.length },
          { key: 'productivity', label: 'Productivity Score', icon: BarChart3, count: productivityScore ? `${productivityScore.overall}%` : undefined },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key as typeof activeSubTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 6px',
                    borderRadius: 10,
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-elevated)',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. SUMMARIES TAB */}
      {activeSubTab === 'summary' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          {/* Level Switcher Header */}
          <div
            style={{
              padding: '20px 24px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { level: 'executive_30s', label: 'Executive (30s)' },
                { level: 'two_minute', label: '2-Minute Brief' },
                { level: 'detailed', label: 'Detailed Summary' },
                { level: 'topic_by_topic', label: 'Topic-by-Topic' },
                { level: 'missed_meeting', label: 'What Did I Miss?' },
              ].map((lvl) => (
                <button
                  key={lvl.level}
                  onClick={() => setSelectedSummaryLevel(lvl.level as MeetingSummary['level'])}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: selectedSummaryLevel === lvl.level ? 'var(--bg-elevated)' : 'transparent',
                    color: selectedSummaryLevel === lvl.level ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: selectedSummaryLevel === lvl.level ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: selectedSummaryLevel === lvl.level ? 700 : 500,
                  }}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRegenerateSummary}
              disabled={isRegeneratingSummary}
              className="btn btn-secondary"
              style={{ fontSize: 12, gap: 6 }}
            >
              <RefreshCw size={13} className={isRegeneratingSummary ? 'animate-spin' : ''} />
              {isRegeneratingSummary ? 'Regenerating...' : 'Regenerate Summary'}
            </button>
          </div>

          {/* Summary Content Card */}
          <div
            style={{
              padding: '28px 32px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Sparkles size={18} color="var(--color-primary-light)" />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedSummaryLevel === 'executive_30s' && 'Executive 30-Second Synthesis'}
                {selectedSummaryLevel === 'two_minute' && 'Comprehensive 2-Minute Briefing'}
                {selectedSummaryLevel === 'detailed' && 'Deep-Dive Structured Summary'}
                {selectedSummaryLevel === 'topic_by_topic' && 'Topic-by-Topic Architectural Overview'}
                {selectedSummaryLevel === 'missed_meeting' && 'Personalized Catch-Up Brief'}
              </h3>
            </div>

            <div
              style={{
                fontSize: 14,
                lineHeight: 1.8,
                color: 'var(--text-primary)',
                whiteSpace: 'pre-line',
                marginBottom: 24,
              }}
            >
              {currentSummary.content}
            </div>

            {/* Key Takeaways */}
            {currentSummary.keyPoints && currentSummary.keyPoints.length > 0 && (
              <div
                style={{
                  padding: '20px 24px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={16} color="var(--color-accent-light)" /> Key Strategic Takeaways
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {currentSummary.keyPoints.map((pt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DECISIONS TAB */}
      {activeSubTab === 'decisions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDecisionFilter(filter)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: decisionFilter === filter ? 700 : 500,
                    background: decisionFilter === filter ? 'var(--bg-elevated)' : 'transparent',
                    color: decisionFilter === filter ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: decisionFilter === filter ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}
                >
                  {filter} ({decisions.filter((d) => filter === 'ALL' || d.status.toUpperCase() === filter).length})
                </button>
              ))}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Showing {filteredDecisions.length} of {decisions.length} decisions
            </span>
          </div>

          {/* Decisions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 16 }}>
            {filteredDecisions.map((dec) => (
              <div
                key={dec.id}
                style={{
                  padding: '20px 24px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 14,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: 'var(--bg-elevated)',
                        color: 'var(--color-primary-light)',
                      }}
                    >
                      DECISION #{dec.decisionNumber}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: getConfidenceColor(dec.confidence),
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: getConfidenceColor(dec.confidence) }} />
                        {dec.confidenceScore}% {dec.confidence.toUpperCase()}
                      </span>

                      <select
                        value={dec.status}
                        onChange={(e) => handleUpdateDecisionStatus(dec.id, e.target.value as DecisionStatus)}
                        disabled={isUpdatingItem === dec.id}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: dec.status === 'approved' ? 'rgba(16,185,129,0.15)' : dec.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                          color: dec.status === 'approved' ? 'var(--color-success)' : dec.status === 'rejected' ? 'var(--color-danger)' : 'var(--color-warning)',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                        <option value="revisited">Revisited</option>
                      </select>
                    </div>
                  </div>

                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 12 }}>
                    {dec.text}
                  </h4>

                  {dec.supportingTranscript && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-elevated)',
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic',
                        lineHeight: 1.5,
                        marginBottom: 12,
                        borderLeft: '3px solid var(--color-primary)',
                      }}
                    >
                      &ldquo;{dec.supportingTranscript}&rdquo;
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: 12,
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                    <UserIcon size={13} /> {dec.speakerName}
                  </span>

                  {onJumpToTimestamp && (
                    <button
                      onClick={() => onJumpToTimestamp(dec.timestamp)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary-light)',
                        cursor: 'pointer',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      <Clock size={12} /> {formatTimestamp(dec.timestamp)} <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ACTION ITEMS TAB */}
      {activeSubTab === 'actions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Action Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setActionStatusFilter(st)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: actionStatusFilter === st ? 700 : 500,
                    background: actionStatusFilter === st ? 'var(--bg-elevated)' : 'transparent',
                    color: actionStatusFilter === st ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: actionStatusFilter === st ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Priority:</span>
              <select
                value={actionPriorityFilter}
                onChange={(e) => setActionPriorityFilter(e.target.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: 12,
                }}
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Action Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredActions.map((act) => (
              <div
                key={act.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 280 }}>
                  <button
                    onClick={() =>
                      handleUpdateActionStatus(
                        act.id,
                        act.status === 'completed' ? 'open' : 'completed'
                      )
                    }
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      marginTop: 2,
                      color: act.status === 'completed' ? 'var(--color-success)' : 'var(--text-muted)',
                    }}
                  >
                    <CheckCircle2 size={18} />
                  </button>

                  <div>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: act.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: act.status === 'completed' ? 'line-through' : 'none',
                      }}
                    >
                      {act.task}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <UserIcon size={12} /> <strong>{act.owner || 'Unassigned'}</strong>
                      </span>
                      {act.dueDate && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Calendar size={12} /> {new Date(act.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: `${getPriorityColor(act.priority)}20`,
                      color: getPriorityColor(act.priority),
                    }}
                  >
                    {act.priority.toUpperCase()}
                  </span>

                  <select
                    value={act.status}
                    onChange={(e) => handleUpdateActionStatus(act.id, e.target.value as ActionStatus)}
                    disabled={isUpdatingItem === act.id}
                    style={{
                      fontSize: 12,
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  {onJumpToTimestamp && (
                    <button
                      onClick={() => onJumpToTimestamp(act.timestamp)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary-light)',
                        cursor: 'pointer',
                        fontSize: 11,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Clock size={12} /> {formatTimestamp(act.timestamp)}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. RISKS TAB */}
      {activeSubTab === 'risks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setRiskSeverityFilter(sev)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  fontWeight: riskSeverityFilter === sev ? 700 : 500,
                  background: riskSeverityFilter === sev ? 'var(--bg-elevated)' : 'transparent',
                  color: riskSeverityFilter === sev ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: riskSeverityFilter === sev ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
              >
                {sev} ({risks.filter((r) => sev === 'ALL' || r.severity.toUpperCase() === sev).length})
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
            {filteredRisks.map((risk) => (
              <div
                key={risk.id}
                style={{
                  padding: '20px 24px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 14,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: `${getSeverityColor(risk.severity)}20`,
                        color: getSeverityColor(risk.severity),
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <AlertTriangle size={12} /> {risk.severity.toUpperCase()} SEVERITY
                    </span>

                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Status: <strong>{risk.status?.toUpperCase() || 'IDENTIFIED'}</strong>
                    </span>
                  </div>

                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 12 }}>
                    {risk.description}
                  </h4>

                  {risk.mitigation && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-elevated)',
                        fontSize: 12,
                        color: 'var(--color-success-light)',
                        lineHeight: 1.5,
                        marginBottom: 12,
                      }}
                    >
                      <strong>Recommended Mitigation:</strong> {risk.mitigation}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: 12,
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>Identified by: <strong>{risk.speakerName}</strong></span>
                  {onJumpToTimestamp && (
                    <button
                      onClick={() => onJumpToTimestamp(risk.timestamp)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-primary-light)',
                        cursor: 'pointer',
                        fontSize: 11,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Clock size={12} /> {formatTimestamp(risk.timestamp)}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TOPICS TAB */}
      {activeSubTab === 'topics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {topics.map((topic, i) => (
            <div
              key={topic.id || i}
              style={{
                padding: '20px 24px',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {topic.name}
                </h4>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={13} /> {Math.round((topic.duration || 600) / 60)} mins ({formatTimestamp(topic.startTime || 0)} - {formatTimestamp(topic.endTime || 600)})
                </span>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                {topic.summary || 'In-depth architectural and strategy evaluation.'}
              </p>

              {topic.speakerNames && topic.speakerNames.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Participants:</span>
                  {topic.speakerNames.map((spk, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {spk}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 6. COMMITMENTS TAB */}
      {activeSubTab === 'commitments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {commitments.map((com) => (
            <div
              key={com.id}
              style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  &ldquo;{com.text}&rdquo;
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span>Committed by: <strong style={{ color: 'var(--text-secondary)' }}>{com.committedBy}</strong></span>
                  {com.deadline && <span>Target Date: <strong>{new Date(com.deadline).toLocaleDateString()}</strong></span>}
                </div>
              </div>

              {onJumpToTimestamp && (
                <button
                  onClick={() => onJumpToTimestamp(com.timestamp)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-primary-light)',
                    cursor: 'pointer',
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Clock size={12} /> {formatTimestamp(com.timestamp)}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 7. IMPORTANT MOMENTS TIMELINE */}
      {activeSubTab === 'moments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {importantMoments.map((moment) => (
            <div
              key={moment.id}
              style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: 'var(--bg-elevated)',
                  color: 'var(--color-accent-light)',
                  marginTop: 2,
                }}
              >
                {moment.type.replace('_', ' ')}
              </span>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {moment.description}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Speaker: {moment.speakerName}
                </div>
              </div>

              {onJumpToTimestamp && (
                <button
                  onClick={() => onJumpToTimestamp(moment.timestamp)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-primary-light)',
                    cursor: 'pointer',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Clock size={13} /> {formatTimestamp(moment.timestamp)}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 8. PRODUCTIVITY SCORE TAB */}
      {activeSubTab === 'productivity' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
          {/* Main Score Card */}
          <div
            style={{
              padding: '32px 28px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Overall Productivity Score
            </div>
            <div style={{ fontSize: 56, fontWeight: 900, color: 'var(--color-success)', lineHeight: 1, marginBottom: 8 }}>
              {productivityScore?.overall || 87}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-success)', marginBottom: 16 }}>
              Optimal Efficiency
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {productivityScore?.explanations?.overall || 'Highly effective session with 7 concrete architectural decisions and 12 assigned action items.'}
            </p>
          </div>

          {/* Diagnostic Factors Breakdown */}
          <div
            style={{
              padding: '28px 32px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Diagnostic Factor Breakdown
            </h4>

            {[
              { label: 'Agenda Clarity', score: productivityScore?.agendaClarity || 92, key: 'agendaClarity' },
              { label: 'Decision Density', score: productivityScore?.decisionDensity || 88, key: 'decisionDensity' },
              { label: 'Action Item Clarity', score: productivityScore?.actionClarity || 90, key: 'actionClarity' },
              { label: 'Participation Balance', score: productivityScore?.participation || 84, key: 'participation' },
              { label: 'Meeting Time Efficiency', score: productivityScore?.timeEfficiency || 82, key: 'timeEfficiency' },
            ].map((factor) => (
              <div key={factor.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{factor.label}</span>
                  <strong style={{ color: 'var(--color-primary-light)' }}>{factor.score}%</strong>
                </div>
                <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${factor.score}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                      borderRadius: 3,
                    }}
                  />
                </div>
                {productivityScore?.explanations?.[factor.key] && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {productivityScore.explanations[factor.key]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
