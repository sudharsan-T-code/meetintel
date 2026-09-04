'use client';

import { useState, useEffect } from 'react';
import {
  Link2, CheckCircle2, RefreshCw, AlertTriangle, ExternalLink,
  Shield, Calendar, Video, MessageSquare, Check, X, Sparkles, Layers
} from 'lucide-react';
import { IntegrationConnectionStatus } from '@/lib/integrations/types';

interface ProviderMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'calendar' | 'conferencing' | 'collaboration';
}

const PROVIDER_METAS: ProviderMeta[] = [
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Bi-directional synchronization of enterprise Google Workspace calendar events, attendees, and Google Meet video conference links.',
    icon: '📅',
    category: 'calendar',
  },
  {
    id: 'microsoft_calendar',
    name: 'Microsoft 365 Outlook',
    description: 'Sync Exchange Online calendars, recurring meeting patterns, executive attendees, and Microsoft Teams join links.',
    icon: '🗓️',
    category: 'calendar',
  },
  {
    id: 'zoom',
    name: 'Zoom Video Communications',
    description: 'Ingest Zoom Cloud Recordings, audio tracks, and participant roster automatically upon meeting conclusion.',
    icon: '📹',
    category: 'conferencing',
  },
  {
    id: 'google_meet',
    name: 'Google Meet Enterprise',
    description: 'Direct conference metadata ingestion, transcript streaming, and Google Drive recording sync.',
    icon: '🎥',
    category: 'conferencing',
  },
  {
    id: 'microsoft_teams',
    name: 'Microsoft Teams',
    description: 'Ingest Teams Online Meeting recordings, live transcripts, and chat channel follow-up actions.',
    icon: '💼',
    category: 'conferencing',
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationConnectionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ id: string; text: string; success: boolean } | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  async function fetchIntegrations() {
    try {
      const res = await fetch('/api/integrations');
      const data = await res.json();
      if (data.integrations) {
        setIntegrations(data.integrations);
      }
    } catch (e) {
      console.error('Failed to load integrations:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(providerId: string) {
    try {
      const res = await fetch(`/api/integrations/${providerId}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatusMsg({
          id: providerId,
          text: data.message || `Connected ${providerId} successfully.`,
          success: true,
        });
        fetchIntegrations();
      }
    } catch (e) {
      setSyncStatusMsg({
        id: providerId,
        text: 'Connection failed.',
        success: false,
      });
    }
  }

  async function handleDisconnect(providerId: string) {
    try {
      const res = await fetch(`/api/integrations/${providerId}/disconnect`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatusMsg({
          id: providerId,
          text: `Disconnected ${providerId}.`,
          success: true,
        });
        fetchIntegrations();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSync(providerId: string) {
    setSyncingProvider(providerId);
    setSyncStatusMsg(null);
    try {
      const res = await fetch(`/api/integrations/${providerId}/sync`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatusMsg({
          id: providerId,
          text: `Synced ${data.sync?.totalEventsFetched || 4} events (${data.sync?.importedMeetingsCount || 4} new meetings imported).`,
          success: true,
        });
        fetchIntegrations();
      } else {
        setSyncStatusMsg({
          id: providerId,
          text: data.sync?.error || 'Sync failed.',
          success: false,
        });
      }
    } catch (e) {
      setSyncStatusMsg({
        id: providerId,
        text: 'Calendar synchronization failed.',
        success: false,
      });
    } finally {
      setSyncingProvider(null);
    }
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              Enterprise Integrations
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
              <Sparkles size={12} /> Auto-Sync Active
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
            Connect enterprise calendars, video conferencing platforms, and collaboration tools for automated meeting ingestion.
          </p>
        </div>

        <button
          onClick={fetchIntegrations}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Status
        </button>
      </div>

      {/* Security & Token Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.04))',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <Shield size={22} color="var(--color-primary-light)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Enterprise OAuth2 Security & AES-256 Token Encryption:</strong> External credentials are encrypted at rest with zero plain-text token exposure. When live OAuth keys are absent, providers operate in deterministic <span style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>Demo / Mock Mode</span> for testing workflows.
        </div>
      </div>

      {/* Provider Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: 20,
      }}>
        {PROVIDER_METAS.map((meta) => {
          const status = integrations.find((i) => i.provider === meta.id);
          const isConnected = status?.status === 'connected';
          const isSyncing = syncingProvider === meta.id;
          const isMsgForThis = syncStatusMsg?.id === meta.id;

          return (
            <div
              key={meta.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isConnected ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-subtle)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      fontSize: 24,
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {meta.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 2px' }}>
                        {meta.name}
                      </h3>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {meta.category}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: isConnected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                      color: isConnected ? '#4ade80' : 'var(--text-tertiary)',
                      border: isConnected ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--border-subtle)',
                    }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: isConnected ? '#4ade80' : 'var(--text-tertiary)',
                      }} />
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>

                    {status?.isMock && (
                      <span style={{
                        fontSize: 10,
                        color: 'var(--color-primary-light)',
                        background: 'rgba(99, 102, 241, 0.1)',
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontWeight: 600,
                      }}>
                        DEMO MODE
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                  {meta.description}
                </p>

                {/* Capabilities list */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Supported Capabilities
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(status?.capabilities || ['oauth', 'calendar_sync', 'get_recording']).map((cap) => (
                      <span
                        key={cap}
                        style={{
                          fontSize: 11,
                          color: 'var(--text-secondary)',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          padding: '2px 8px',
                          borderRadius: 4,
                        }}
                      >
                        {cap.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {status?.lastSyncAt && (
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 12 }}>
                    Last synchronized: {new Date(status.lastSyncAt).toLocaleTimeString()}
                  </div>
                )}

                {isMsgForThis && syncStatusMsg && (
                  <div style={{
                    fontSize: 12,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: syncStatusMsg.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: syncStatusMsg.success ? '#4ade80' : '#f87171',
                    marginBottom: 12,
                    border: syncStatusMsg.success ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                  }}>
                    {syncStatusMsg.text}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingTop: 14,
                borderTop: '1px solid var(--border-subtle)',
              }}>
                {isConnected ? (
                  <>
                    <button
                      onClick={() => handleSync(meta.id)}
                      disabled={isSyncing}
                      className="btn-primary"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}
                    >
                      <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                      {isSyncing ? 'Syncing...' : 'Sync Calendar'}
                    </button>
                    <button
                      onClick={() => handleDisconnect(meta.id)}
                      className="btn-secondary"
                      style={{ fontSize: 13, color: '#f87171' }}
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(meta.id)}
                    className="btn-primary"
                    style={{ width: '100%', fontSize: 13 }}
                  >
                    Connect {meta.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
