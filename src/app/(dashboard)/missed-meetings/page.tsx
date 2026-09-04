'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock, CheckCircle2, AlertTriangle, ListChecks, GitBranch,
  ArrowUpRight, Sparkles, User, Calendar, X, Shield, FileText
} from 'lucide-react';
import { MissedMeetingItem, MissedMeetingBriefing } from '@/lib/db/missed-meetings';

export default function MissedMeetingsPage() {
  const [missedMeetings, setMissedMeetings] = useState<MissedMeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<MissedMeetingBriefing | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  const fetchMissedMeetings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/missed-meetings');
      const data = await res.json();
      if (data.missedMeetings) {
        setMissedMeetings(data.missedMeetings);
      }
    } catch (e) {
      console.error('Failed to load missed meetings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissedMeetings();
  }, []);

  async function handleOpenBriefing(meetingId: string) {
    setSelectedMeetingId(meetingId);
    setBriefingLoading(true);
    try {
      const res = await fetch(`/api/missed-meetings/${meetingId}`);
      const data = await res.json();
      if (data.briefing) {
        setBriefing(data.briefing);
      }
    } catch (e) {
      console.error('Failed to load briefing:', e);
    } finally {
      setBriefingLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
            Missed Meetings & Executive Catch-up
          </h1>
          <span style={{
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--color-primary-light)',
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <Sparkles size={12} /> AI Personalized Briefings
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
          Never fall behind on unattended sessions. Get 30-second executive recaps, direct action item assignments, and critical decisions without watching hour-long recordings.
        </p>
      </div>

      {/* Grid of Missed Meetings */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          Loading missed meetings...
        </div>
      ) : missedMeetings.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <CheckCircle2 size={36} color="var(--color-primary-light)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>Fully Synchronized</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            You are up to date on all organizational meetings.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: 20,
        }}>
          {missedMeetings.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: item.priority === 'CRITICAL' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)',
              }}
            >
              <div>
                {/* Card Top Meta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: item.priority === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: item.priority === 'CRITICAL' ? '#f87171' : '#fbbf24',
                    border: item.priority === 'CRITICAL' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                  }}>
                    {item.priority} PRIORITY
                  </span>

                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={12} /> {new Date(item.scheduledAt).toLocaleDateString()} ({item.durationMinutes}m)
                  </div>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', lineHeight: 1.3 }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                  {item.executiveSummary}
                </p>

                {/* Key takeaway metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  marginBottom: 16,
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary-light)' }}>
                      {item.actionsAssignedToUserCount}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Assigned to You</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#4ade80' }}>
                      {item.keyDecisionsCount}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Decisions</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: item.criticalRisksCount > 0 ? '#f87171' : '#94a3b8' }}>
                      {item.criticalRisksCount}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Critical Risks</div>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 12,
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  Organizer: <strong>{item.organizerName}</strong>
                </span>

                <button
                  onClick={() => handleOpenBriefing(item.meetingId)}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px' }}
                >
                  <Sparkles size={13} /> Catch Up (30s)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Personalized Briefing Modal */}
      {selectedMeetingId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20,
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: 760,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 28,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--color-primary-light)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginBottom: 4,
                }}>
                  <Sparkles size={12} /> Personalized Executive Briefing
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
                  {briefing?.meeting.title || 'Loading Briefing...'}
                </h2>
              </div>

              <button
                onClick={() => {
                  setSelectedMeetingId(null);
                  setBriefing(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {briefingLoading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                Generating grounded executive summary...
              </div>
            ) : briefing ? (
              <div>
                {/* 30s Executive Summary */}
                <div style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  marginBottom: 20,
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                }}>
                  <strong>Executive Takeaway:</strong> {briefing.executiveSummary}
                </div>

                {/* Direct Action Items */}
                {briefing.myActionItems.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ListChecks size={15} color="var(--color-primary-light)" /> Action Items Assigned To You
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {briefing.myActionItems.map((a) => (
                        <div
                          key={a.id}
                          style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: '10px 14px',
                            fontSize: 13,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{a.task}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#fbbf24' }}>
                            {a.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approved Decisions */}
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <GitBranch size={15} color="#4ade80" /> Key Decisions Approved
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {briefing.keyDecisions.map((d) => (
                      <div
                        key={d.id}
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 14px',
                          fontSize: 13,
                          lineHeight: 1.4,
                        }}
                      >
                        {d.text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Follow-up */}
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Recommended Next Steps
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {briefing.recommendedFollowUp.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>

                {/* Modal Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button
                    onClick={() => {
                      setSelectedMeetingId(null);
                      setBriefing(null);
                    }}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                  <Link
                    href={`/meetings/${briefing.meeting.id}`}
                    className="btn-primary"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    Open Full Meeting Recording & Transcript <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
