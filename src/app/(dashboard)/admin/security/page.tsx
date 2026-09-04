'use client';

import { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  KeyRound,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Server,
  FileCode,
  Sliders,
  ShieldAlert,
} from 'lucide-react';

interface SecurityData {
  organizationId: string;
  tokenProtection: {
    status: string;
    algorithm: string;
    storage: string;
    secretsExposed: boolean;
  };
  authenticationPosture: {
    mfaStatus: string;
    sessionLifetimeHours: number;
    rbacEnforcement: string;
    tenantIsolationMode: string;
  };
  integrationsSecurity: Array<{
    provider: string;
    status: string;
    tokenMasked: string;
    scopes: string[];
    lastTokenRefresh: string;
  }>;
  securityRecommendations: Array<{
    id: string;
    title: string;
    status: string;
    severity: string;
  }>;
}

export default function SecurityCenterPage() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/security');
      if (!res.ok) throw new Error('Failed to fetch security posture.');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1280, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
              Enterprise Security Center
            </h1>
            <span className="badge badge-success" style={{ fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={13} /> Hardened
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Zero-secret leakage audit, cryptographic token encryption, tenant isolation boundaries, and compliance controls.
          </p>
        </div>

        <button onClick={fetchSecurityData} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Re-scan Posture
        </button>
      </div>

      {/* Security Architecture Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: 20, borderTop: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ padding: 8, borderRadius: 8, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <KeyRound size={20} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Token Protection</div>
              <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>AES-256-GCM Standard</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            OAuth refresh tokens and API credentials are cryptographically protected at rest. Plaintext keys are never transmitted to client browsers.
          </p>
        </div>

        <div className="card" style={{ padding: 20, borderTop: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ padding: 8, borderRadius: 8, backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
              <Server size={20} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Tenant Boundary</div>
              <div style={{ fontSize: 11, color: '#818cf8', fontWeight: 600 }}>Organization Scoped</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            All database queries enforce mandatory organizationId filtering. Cross-tenant access attempts trigger security alerts and are rejected.
          </p>
        </div>

        <div className="card" style={{ padding: 20, borderTop: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ padding: 8, borderRadius: 8, backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#22d3ee' }}>
              <EyeOff size={20} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Zero Secret Exposure</div>
              <div style={{ fontSize: 11, color: '#06b6d4', fontWeight: 600 }}>Active Masking</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            API responses return strictly sanitized data payloads. API keys, client secrets, and environment tokens are masked with secure truncated digests.
          </p>
        </div>
      </div>

      {/* Integration Security & Tokens */}
      <div className="card" style={{ padding: 24, marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={18} style={{ color: 'var(--color-primary-light)' }} /> Integration Credential Protection State
        </h2>

        {data?.integrationsSecurity ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11 }}>PROVIDER</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11 }}>TOKEN MASK</th>
                  <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11 }}>AUTHORIZED SCOPES</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11 }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {data.integrationsSecurity.map((item) => (
                  <tr key={item.provider} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{item.provider}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <code style={{ fontSize: 12, backgroundColor: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: 4, color: 'var(--text-secondary)' }}>
                        {item.tokenMasked}
                      </code>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {item.scopes.map((s) => (
                          <span key={s} className="badge badge-neutral" style={{ fontSize: 10 }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <span className="badge badge-success" style={{ fontSize: 10 }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ height: 120, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }} className="skeleton" />
        )}
      </div>

      {/* Security Checklist & Recommendations */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={18} style={{ color: '#10b981' }} /> Compliance Checklist & Recommendations
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data?.securityRecommendations?.map((rec) => (
            <div
              key={rec.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: 8,
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircle2 size={18} style={{ color: rec.status === 'COMPLIANT' || rec.status === 'ENFORCED' ? '#10b981' : '#f59e0b' }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{rec.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge badge-${rec.status === 'COMPLIANT' || rec.status === 'ENFORCED' ? 'success' : 'warning'}`} style={{ fontSize: 10 }}>
                  {rec.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
