'use client';

import { useState, useEffect } from 'react';
import {
  Brain,
  ShieldCheck,
  Zap,
  Server,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  EyeOff,
} from 'lucide-react';

interface AIProviderInfo {
  id: string;
  name: string;
  isConfigured: boolean;
  status: string;
  features: string[];
  latency: string;
}

interface AISettingsData {
  activeProvider: string;
  activeModel: string;
  providers: AIProviderInfo[];
  privacy: {
    zeroDataRetention: boolean;
    thirdPartyTrainingExempt: boolean;
    tenantIsolationEnforced: boolean;
    credentialsStoredServerSide: boolean;
    browserSecretExposure: boolean;
  };
  canConfigure: boolean;
}

export default function AISettingsPage() {
  const [data, setData] = useState<AISettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAISettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/ai');
      if (!res.ok) throw new Error('Failed to load AI settings.');
      const json = await res.json();
      setData(json);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAISettings();
  }, []);

  const handleSwitchProvider = async (providerId: string) => {
    if (!data?.canConfigure) {
      alert('Only workspace administrators can switch the global AI provider.');
      return;
    }
    setSwitching(true);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/settings/ai', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId }),
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to switch provider.');
      setData((prev) => (prev ? { ...prev, activeProvider: providerId } : prev));
      setSuccessMsg(`Switched active AI provider to ${providerId}.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, maxWidth: 960, margin: '0 auto' }}>
        <div style={{ height: 260, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }} className="skeleton" />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1040, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
              AI Intelligence Engine & Privacy
            </h1>
            <span className="badge badge-primary" style={{ fontSize: 11, fontWeight: 700 }}>
              Abstraction Layer
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Configure LLM providers, review privacy isolation, and monitor inference execution state.
          </p>
        </div>

        <button onClick={fetchAISettings} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, marginBottom: 20, color: '#10b981', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Active Engine Card */}
      <div className="card" style={{ padding: 24, marginBottom: 28, borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              Active AI Provider
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {data?.providers.find((p) => p.id === data.activeProvider)?.name || 'MEETINTEL Enterprise Engine'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Current Model: <code style={{ color: 'var(--color-primary-light)', padding: '2px 6px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 4 }}>{data?.activeModel}</code>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: 12 }}>
              ● OPERATIONAL
            </span>
          </div>
        </div>
      </div>

      {/* Available AI Providers */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cpu size={18} style={{ color: 'var(--color-primary-light)' }} /> Available AI Providers & Fallback Engine
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 16 }}>
          {data?.providers.map((p) => {
            const isActive = p.id === data.activeProvider;
            return (
              <div
                key={p.id}
                className="card"
                style={{
                  padding: 20,
                  border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                    <span className={`badge badge-${p.status === 'OPERATIONAL' ? 'success' : 'neutral'}`} style={{ fontSize: 10 }}>
                      {p.status}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>
                    Latency: <strong>{p.latency}</strong>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {p.features.map((feat) => (
                      <span key={feat} className="badge badge-neutral" style={{ fontSize: 10 }}>
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  disabled={isActive || switching || !data.canConfigure}
                  onClick={() => handleSwitchProvider(p.id)}
                  className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 12 }}
                >
                  {isActive ? 'Active Engine' : data.canConfigure ? 'Switch to this Provider' : 'Admin Only'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enterprise AI Privacy Guarantee */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={18} style={{ color: '#10b981' }} /> Privacy & Zero-Retention Policy
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Zero Training on Customer Data</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                Meeting audio, transcripts, and summaries are strictly excluded from AI model training by enterprise agreements.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <EyeOff size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>No Secret Leaks to Browser</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                API keys and credentials live exclusively in secure server-side environment configurations.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Lock size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Multi-Tenant Context Scoping</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                AI prompts and grounded citations strictly access data belonging to your authenticated organization ID.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
