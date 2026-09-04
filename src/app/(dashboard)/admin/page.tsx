'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  Building2,
  Database,
  Activity,
  FileText,
  Lock,
  ArrowUpRight,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  KeyRound,
} from 'lucide-react';

interface OverviewData {
  organization: {
    name: string;
    domain: string;
    plan: string;
    transcriptRetentionDays: number;
    recordingRetentionDays: number;
  };
  metrics: {
    totalUsers: number;
    activeUsers: number;
    meetingsProcessed: number;
    estimatedStorageFormatted: string;
    aiProcessingHours: number;
    connectedIntegrations: number;
    totalIntegrationsAvailable: number;
    systemHealth: string;
    securityStatus: string;
  };
  integrationsHealth: Array<{
    provider: string;
    name: string;
    status: string;
    health: string;
    mode: string;
  }>;
  recentSecurityEvents: Array<{
    id: string;
    event: string;
    severity: string;
    time: string;
  }>;
  recentAuditLogs: Array<{
    id: string;
    userName: string;
    action: string;
    resource: string;
    timestamp: string;
  }>;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/overview');
      if (!res.ok) {
        throw new Error(res.status === 403 ? 'Access Forbidden: Admin privileges required.' : 'Failed to load admin overview.');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Error fetching administration overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ height: 32, width: 250, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} className="skeleton" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: 110, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }} className="skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', maxWidth: 800, margin: '0 auto' }}>
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <AlertTriangle size={40} style={{ color: 'var(--color-danger, #ef4444)', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Administration Access</h2>
          <p style={{ color: 'var(--text-secondary, #94a3b8)', marginBottom: 20 }}>{error}</p>
          <button onClick={fetchOverview} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1280, margin: '0 auto' }} className="animate-fade-in">
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Enterprise Administration
            </h1>
            <span className="badge badge-primary" style={{ fontSize: 11, fontWeight: 700 }}>
              {data.organization.plan}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Governance, access control, audit compliance, and system posture for {data.organization.name}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/admin/users" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <UserPlus size={16} /> Invite Member
          </Link>
          <button onClick={fetchOverview} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} title="Refresh metrics">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Workspace</span>
            <Building2 size={18} style={{ color: '#818cf8' }} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data.organization.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Domain: {data.organization.domain || 'cognizant.com'}</div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Users</span>
            <Users size={18} style={{ color: '#34d399' }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
            {data.metrics.activeUsers} <span style={{ fontSize: 14, color: 'var(--text-tertiary)', fontWeight: 500 }}>/ {data.metrics.totalUsers} total</span>
          </div>
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={12} /> Active in organization
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Meetings Processed</span>
            <Database size={18} style={{ color: '#fbbf24' }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
            {data.metrics.meetingsProcessed}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            Storage: {data.metrics.estimatedStorageFormatted}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>AI Processing</span>
            <Activity size={18} style={{ color: '#22d3ee' }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
            {data.metrics.aiProcessingHours}h
          </div>
          <div style={{ fontSize: 11, color: '#06b6d4', marginTop: 4 }}>
            Engine: {data.metrics.securityStatus}
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 24, marginBottom: 28 }}>
        {/* Connected Enterprise Integrations Health */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={18} style={{ color: 'var(--color-primary-light)' }} /> Integration Health & Governance
            </h2>
            <Link href="/integrations" style={{ fontSize: 12, color: 'var(--color-primary-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Manage <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.integrationsHealth.map((item) => (
              <div
                key={item.provider}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-elevated, rgba(255,255,255,0.03))',
                  borderRadius: 8,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Mode: {item.mode} • OAuth 2.0</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge badge-${item.status === 'CONNECTED' ? 'success' : 'neutral'}`} style={{ fontSize: 10 }}>
                    {item.status}
                  </span>
                  <span className="badge badge-info" style={{ fontSize: 10 }}>
                    {item.health}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Posture & Recent Events */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} style={{ color: '#10b981' }} /> Security Center Highlights
            </h2>
            <Link href="/admin/security" style={{ fontSize: 12, color: 'var(--color-primary-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Security Center <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.recentSecurityEvents.map((evt) => (
              <div
                key={evt.id}
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  borderRadius: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#34d399' }}>{evt.event}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{evt.time}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  Verification passed • Tenant boundary confirmed
                </div>
              </div>
            ))}

            <div style={{ marginTop: 8, padding: 12, backgroundColor: 'var(--bg-elevated)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                Compliance & Retention Policies
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Transcripts preserved for {data.organization.transcriptRetentionDays} days • Audio/Video recordings retained for {data.organization.recordingRetentionDays} days.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Audit Log Activity */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} style={{ color: '#f59e0b' }} /> Immutable Audit Stream
          </h2>
          <Link href="/admin/audit-logs" style={{ fontSize: 12, color: 'var(--color-primary-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            Full Audit Center <ArrowUpRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.recentAuditLogs.map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
                fontSize: 13,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="badge badge-neutral" style={{ fontSize: 10, fontFamily: 'monospace' }}>
                  {log.action}
                </span>
                <span style={{ fontWeight: 600 }}>{log.userName}</span>
                <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                <span style={{ color: 'var(--text-secondary)' }}>{log.resource}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
