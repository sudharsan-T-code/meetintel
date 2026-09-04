'use client';

import Link from 'next/link';
import {
  Brain, Mic, BarChart3, Shield, Zap, Users, ArrowRight,
  CheckCircle2, GitBranch, ListChecks, Clock, FileText,
  Target, Activity, ChevronRight, Play, Star,
  Lock, Globe, MessageSquare, Search
} from 'lucide-react';

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: 28,
      transition: 'all var(--transition-normal)',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        width: 48, height: 48,
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-primary-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 36, fontWeight: 800 }} className="gradient-text">{value}</div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
        className="glass"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={20} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>MEETINTEL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Features</a>
          <a href="#voice-box" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>AI Voice Box</a>
          <a href="#analytics" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Analytics</a>
          <a href="#security" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Security</a>
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            Launch Demo <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingTop: 160,
        paddingBottom: 100,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '0 40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-full)',
            fontSize: 13,
            color: 'var(--color-primary-light)',
            fontWeight: 500,
            marginBottom: 24,
          }}>
            <Zap size={14} />
            CTS Techathon 2026 — Enterprise Meeting Intelligence
          </div>

          <h1 style={{
            fontSize: 56,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 24,
          }}>
            Turn Every Meeting Into<br />
            <span className="gradient-text">Actionable Intelligence</span>
          </h1>

          <p style={{
            fontSize: 20,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: 700,
            margin: '0 auto 40px',
          }}>
            AI-powered meeting intelligence that captures decisions, actions, risks and everything your team missed.
            <br />
            <em style={{ color: 'var(--text-tertiary)', fontSize: 16 }}>
              Don&apos;t just attend meetings. Understand them.
            </em>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 80 }}>
            <Link href="/dashboard" className="btn btn-primary btn-lg">
              <Play size={18} />
              Experience Meeting Intelligence
            </Link>
            <Link href="/voice-box" className="btn btn-secondary btn-lg">
              <Mic size={18} />
              Try AI Voice Box
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 40,
            maxWidth: 700,
            margin: '0 auto',
          }}>
            <StatItem value="487" label="Participants Analyzed" />
            <StatItem value="7" label="Decisions Captured" />
            <StatItem value="14" label="Actions Extracted" />
            <StatItem value="12" label="Speakers Identified" />
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section style={{
        padding: '80px 40px',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
            The Meeting Intelligence Gap
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Organizations lose thousands of hours of institutional knowledge because meetings aren&apos;t converted into structured intelligence.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}>
          {[
            { icon: '🤯', text: 'Important decisions get buried in 500-person meetings' },
            { icon: '📝', text: 'Meeting notes are inconsistent and incomplete' },
            { icon: '🔍', text: 'Action items are forgotten without clear ownership' },
            { icon: '⏰', text: 'Follow-ups happen manually, if at all' },
            { icon: '📊', text: 'No visibility into organizational meeting efficiency' },
            { icon: '🎯', text: 'Critical risks and commitments go untracked' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '20px 24px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 14,
              color: 'var(--text-secondary)',
            }}>
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '80px 40px',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Meeting → Understanding → <span className="gradient-text">Intelligence</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            A complete platform that transforms raw meetings into structured organizational intelligence.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
        }}>
          <FeatureCard
            icon={<Mic size={24} style={{ color: 'var(--color-primary-light)' }} />}
            title="AI Voice Box"
            description="Upload or record meetings. The AI processes audio/video, identifies speakers, and extracts structured intelligence automatically."
          />
          <FeatureCard
            icon={<MessageSquare size={24} style={{ color: 'var(--color-accent)' }} />}
            title='"What Did I Miss?"'
            description="Ask the AI about anything you missed. Get personalized answers with evidence, timestamps, and confidence indicators."
          />
          <FeatureCard
            icon={<GitBranch size={24} style={{ color: '#8b5cf6' }} />}
            title="Decision Intelligence"
            description="Automatically detect and track decisions with owner, timestamp, confidence level, and supporting transcript evidence."
          />
          <FeatureCard
            icon={<ListChecks size={24} style={{ color: '#f59e0b' }} />}
            title="Action Item Engine"
            description="Smart extraction of action items from natural language, including indirect assignments, with owner and deadline detection."
          />
          <FeatureCard
            icon={<Users size={24} style={{ color: '#10b981' }} />}
            title="Speaker Intelligence"
            description="Speaker diarization with participation analytics, speaking time, topics discussed, and contribution scoring."
          />
          <FeatureCard
            icon={<BarChart3 size={24} style={{ color: '#ef4444' }} />}
            title="Productivity Analytics"
            description="Meeting productivity scores, cost estimation, decision density, and organizational meeting health metrics."
          />
          <FeatureCard
            icon={<Search size={24} style={{ color: '#06b6d4' }} />}
            title="Semantic Search"
            description="Search across all meetings by topic, speaker, decision, or concept. Find any piece of meeting intelligence instantly."
          />
          <FeatureCard
            icon={<Clock size={24} style={{ color: '#f97316' }} />}
            title="Meeting Timeline"
            description="Visual timeline of important moments — decisions, risks, announcements, and commitments — with one-click navigation."
          />
          <FeatureCard
            icon={<Shield size={24} style={{ color: '#6366f1' }} />}
            title="Enterprise Security"
            description="Multi-tenant architecture with RBAC, encrypted storage, audit logging, consent tracking, and SOC 2-ready design."
          />
        </div>
      </section>

      {/* Voice Box Section */}
      <section id="voice-box" style={{
        padding: '80px 40px',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
            The AI Voice Box
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 700, margin: '0 auto' }}>
            Upload a meeting recording. Our AI pipeline processes speech, identifies speakers, segments topics,
            and produces a complete intelligence dashboard in minutes.
          </p>
        </div>

        {/* Pipeline Visualization */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: 40,
          maxWidth: 800,
          margin: '0 auto',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { icon: <Mic size={18} />, label: 'Audio/Video Upload', desc: 'MP3, WAV, M4A, MP4, WebM' },
              { icon: <Activity size={18} />, label: 'Speech-to-Text', desc: 'Whisper / Cloud Speech APIs' },
              { icon: <Users size={18} />, label: 'Speaker Diarization', desc: 'Who said what, when' },
              { icon: <FileText size={18} />, label: 'Topic Segmentation', desc: 'Automatic topic clustering' },
              { icon: <Brain size={18} />, label: 'AI Intelligence Extraction', desc: 'Decisions, Actions, Risks, Moments' },
              { icon: <Target size={18} />, label: 'Meeting Intelligence Dashboard', desc: 'Complete structured intelligence' },
            ].map((step, i) => (
              <div key={i}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '14px 0',
                }}>
                  <div style={{
                    width: 40, height: 40,
                    borderRadius: '50%',
                    background: 'var(--color-primary-glow)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-primary-light)',
                    flexShrink: 0,
                  }}>
                    {step.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{step.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{step.desc}</div>
                  </div>
                </div>
                {i < 5 && (
                  <div style={{
                    width: 1,
                    height: 20,
                    background: 'var(--border-default)',
                    marginLeft: 20,
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" style={{
        padding: '80px 40px',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Enterprise-Ready Architecture
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Designed for multi-tenant deployment with enterprise-grade security, compliance, and governance.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
        }}>
          {[
            { icon: <Lock size={20} />, title: 'Multi-Tenant Isolation', desc: 'Complete data isolation between organizations' },
            { icon: <Shield size={20} />, title: 'RBAC', desc: 'Role-based access control with 6 roles' },
            { icon: <FileText size={20} />, title: 'Audit Logging', desc: 'Complete audit trail for all data access' },
            { icon: <Globe size={20} />, title: 'OAuth 2.0', desc: 'Secure integrations with Google, Microsoft, Zoom' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '24px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
            }}>
              <div style={{
                width: 44, height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
                color: 'var(--color-primary-light)',
              }}>
                {item.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '100px 40px',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.06), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <h2 style={{ fontSize: 42, fontWeight: 900, marginBottom: 16, letterSpacing: '-0.02em', position: 'relative' }}>
          Ready to Experience<br />
          <span className="gradient-text">Meeting Intelligence?</span>
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32, position: 'relative' }}>
          Explore our demo with a 487-participant enterprise strategy meeting — fully analyzed by AI.
        </p>
        <div style={{ position: 'relative' }}>
          <Link href="/dashboard" className="btn btn-primary btn-lg" style={{ fontSize: 16, padding: '16px 36px' }}>
            <Play size={20} />
            Launch Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 40px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--text-tertiary)',
        fontSize: 13,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain size={16} />
          <span style={{ fontWeight: 700 }}>MEETINTEL</span>
          <span>— CTS Techathon 2026</span>
        </div>
        <div>
          Enterprise-ready architecture · Designed for multi-tenant deployment · OAuth-based integrations
        </div>
      </footer>
    </div>
  );
}
