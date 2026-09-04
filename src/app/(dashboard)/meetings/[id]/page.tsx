'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, Clock, Users, RefreshCw, FileText,
  UserCheck, Activity, Shield, Sparkles, CheckCircle2,
  BrainCircuit, MessageSquare, Award
} from 'lucide-react';
import PipelineProgress from '../components/PipelineProgress';
import TranscriptViewer from '../components/TranscriptViewer';
import SpeakerTimeline from '../components/SpeakerTimeline';
import IntelligenceDashboard from '../components/IntelligenceDashboard';
import MeetingChat from '../components/MeetingChat';
import {
  demoMeeting,
  demoSpeakers,
  demoTranscript,
  demoSummaries,
  demoTopics,
  demoDecisions,
  demoActions,
  demoRisks,
  demoQuestions,
  demoCommitments,
  demoImportantMoments,
  demoProductivityScore,
  formatDuration,
} from '@/lib/demo-data';
import type {
  MeetingSummary,
  Topic,
  Decision,
  ActionItem,
  Risk,
  Commitment,
  ImportantMoment,
  ProductivityScore,
  Speaker,
  TranscriptSegment,
} from '@/types';

interface MeetingDetailData {
  id: string;
  title: string;
  description?: string | null;
  scheduledAt: string | Date;
  durationSeconds?: number;
  duration?: number;
  participantCount: number;
  status: string;
  source: string;
  organizerName?: string;
  recordingUrl?: string | null;
  tags?: string[];
  productivityScore?: { overall: number };
}

export default function MeetingDetailPage() {
  const params = useParams();
  const meetingId = (params?.id as string) || 'mtg-demo-001';

  const [meeting, setMeeting] = useState<MeetingDetailData>(
    demoMeeting as unknown as MeetingDetailData
  );
  const [speakers, setSpeakers] = useState<Speaker[]>(demoSpeakers);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>(demoTranscript);
  
  // Intelligence state
  const [summaries, setSummaries] = useState<MeetingSummary[]>(demoSummaries);
  const [topics, setTopics] = useState<Topic[]>(demoTopics);
  const [decisions, setDecisions] = useState<Decision[]>(demoDecisions);
  const [actionItems, setActionItems] = useState<ActionItem[]>(demoActions);
  const [risks, setRisks] = useState<Risk[]>(demoRisks);
  const [commitments, setCommitments] = useState<Commitment[]>(demoCommitments);
  const [importantMoments, setImportantMoments] = useState<ImportantMoment[]>(demoImportantMoments);
  const [productivityScore, setProductivityScore] = useState<ProductivityScore>(demoProductivityScore);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'intelligence' | 'chat' | 'transcript' | 'speakers' | 'diagnostics' | 'activity'
  >('overview');

  const [isProcessingPipeline, setIsProcessingPipeline] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<'NOT_ANALYZED' | 'ANALYZING' | 'ANALYZED' | 'ANALYSIS_FAILED'>('ANALYZED');

  const loadData = useCallback(async () => {
    try {
      const [mtgRes, intelRes] = await Promise.all([
        fetch(`/api/meetings/${meetingId}`),
        fetch(`/api/meetings/${meetingId}/intelligence`),
      ]);

      if (mtgRes.ok) {
        const data = await mtgRes.json();
        if (data.meeting) {
          setMeeting(data.meeting);
          if (data.meeting.speakers && data.meeting.speakers.length > 0) {
            setSpeakers(data.meeting.speakers);
          }
          if (data.meeting.transcriptSegments && data.meeting.transcriptSegments.length > 0) {
            setTranscript(data.meeting.transcriptSegments);
          }
        }
      }

      if (intelRes.ok) {
        const intelData = await intelRes.json();
        if (intelData.intelligence) {
          const intel = intelData.intelligence;
          if (intel.summaries && intel.summaries.length > 0) setSummaries(intel.summaries);
          if (intel.topics && intel.topics.length > 0) setTopics(intel.topics);
          if (intel.decisions && intel.decisions.length > 0) setDecisions(intel.decisions);
          if (intel.actionItems && intel.actionItems.length > 0) setActionItems(intel.actionItems);
          if (intel.risks && intel.risks.length > 0) setRisks(intel.risks);
          if (intel.commitments && intel.commitments.length > 0) setCommitments(intel.commitments);
          if (intel.importantMoments && intel.importantMoments.length > 0) setImportantMoments(intel.importantMoments);
          if (intel.productivityScore) setProductivityScore(intel.productivityScore);
          setAnalysisStatus('ANALYZED');
        }
      }
    } catch (err) {
      console.warn('Using baseline demo data for detail view:', err);
    }
  }, [meetingId]);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      try {
        const [mtgRes, intelRes] = await Promise.all([
          fetch(`/api/meetings/${meetingId}`),
          fetch(`/api/meetings/${meetingId}/intelligence`),
        ]);

        if (mtgRes.ok) {
          const data = await mtgRes.json();
          if (!ignore && data.meeting) {
            setMeeting(data.meeting);
            if (data.meeting.speakers && data.meeting.speakers.length > 0) {
              setSpeakers(data.meeting.speakers);
            }
            if (data.meeting.transcriptSegments && data.meeting.transcriptSegments.length > 0) {
              setTranscript(data.meeting.transcriptSegments);
            }
          }
        }

        if (intelRes.ok) {
          const intelData = await intelRes.json();
          if (!ignore && intelData.intelligence) {
            const intel = intelData.intelligence;
            if (intel.summaries && intel.summaries.length > 0) setSummaries(intel.summaries);
            if (intel.topics && intel.topics.length > 0) setTopics(intel.topics);
            if (intel.decisions && intel.decisions.length > 0) setDecisions(intel.decisions);
            if (intel.actionItems && intel.actionItems.length > 0) setActionItems(intel.actionItems);
            if (intel.risks && intel.risks.length > 0) setRisks(intel.risks);
            if (intel.commitments && intel.commitments.length > 0) setCommitments(intel.commitments);
            if (intel.importantMoments && intel.importantMoments.length > 0) setImportantMoments(intel.importantMoments);
            if (intel.productivityScore) setProductivityScore(intel.productivityScore);
            setAnalysisStatus('ANALYZED');
          }
        }
      } catch (err) {
        console.warn('Using baseline demo data for detail view:', err);
      }
    }
    fetchData();
    return () => {
      ignore = true;
    };
  }, [meetingId]);

  async function handleTriggerSpeechPipeline() {
    try {
      setIsProcessingPipeline(true);
      const res = await fetch(`/api/meetings/${meetingId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speechProvider: 'demo' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Pipeline execution failed');
      }

      await loadData();
    } catch (err) {
      console.error('Processing error:', err);
    } finally {
      setIsProcessingPipeline(false);
    }
  }

  async function handleTriggerAIAnalysis() {
    try {
      setIsAnalyzingAI(true);
      setAnalysisStatus('ANALYZING');
      const res = await fetch(`/api/meetings/${meetingId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceRegenerate: true }),
      });

      if (!res.ok) {
        setAnalysisStatus('ANALYSIS_FAILED');
        const data = await res.json();
        throw new Error(data.error || 'AI Analysis failed');
      }

      setAnalysisStatus('ANALYZED');
      await loadData();
      setActiveTab('intelligence');
    } catch (err) {
      console.error('AI analysis error:', err);
      setAnalysisStatus('ANALYSIS_FAILED');
    } finally {
      setIsAnalyzingAI(false);
    }
  }

  function handleJumpToTimestamp(timestamp: number) {
    setActiveTab('transcript');
    // Scroll or trigger timestamp seek on transcript viewer
    setTimeout(() => {
      const el = document.getElementById(`segment-${Math.floor(timestamp)}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  const duration = meeting?.durationSeconds ?? meeting?.duration ?? 6300;
  const isPipelineInFlight = ['UPLOADING', 'EXTRACTING_AUDIO', 'TRANSCRIBING', 'DIARIZING'].includes(
    meeting?.status
  );

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Back Button & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
        <Link href="/meetings" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'inherit', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Meetings
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{meeting?.title || 'Meeting Details'}</span>
      </div>

      {/* Header Banner */}
      <div
        className="animate-fade-in"
        style={{
          padding: '28px 32px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, marginBottom: 18 }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="badge badge-primary" style={{ fontSize: 11, textTransform: 'uppercase' }}>
                {meeting?.source || 'UPLOAD'}
              </span>
              <span
                className={`badge ${
                  meeting?.status === 'COMPLETED'
                    ? 'badge-success'
                    : meeting?.status === 'FAILED'
                    ? 'badge-danger'
                    : 'badge-warning'
                }`}
                style={{ fontSize: 11 }}
              >
                {meeting?.status === 'COMPLETED' ? 'Transcript Ready' : meeting?.status}
              </span>
              <span
                style={{
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 12,
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--color-primary-light)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <BrainCircuit size={12} />
                {analysisStatus === 'ANALYZED' ? 'AI Intelligence Active' : analysisStatus}
              </span>
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              {meeting?.title}
            </h1>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {meeting?.description || 'Enterprise architecture and engineering sync.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={handleTriggerAIAnalysis}
              disabled={isAnalyzingAI}
              className="btn btn-primary"
              style={{ gap: 8, background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
            >
              <Sparkles size={14} className={isAnalyzingAI ? 'animate-spin' : ''} />
              {isAnalyzingAI ? 'Analyzing Intelligence...' : 'Run AI Analysis'}
            </button>

            <button
              onClick={handleTriggerSpeechPipeline}
              disabled={isProcessingPipeline}
              className="btn btn-secondary"
              style={{ gap: 8 }}
            >
              <RefreshCw size={14} className={isProcessingPipeline ? 'animate-spin' : ''} />
              {isProcessingPipeline ? 'Transcribing...' : 'Re-run Speech Pipeline'}
            </button>

            <Link href="/voice-box" className="btn btn-secondary" style={{ gap: 8 }}>
              <Sparkles size={14} color="var(--color-primary-light)" /> Voice Box
            </Link>
          </div>
        </div>

        {/* Metadata Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', fontSize: 13, color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} />{' '}
            {meeting?.scheduledAt
              ? new Date(meeting.scheduledAt).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Scheduled'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} /> {formatDuration(duration)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={14} /> {meeting?.participantCount || speakers.length || 1} Participants
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={14} /> Organizer: {meeting?.organizerName || 'Priya Sharma'}
          </span>
        </div>
      </div>

      {/* Speech Pipeline State Progress Bar */}
      {(isPipelineInFlight || meeting?.status === 'FAILED' || isProcessingPipeline) && (
        <PipelineProgress
          status={isProcessingPipeline ? 'TRANSCRIBING' : meeting?.status}
          onRetry={handleTriggerSpeechPipeline}
          isRetrying={isProcessingPipeline}
        />
      )}

      {/* Detail Navigation Tabs */}
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
          { key: 'overview', label: 'Overview', icon: FileText },
          { key: 'intelligence', label: `AI Intelligence (${decisions.length} Dec, ${actionItems.length} Act)`, icon: BrainCircuit },
          { key: 'chat', label: 'Meeting AI Chat', icon: MessageSquare },
          { key: 'transcript', label: `Transcript (${transcript.length})`, icon: FileText },
          { key: 'speakers', label: `Speakers (${speakers.length})`, icon: UserCheck },
          { key: 'diagnostics', label: 'Pipeline Diagnostics', icon: Activity },
          { key: 'activity', label: 'Activity & Audit', icon: Shield },
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
                padding: '12px 20px',
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

      {/* Tab Content */}
      <div className="animate-fade-in">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Executive Summary Card */}
              <div style={{ padding: '24px 28px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Executive Session Summary
                  </h3>
                  <button
                    onClick={() => setActiveTab('intelligence')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-primary-light)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    View Full Intelligence &rarr;
                  </button>
                </div>

                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: 16 }}>
                  {summaries[0]?.content || 'The cross-functional leadership team convened to finalize Q4 cloud modernization plans, Project Phoenix milestones, SOC 2 compliance remediation, and AI compute capacity allocations.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(summaries[0]?.keyPoints || [
                    'AWS Migration approved for legacy authentication service with gateway-first approach.',
                    'Phoenix Web-only launch scheduled for Oct 10, followed by full deployment on Oct 15.',
                    'Mandatory remediation required for 12 critical vulnerabilities before migration kickoff.',
                    '₹25 lakhs GPU compute budget and 4 ML engineers authorized for enterprise intelligence.',
                  ]).map((pt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Speaker Breakdown Preview */}
              <SpeakerTimeline speakers={speakers.slice(0, 4)} totalDurationSeconds={duration} />
            </div>

            {/* Right Column: Quick Stats & Cost */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ padding: 24, borderRadius: 'var(--radius-xl)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                  Meeting Intelligence Metrics
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Productivity Score:</span>
                    <strong style={{ color: 'var(--color-success)' }}>
                      {productivityScore?.overall || 87}/100 (Optimal)
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Decisions Finalized:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{decisions.length} Approved</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Action Items:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{actionItems.length} Tracked</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Risks Identified:</span>
                    <strong style={{ color: 'var(--color-danger)' }}>{risks.length} Highlighted</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Acoustic Segments:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{transcript.length} Indexed</strong>
                  </div>
                </div>
              </div>

              <div style={{ padding: 24, borderRadius: 'var(--radius-xl)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Estimated Meeting Cost
                </h3>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-accent-light)', marginBottom: 4 }}>
                  ₹49,875
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Based on 12 leadership participants across 1h 45m calculated via organizational compensation bands.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI INTELLIGENCE DASHBOARD */}
        {activeTab === 'intelligence' && (
          <IntelligenceDashboard
            meetingId={meetingId}
            summaries={summaries}
            topics={topics}
            decisions={decisions}
            actionItems={actionItems}
            risks={risks}
            commitments={commitments}
            importantMoments={importantMoments}
            productivityScore={productivityScore}
            onJumpToTimestamp={handleJumpToTimestamp}
            onRefreshIntelligence={loadData}
          />
        )}

        {/* TAB 3: MEETING AI CHAT */}
        {activeTab === 'chat' && (
          <MeetingChat
            meetingId={meetingId}
            meetingTitle={meeting?.title || 'Meeting'}
            onJumpToTimestamp={handleJumpToTimestamp}
          />
        )}

        {/* TAB 4: TRANSCRIPT VIEWER */}
        {activeTab === 'transcript' && (
          <TranscriptViewer
            segments={transcript}
            speakers={speakers}
            recordingUrl={meeting?.recordingUrl || undefined}
          />
        )}

        {/* TAB 5: SPEAKERS */}
        {activeTab === 'speakers' && (
          <SpeakerTimeline speakers={speakers} totalDurationSeconds={duration} />
        )}

        {/* TAB 6: DIAGNOSTICS */}
        {activeTab === 'diagnostics' && (
          <div style={{ padding: 28, borderRadius: 'var(--radius-xl)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              AI Intelligence Pipeline Diagnostics & Model Metadata
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              <div style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI Provider Integration</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                  MEETINTEL Enterprise Orchestrator
                </div>
              </div>
              <div style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Structured Validation</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-success)', marginTop: 4 }}>
                  Zod Schema Guard Active (100% Type-Safe)
                </div>
              </div>
              <div style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Speech Recognition Engine</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                  Whisper-Large-v3 (Multi-lingual)
                </div>
              </div>
              <div style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Speaker Diarization</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                  Pyannote Spectral Clustering v3.1
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ACTIVITY & AUDIT */}
        {activeTab === 'activity' && (
          <div style={{ padding: 28, borderRadius: 'var(--radius-xl)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              Meeting Intelligence Audit Trail
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { user: 'Priya Sharma (Organizer)', action: 'Ingested 1h 45m multi-track recording', time: '10:00 AM' },
                { user: 'Pipeline Worker', action: 'Completed acoustic diarization (12 speakers detected)', time: '10:02 AM' },
                { user: 'Pipeline Worker', action: 'Indexed 58 transcript segments with timestamps', time: '10:03 AM' },
                { user: 'AI Orchestrator', action: `Extracted ${decisions.length} decisions, ${actionItems.length} action items, ${risks.length} risks`, time: '10:04 AM' },
                { user: 'AI Orchestrator', action: 'Generated multi-level summaries & calculated 87% productivity score', time: '10:04 AM' },
                { user: 'Rajesh Kumar (CTO)', action: 'Viewed session transcript and verified decisions', time: '10:15 AM' },
              ].map((log, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', fontSize: 13 }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>{log.user}:</strong>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{log.action}</span>
                  </div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
