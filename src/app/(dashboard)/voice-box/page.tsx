'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Mic, Upload, Play, Clock, Users, Brain, FileText,
  GitBranch, ListChecks, AlertTriangle, ChevronRight,
  MessageSquare, Zap, Target, Activity, ChevronDown,
  CheckCircle2, Star, ArrowRight, Send, Search, X
} from 'lucide-react';
import {
  demoMeeting, demoMeetingIntelligence, demoSpeakers,
  demoTranscript, demoTopics, demoDecisions, demoActions,
  demoRisks, demoImportantMoments, demoMissedInsights,
  demoSummaries, demoQuestions,
  formatDuration, formatTimestamp, getConfidenceColor,
  getSeverityColor, getPriorityColor
} from '@/lib/demo-data';
import type { ChatMessage } from '@/types';

type VoiceBoxState = 'upload' | 'processing' | 'analyzed';

// Pre-built chat responses
const chatResponses: Record<string, { content: string; sources: { speaker: string; timestamp: number; text: string }[] }> = {
  'what did the cto say': {
    content: `**Rajesh Kumar (CTO)** made several critical statements during the meeting:

1. **Meeting Expectations** (00:45) — Set the tone that decisions must be made today, not deferred.

2. **AWS Migration Approval** (10:25) — Formally approved the authentication service migration to AWS with a gateway-first approach.

3. **Security Mandate** (34:25) — Mandated remediation of all 12 critical vulnerabilities, requiring authentication fixes before migration.

4. **Phoenix Decision** (51:25) — Approved phased launch — web on Oct 10, full on Oct 15. No further delays permitted.

5. **AI Investment** (76:45) — Approved ₹25 lakhs GPU budget and 4 ML engineers. Designated AI as second-highest priority after cloud migration.

6. **Closing Summary** (1:41:00) — Summarized all key decisions and required all action owners to update status by end of week.`,
    sources: [
      { speaker: 'Rajesh Kumar', timestamp: 45, text: 'I want decisions made today, not deferred.' },
      { speaker: 'Rajesh Kumar', timestamp: 625, text: 'We approve the AWS migration for the authentication service.' },
      { speaker: 'Rajesh Kumar', timestamp: 4605, text: 'Approved. Fatima, you have budget approval for the GPU compute and the hiring.' },
    ],
  },
  'what decisions were made': {
    content: `**7 decisions** were made during this meeting:

1. ✅ **AWS Migration Approved** — Authentication service migration to AWS with gateway-first approach. Timeline: October. *(Confidence: 96%)*

2. ✅ **Security Review Required** — All 12 critical vulnerabilities must be reviewed before migration. *(Confidence: 94%)*

3. ✅ **Phoenix Phased Launch** — Web-only Oct 10, full launch Oct 15. No further slips. *(Confidence: 97%)*

4. ✅ **SOC 2 Preparation Mandatory** — All critical vulns resolved before November audit. *(Confidence: 92%)*

5. ✅ **AI Investment Approved** — ₹25 lakhs GPU + 4 ML engineers for Q4. *(Confidence: 95%)*

6. ✅ **Enterprise Early Access** — Meridian, Stellar, TechNova get web access Oct 10. *(Confidence: 91%)*

7. ⏳ **Budget Revision Required** — Finance sign-off needed before migration proceeds. *(Confidence: 93%)*`,
    sources: [
      { speaker: 'Rajesh Kumar', timestamp: 625, text: 'We approve the AWS migration for the authentication service.' },
      { speaker: 'Rajesh Kumar', timestamp: 3085, text: 'We will do a phased rollout.' },
      { speaker: 'Rajesh Kumar', timestamp: 4605, text: 'Approved. Fatima, you have budget approval.' },
    ],
  },
  'who owns the migration': {
    content: `The AWS cloud migration has **three designated owners** with clear responsibilities:

1. **Sarah Chen** (VP of Engineering) — Owns overall migration execution
   - *Source: CTO assignment at 10:25*

2. **David Kim** (Director of DevOps) — Owns infrastructure preparation
   - Due: October 1
   - *Source: CTO assignment at 10:25*

3. **Ananya Patel** (CISO) — Owns security review completion before migration
   - Due: October 1
   - *Source: CTO mandate at 34:25*

**Supporting roles:**
- **Wei Zhang** (Engineering Lead) — API gateway implementation (10-12 business days)
- **Alex Thompson** (Principal Architect) — AI infrastructure alignment with migration architecture`,
    sources: [
      { speaker: 'Rajesh Kumar', timestamp: 625, text: 'David, you own the infrastructure preparation. Sarah, you own the overall migration execution.' },
      { speaker: 'Sarah Chen', timestamp: 495, text: 'I\'ll assign Wei Zhang\'s team to the gateway.' },
    ],
  },
  'what about project phoenix': {
    content: `**Project Phoenix** was a major discussion topic (18 minutes):

**Status:** Launch delayed by approximately 1 week
**Root Cause:** Mobile app dependency — push notification system rebuild underestimated

**Decision:**
- Phased rollout approved by CTO
- Phase 1: Web-only for 3 enterprise clients on **October 10**
- Phase 2: Full launch with mobile on **October 15**
- **No further delays** permitted

**Risks:**
- Three enterprise clients at risk (Meridian, Stellar, TechNova)
- Q4 revenue targets potentially impacted

**Actions:**
- Michael Rodriguez: Ensure Phoenix ready for phased launch
- James O'Brien: Communicate plan to enterprise clients immediately

**Good news:** AI recommendation engine (Fatima's team) is ready and not on the critical path.`,
    sources: [
      { speaker: 'Michael Rodriguez', timestamp: 2640, text: 'We\'re going to slip. The mobile app integration is not ready.' },
      { speaker: 'Rajesh Kumar', timestamp: 3085, text: 'The revised launch date is October 15th. No further slips.' },
    ],
  },
  'default': {
    content: `Based on the meeting analysis, I found relevant information about your question. Here are the key findings from the "Global Product & Engineering Strategy Meeting":

The meeting covered 7 major topics over 1 hour 42 minutes with 487 participants. 7 decisions were made, 14 action items were assigned, and 10 risks were identified.

You can ask me more specific questions like:
- "What did the CTO say?"
- "What decisions were made?"
- "Who owns the migration?"
- "What about Project Phoenix?"
- "What risks were identified?"
- "Show all action items"

I answer based **only** on the meeting transcript — I will not fabricate information.`,
    sources: [],
  },
};

export default function VoiceBoxPage() {
  const [state, setState] = useState<VoiceBoxState>('upload');
  const [processingStep, setProcessingStep] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState<string>('missed');
  const [showTranscript, setShowTranscript] = useState(false);
  const [jumpToTimestamp, setJumpToTimestamp] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const processingSteps = [
    'Uploading audio/video...',
    'Extracting audio stream...',
    'Transcribing speech-to-text...',
    'Identifying speakers (diarization)...',
    'Segmenting topics...',
    'Detecting important moments...',
    'Extracting decisions & actions...',
    'Analyzing risks & commitments...',
    'Generating intelligence...',
    'Analysis complete!',
  ];

  const handleDemoProcess = () => {
    setState('processing');
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProcessingStep(step);
      if (step >= processingSteps.length - 1) {
        clearInterval(interval);
        setTimeout(() => setState('analyzed'), 800);
      }
    }, 600);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      meetingId: 'mtg-demo-001',
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString(),
      type: 'fact',
    };

    setChatMessages(prev => [...prev, userMsg]);

    const query = chatInput.toLowerCase();
    let responseData = chatResponses['default'];

    if (query.includes('cto') || query.includes('rajesh')) {
      responseData = chatResponses['what did the cto say'];
    } else if (query.includes('decision')) {
      responseData = chatResponses['what decisions were made'];
    } else if (query.includes('migration') || query.includes('owner') || query.includes('who owns')) {
      responseData = chatResponses['who owns the migration'];
    } else if (query.includes('phoenix') || query.includes('launch') || query.includes('product')) {
      responseData = chatResponses['what about project phoenix'];
    }

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `chat-${Date.now()}-resp`,
        meetingId: 'mtg-demo-001',
        role: 'assistant',
        content: responseData.content,
        timestamp: new Date().toISOString(),
        type: 'fact',
        sources: responseData.sources.map(s => ({
          segmentId: '',
          speakerName: s.speaker,
          timestamp: s.timestamp,
          text: s.text,
          confidence: 'high' as const,
        })),
      };
      setChatMessages(prev => [...prev, assistantMsg]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, 800);

    setChatInput('');
  };

  // ---- UPLOAD STATE ----
  if (state === 'upload') {
    return (
      <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <div className="animate-fade-in">
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Mic size={22} color="white" />
            </div>
            AI Voice Box
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 40 }}>
            Upload a meeting recording or connect an integration to generate complete meeting intelligence.
          </p>
        </div>

        {/* Upload Area */}
        <div style={{
          border: '2px dashed var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: '60px 40px',
          textAlign: 'center',
          marginBottom: 32,
          transition: 'all var(--transition-normal)',
          cursor: 'pointer',
          background: 'var(--bg-surface)',
        }}
          onClick={handleDemoProcess}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.background = 'var(--color-primary-glow)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.background = 'var(--bg-surface)';
          }}
        >
          <Upload size={48} style={{ color: 'var(--color-primary-light)', marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Drop your meeting recording here
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
            or click to browse files
          </p>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            Supports: MP3, WAV, M4A, MP4, WebM • Max 500MB
          </div>
        </div>

        {/* Demo Button */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.1))',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          textAlign: 'center',
          marginBottom: 32,
        }}>
          <Zap size={20} style={{ color: 'var(--color-primary-light)', marginBottom: 8 }} />
          <h4 style={{ fontWeight: 700, marginBottom: 4 }}>Try the Demo</h4>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Experience AI Voice Box with a pre-analyzed 487-participant strategy meeting
          </p>
          <button className="btn btn-primary" onClick={handleDemoProcess}>
            <Play size={16} />
            Launch Demo Analysis
          </button>
        </div>

        {/* Integrations */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Or Connect an Integration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { name: 'Google Meet', color: '#10b981', desc: 'Connect via Google Workspace OAuth' },
              { name: 'Microsoft Teams', color: '#3b82f6', desc: 'Connect via Microsoft Graph API' },
              { name: 'Zoom', color: '#2563eb', desc: 'Connect via Zoom OAuth' },
            ].map(int => (
              <div key={int.name} style={{
                padding: 20,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: int.color }} />
                  <span style={{ fontWeight: 600 }}>{int.name}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>{int.desc}</p>
                <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  Connect Integration
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- PROCESSING STATE ----
  if (state === 'processing') {
    return (
      <div style={{ padding: '32px 40px', maxWidth: 700, margin: '80px auto', textAlign: 'center' }}>
        <div className="animate-fade-in">
          <div style={{
            width: 80, height: 80,
            borderRadius: '50%',
            background: 'var(--color-primary-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Brain size={36} style={{ color: 'var(--color-primary-light)', animation: 'pulse 2s infinite' }} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Analyzing Meeting</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>
            AI is processing your meeting recording...
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
          {processingSteps.map((step, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: i === processingStep ? 'var(--color-primary-glow)' :
                i < processingStep ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
              border: `1px solid ${i === processingStep ? 'rgba(99, 102, 241, 0.3)' :
                i < processingStep ? 'rgba(16, 185, 129, 0.15)' : 'var(--border-subtle)'}`,
              opacity: i > processingStep ? 0.4 : 1,
              transition: 'all var(--transition-normal)',
            }}>
              {i < processingStep ? (
                <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
              ) : i === processingStep ? (
                <div style={{
                  width: 18, height: 18,
                  borderRadius: '50%',
                  border: '2px solid var(--color-primary-light)',
                  borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite',
                }} />
              ) : (
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--border-default)' }} />
              )}
              <span style={{
                fontSize: 14,
                fontWeight: i === processingStep ? 600 : 400,
                color: i <= processingStep ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}>
                {step}
              </span>
            </div>
          ))}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ---- ANALYZED STATE ----
  const tabs = [
    { id: 'missed', label: 'What You Missed', icon: <Zap size={14} /> },
    { id: 'chat', label: 'Ask the Meeting', icon: <MessageSquare size={14} /> },
    { id: 'summary', label: 'Summary', icon: <FileText size={14} /> },
    { id: 'speakers', label: 'Speakers', icon: <Users size={14} /> },
    { id: 'decisions', label: 'Decisions', icon: <GitBranch size={14} /> },
    { id: 'actions', label: 'Actions', icon: <ListChecks size={14} /> },
    { id: 'risks', label: 'Risks', icon: <AlertTriangle size={14} /> },
    { id: 'topics', label: 'Topics', icon: <Target size={14} /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock size={14} /> },
    { id: 'transcript', label: 'Transcript', icon: <FileText size={14} /> },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Meeting Header */}
      <div className="animate-fade-in" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
              fontSize: 12, color: '#34d399', fontWeight: 600, marginBottom: 8,
            }}>
              <CheckCircle2 size={12} /> Demo Intelligence — Meeting Analyzed
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{demoMeeting.title}</h1>
            <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={14} /> {demoMeeting.participantCount} participants
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={14} /> {formatDuration(demoMeeting.duration)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <GitBranch size={14} /> {demoDecisions.length} decisions
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ListChecks size={14} /> {demoActions.length} actions
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertTriangle size={14} /> {demoRisks.length} risks
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm">Export PDF</button>
            <button className="btn btn-secondary btn-sm">Export JSON</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav" style={{ marginBottom: 24 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in" style={{ minHeight: 500 }}>
        {/* WHAT YOU MISSED */}
        {activeTab === 'missed' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(6, 182, 212, 0.08))',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              marginBottom: 24,
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={20} style={{ color: 'var(--color-primary-light)' }} />
                What You Missed
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                You missed key discussions. Here&apos;s what happened — with evidence from the meeting.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {demoMissedInsights.map((insight, i) => (
                <div key={insight.id} className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: 'var(--color-primary-glow)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 800, color: 'var(--color-primary-light)',
                        }}>
                          {i + 1}
                        </span>
                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{insight.title}</h3>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 32 }}>
                        {formatTimestamp(insight.timeRange.start)} — {formatTimestamp(insight.timeRange.end)}
                        {' · '}
                        {insight.speakerNames.join(', ')}
                      </div>
                    </div>
                    <span className={`badge badge-${insight.confidence === 'high' ? 'success' : 'warning'}`}>
                      {insight.confidence} confidence
                    </span>
                  </div>

                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16, marginLeft: 32 }}>
                    {insight.description}
                  </p>

                  <div style={{ marginLeft: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Important Points */}
                    <div style={{
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      padding: 16,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Key Points
                      </div>
                      {insight.importantPoints.map((point, j) => (
                        <div key={j} style={{ display: 'flex', gap: 8, fontSize: 13, marginBottom: 4, color: 'var(--text-secondary)' }}>
                          <CheckCircle2 size={14} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 2 }} />
                          {point}
                        </div>
                      ))}
                    </div>

                    {/* Decisions & Actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {insight.decisions.length > 0 && (
                        <div style={{ background: 'rgba(139, 92, 246, 0.08)', borderRadius: 'var(--radius-md)', padding: 12, border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Decisions ({insight.decisions.length})
                          </div>
                          {insight.decisions.map(d => (
                            <div key={d.id} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                              • {d.text.length > 80 ? d.text.substring(0, 80) + '...' : d.text}
                            </div>
                          ))}
                        </div>
                      )}
                      {insight.risks.length > 0 && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-md)', padding: 12, border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#f87171', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Risks ({insight.risks.length})
                          </div>
                          {insight.risks.map(r => (
                            <div key={r.id} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                              • {r.description.length > 80 ? r.description.substring(0, 80) + '...' : r.description}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHAT */}
        {activeTab === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 240px)' }}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
              {/* Chat Header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Brain size={18} style={{ color: 'var(--color-primary-light)' }} />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Ask the Meeting</span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  — AI answers based only on meeting evidence
                </span>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {chatMessages.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <MessageSquare size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
                    <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Ask anything about this meeting</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
                      The AI will answer using only evidence from the meeting transcript.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                      {[
                        'What did the CTO say?',
                        'What decisions were made?',
                        'Who owns the migration?',
                        'What about Project Phoenix?',
                      ].map(q => (
                        <button
                          key={q}
                          className="btn btn-secondary btn-sm"
                          onClick={() => { setChatInput(q); }}
                          style={{ fontSize: 12 }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {chatMessages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div className={`chat-bubble ${msg.role}`}>
                      {msg.role === 'assistant' ? (
                        <div>
                          <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.7 }}
                            dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }}
                          />
                          {msg.sources && msg.sources.length > 0 && (
                            <div style={{ marginTop: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Sources
                              </div>
                              {msg.sources.map((src, i) => (
                                <div key={i} style={{
                                  fontSize: 12,
                                  color: 'var(--text-secondary)',
                                  padding: '6px 10px',
                                  background: 'var(--bg-overlay)',
                                  borderRadius: 'var(--radius-sm)',
                                  marginBottom: 4,
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                  <span><strong>{src.speakerName}</strong> — &quot;{src.text.substring(0, 50)}...&quot;</span>
                                  <button
                                    className="btn btn-ghost btn-sm"
                                    style={{ padding: '2px 8px', fontSize: 11 }}
                                    onClick={() => {
                                      setActiveTab('transcript');
                                      setJumpToTimestamp(src.timestamp);
                                    }}
                                  >
                                    ▶ {formatTimestamp(src.timestamp)}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex', gap: 8,
              }}>
                <input
                  className="input"
                  placeholder="Ask about the meeting... e.g. &quot;What did the CTO say about the migration?&quot;"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                />
                <button className="btn btn-primary" onClick={handleSendChat} disabled={!chatInput.trim()}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUMMARY */}
        {activeTab === 'summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {demoSummaries.slice(0, 3).map(summary => (
              <div key={summary.id} className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span className={`badge badge-${summary.level === 'executive_30s' ? 'primary' : summary.level === 'two_minute' ? 'info' : 'neutral'}`}>
                    {summary.level === 'executive_30s' ? '30-Second Executive Summary' :
                      summary.level === 'two_minute' ? '2-Minute Summary' :
                        summary.level === 'detailed' ? 'Detailed Summary' :
                          summary.level === 'missed_meeting' ? 'What You Missed' : 'Topic Summary'}
                  </span>
                </div>
                <div style={{
                  fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap',
                }}
                  dangerouslySetInnerHTML={{
                    __html: summary.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary)">$1</strong>')
                      .replace(/^# (.*)/gm, '<h2 style="font-size:18px;font-weight:800;color:var(--text-primary);margin:24px 0 8px">$1</h2>')
                      .replace(/^## (.*)/gm, '<h3 style="font-size:15px;font-weight:700;color:var(--text-primary);margin:20px 0 8px">$1</h3>')
                      .replace(/^- (.*)/gm, '<div style="display:flex;gap:8px;margin-bottom:4px">• $1</div>')
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* SPEAKERS */}
        {activeTab === 'speakers' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
            {demoSpeakers.map(speaker => (
              <div key={speaker.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: `hsl(${(speaker.name.charCodeAt(0) * 37) % 360}, 50%, 40%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: 'white',
                  }}>
                    {speaker.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{speaker.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{speaker.role}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{formatDuration(speaker.speakingDuration)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Speaking time</div>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{speaker.speakingPercentage}%</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Participation</div>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Topics
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {speaker.topicsDiscussed.map(topic => (
                      <span key={topic} className="badge badge-primary" style={{ fontSize: 11 }}>{topic}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, fontSize: 11 }}>
                  <div style={{ textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '6px 4px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{speaker.contributionCount}</div>
                    <div style={{ color: 'var(--text-tertiary)' }}>Contrib.</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '6px 4px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{speaker.questionsAsked}</div>
                    <div style={{ color: 'var(--text-tertiary)' }}>Questions</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '6px 4px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{speaker.commitmentsMade}</div>
                    <div style={{ color: 'var(--text-tertiary)' }}>Commits</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '6px 4px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{speaker.decisionsInfluenced.length}</div>
                    <div style={{ color: 'var(--text-tertiary)' }}>Decisions</div>
                  </div>
                </div>

                {/* Participation bar */}
                <div style={{ marginTop: 12 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${speaker.speakingPercentage * 5}%`,
                      background: `hsl(${(speaker.name.charCodeAt(0) * 37) % 360}, 60%, 55%)`,
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DECISIONS */}
        {activeTab === 'decisions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {demoDecisions.map(decision => (
              <div key={decision.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'rgba(139, 92, 246, 0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, color: '#a78bfa',
                    }}>
                      {decision.decisionNumber}
                    </span>
                    <span className={`badge badge-${decision.status === 'approved' ? 'success' : decision.status === 'pending' ? 'warning' : 'neutral'}`}>
                      {decision.status}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                      {decision.category}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`confidence-dot confidence-${decision.confidence}`} />
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{decision.confidenceScore}%</span>
                  </div>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, lineHeight: 1.5 }}>
                  {decision.text}
                </h4>
                <div style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                  marginBottom: 8,
                  borderLeft: '3px solid var(--color-primary)',
                }}>
                  &quot;{decision.supportingTranscript}&quot;
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)' }}>
                  <span>{decision.speakerName} · {decision.topicName}</span>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '2px 8px', fontSize: 11 }}
                    onClick={() => {
                      setActiveTab('transcript');
                      setJumpToTimestamp(decision.timestamp);
                    }}
                  >
                    ▶ {formatTimestamp(decision.timestamp)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACTIONS */}
        {activeTab === 'actions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {demoActions.map(action => (
              <div key={action.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, lineHeight: 1.5 }}>
                      {action.task}
                    </h4>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span className={`badge badge-${action.priority === 'critical' ? 'danger' : action.priority === 'high' ? 'warning' : 'info'}`}>
                        {action.priority}
                      </span>
                      <span className="badge badge-neutral">{action.status}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`confidence-dot confidence-${action.confidence}`} />
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{action.confidenceScore}%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span><strong>Owner:</strong> {action.owner}</span>
                    {action.dueDate && <span><strong>Due:</strong> {new Date(action.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>}
                    <span>Source: {action.sourceSpeaker}</span>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '2px 8px', fontSize: 11 }}
                    onClick={() => {
                      setActiveTab('transcript');
                      setJumpToTimestamp(action.timestamp);
                    }}
                  >
                    ▶ {formatTimestamp(action.timestamp)}
                  </button>
                </div>
                {action.requiresConfirmation && (
                  <div style={{
                    marginTop: 8, padding: '6px 10px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12, color: '#fbbf24',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <AlertTriangle size={12} />
                    Owner requires confirmation
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* RISKS */}
        {activeTab === 'risks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {demoRisks.map(risk => (
              <div key={risk.id} className="card" style={{
                padding: 20,
                borderLeft: `3px solid ${getSeverityColor(risk.severity)}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <span className={`badge badge-${risk.severity === 'critical' ? 'danger' : risk.severity === 'high' ? 'warning' : 'info'}`}>
                        {risk.severity}
                      </span>
                      <span className={`badge badge-${risk.status === 'mitigating' ? 'primary' : 'neutral'}`}>
                        {risk.status}
                      </span>
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>{risk.description}</h4>
                  </div>
                </div>
                {risk.mitigation && (
                  <div style={{
                    marginTop: 8, padding: '8px 12px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13, color: 'var(--text-secondary)',
                  }}>
                    <strong style={{ color: '#34d399' }}>Mitigation:</strong> {risk.mitigation}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>
                  <span>{risk.speakerName} · {risk.topicName}</span>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '2px 8px', fontSize: 11 }}
                    onClick={() => {
                      setActiveTab('transcript');
                      setJumpToTimestamp(risk.timestamp);
                    }}
                  >
                    ▶ {formatTimestamp(risk.timestamp)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TOPICS */}
        {activeTab === 'topics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {demoTopics.map(topic => (
              <div key={topic.id} className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{topic.name}</h3>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      {formatDuration(topic.duration)} · {formatTimestamp(topic.startTime)} — {formatTimestamp(topic.endTime)} · {topic.speakerNames.length} speakers
                    </div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-primary-light)' }}>
                    {formatDuration(topic.duration)}
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                  {topic.summary}
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {topic.speakerNames.map(name => (
                    <span key={name} className="badge badge-neutral" style={{ fontSize: 11 }}>{name}</span>
                  ))}
                  {topic.decisions.length > 0 && (
                    <span className="badge badge-primary">{topic.decisions.length} decisions</span>
                  )}
                  {topic.actions.length > 0 && (
                    <span className="badge badge-warning">{topic.actions.length} actions</span>
                  )}
                  {topic.risks.length > 0 && (
                    <span className="badge badge-danger">{topic.risks.length} risks</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TIMELINE */}
        {activeTab === 'timeline' && (
          <div style={{ maxWidth: 800 }}>
            {demoImportantMoments.map(moment => {
              const typeColors: Record<string, string> = {
                decision: '#8b5cf6',
                risk: '#ef4444',
                announcement: '#3b82f6',
                commitment: '#10b981',
                escalation: '#f97316',
                deadline: '#f59e0b',
                executive_statement: '#6366f1',
                important_change: '#ec4899',
                action_assigned: '#06b6d4',
              };
              const color = typeColors[moment.type] || '#6b7280';

              return (
                <div key={moment.id} className="timeline-item">
                  <div className="timeline-dot" style={{ borderColor: color, background: `${color}20` }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, position: 'absolute', top: 2, left: 2 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span className="badge" style={{ background: `${color}15`, color, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {moment.type.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{moment.speakerName}</span>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>{moment.description}</p>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12, flexShrink: 0 }}
                      onClick={() => {
                        setActiveTab('transcript');
                        setJumpToTimestamp(moment.timestamp);
                      }}
                    >
                      {formatTimestamp(moment.timestamp)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TRANSCRIPT */}
        {activeTab === 'transcript' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {demoTranscript.map(segment => {
              const isHighlighted = jumpToTimestamp !== null && Math.abs(segment.startTime - jumpToTimestamp) < 5;
              return (
                <div
                  key={segment.id}
                  id={`seg-${segment.startTime}`}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: isHighlighted ? 'var(--color-primary-glow)' : segment.isImportant ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                    border: isHighlighted ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                    transition: 'all var(--transition-normal)',
                  }}
                >
                  <div style={{ width: 60, flexShrink: 0, fontSize: 12, color: 'var(--color-primary-light)', fontFamily: 'monospace', paddingTop: 2 }}>
                    {formatTimestamp(segment.startTime)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: `hsl(${(segment.speakerName.charCodeAt(0) * 37) % 360}, 60%, 65%)`,
                      }}>
                        {segment.speakerName}
                      </span>
                      {segment.isImportant && (
                        <span className="badge badge-warning" style={{ fontSize: 10 }}>
                          <Star size={10} style={{ marginRight: 2 }} />
                          {segment.importanceReason}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {segment.text}
                    </p>
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
