'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Clock,
  Database,
  Brain,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function OrganizationSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('Failed to load organization settings.');
      const data = await res.json();
      setSettings(data.settings);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings.');
      setSettings(data.settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, maxWidth: 900, margin: '0 auto' }}>
        <div style={{ height: 250, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }} className="skeleton" />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 960, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
            Organization & Workspace Settings
          </h1>
          <span className="badge badge-primary" style={{ fontSize: 11, fontWeight: 700 }}>
            Admin Only
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Configure global tenant governance, retention policies, AI restrictions, and default meeting behaviors.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* General Organization Identity */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={18} style={{ color: 'var(--color-primary-light)' }} /> Organization Identity
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Organization Name
              </label>
              <input
                type="text"
                value={settings?.name || ''}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Primary Workspace Timezone
              </label>
              <select
                value={settings?.defaultTimezone || 'Asia/Kolkata'}
                onChange={(e) => setSettings({ ...settings, defaultTimezone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  fontSize: 14,
                }}
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                <option value="America/New_York">America/New_York (EST/EDT, UTC-5)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT, UTC-8)</option>
                <option value="Europe/London">Europe/London (GMT/BST, UTC+0/+1)</option>
                <option value="Europe/Berlin">Europe/Berlin (CET/CEST, UTC+1/+2)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST, UTC+9)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Governance & Retention Policies */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={18} style={{ color: '#10b981' }} /> Compliance & Data Retention Policies
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Transcript Retention (Days)
              </label>
              <input
                type="number"
                min={30}
                max={3650}
                value={settings?.transcriptRetentionDays || 365}
                onChange={(e) => setSettings({ ...settings, transcriptRetentionDays: parseInt(e.target.value, 10) })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Audio/Video Media Retention (Days)
              </label>
              <input
                type="number"
                min={7}
                max={3650}
                value={settings?.recordingRetentionDays || 180}
                onChange={(e) => setSettings({ ...settings, recordingRetentionDays: parseInt(e.target.value, 10) })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings?.meetingConsentRequired || false}
                onChange={(e) => setSettings({ ...settings, meetingConsentRequired: e.target.checked })}
                style={{ width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                Enforce mandatory attendee recording consent before ingesting meeting transcripts
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings?.externalSharingEnabled || false}
                onChange={(e) => setSettings({ ...settings, externalSharingEnabled: e.target.checked })}
                style={{ width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                Permit exporting meeting summaries and action items to external guest domains
              </span>
            </label>
          </div>
        </div>

        {/* AI Processing Restrictions */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={18} style={{ color: '#8b5cf6' }} /> AI Processing & Intelligence Governance
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings?.aiProcessingEnabled || false}
                onChange={(e) => setSettings({ ...settings, aiProcessingEnabled: e.target.checked })}
                style={{ width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                Enable automated AI intelligence extraction (Executive brief, decisions, actions, risks)
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings?.autoAnalysisEnabled || false}
                onChange={(e) => setSettings({ ...settings, autoAnalysisEnabled: e.target.checked })}
                style={{ width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                Automatically initiate transcription pipeline immediately upon meeting media upload
              </span>
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {saveSuccess && (
              <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} /> Organization settings saved and audited successfully.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px' }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Organization Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
