'use client';

import { useState, useEffect } from 'react';
import {
  Sliders,
  Clock,
  FileText,
  Brain,
  Shield,
  Save,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function MeetingSettingsPage() {
  const [prefs, setPrefs] = useState<any>({
    defaultDurationMinutes: 45,
    autoStartAnalysis: true,
    transcriptPreference: 'FULL_DIARIZED',
    summaryFormat: 'EXECUTIVE',
    defaultVisibility: 'ORGANIZATION',
    timezone: 'Asia/Kolkata',
    highlightMyMentions: true,
  });
  const [orgPolicy, setOrgPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchPrefs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/meetings');
      if (res.ok) {
        const data = await res.json();
        if (data.preferences) setPrefs(data.preferences);
        if (data.organizationPolicy) setOrgPolicy(data.organizationPolicy);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrefs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/settings/meetings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update meeting preferences.');
      setPrefs(data.preferences);
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
      <div style={{ padding: 40, maxWidth: 840, margin: '0 auto' }}>
        <div style={{ height: 250, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }} className="skeleton" />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 840, margin: '0 auto' }} className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sliders size={26} style={{ color: 'var(--color-primary-light)' }} /> Personal Meeting Defaults
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Configure personal defaults for scheduled meetings, AI transcript preferences, and default access visibility.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Meeting Scheduling Defaults */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} style={{ color: 'var(--color-primary-light)' }} /> Scheduling & Duration
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Default Meeting Duration
              </label>
              <select
                value={prefs.defaultDurationMinutes}
                onChange={(e) => setPrefs({ ...prefs, defaultDurationMinutes: parseInt(e.target.value, 10) })}
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
                <option value={15}>15 minutes (Quick Standup)</option>
                <option value={30}>30 minutes (Standard 1:1)</option>
                <option value={45}>45 minutes (Default Planning)</option>
                <option value={60}>60 minutes (Architecture & Strategy)</option>
                <option value={90}>90 minutes (Deep Dive Workshop)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Default Workspace Visibility
              </label>
              <select
                value={prefs.defaultVisibility}
                onChange={(e) => setPrefs({ ...prefs, defaultVisibility: e.target.value })}
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
                <option value="ORGANIZATION">Organization Wide (Recommended)</option>
                <option value="PARTICIPANTS_ONLY">Participants & Assignees Only</option>
                <option value="PRIVATE">Private (Organizer Only)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Processing & Summaries */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={18} style={{ color: '#8b5cf6' }} /> Intelligence & Transcript Preferences
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Transcript Display Format
              </label>
              <select
                value={prefs.transcriptPreference}
                onChange={(e) => setPrefs({ ...prefs, transcriptPreference: e.target.value })}
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
                <option value="FULL_DIARIZED">Full Diarized with Timestamps</option>
                <option value="COMPACT_SUMMARY">Compact Speaker Paragraphs</option>
                <option value="RAW">Raw Continuous Text</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Summary Level
              </label>
              <select
                value={prefs.summaryFormat}
                onChange={(e) => setPrefs({ ...prefs, summaryFormat: e.target.value })}
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
                <option value="EXECUTIVE">Executive Brief (3 Key Points + Decisions)</option>
                <option value="DETAILED">Detailed Topic-by-Topic Breakdown</option>
                <option value="BULLET_POINTS">Chronological Bullet Points</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs.autoStartAnalysis}
                onChange={(e) => setPrefs({ ...prefs, autoStartAnalysis: e.target.checked })}
                style={{ width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                Automatically trigger transcription and intelligence extraction when meetings finish
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs.highlightMyMentions}
                onChange={(e) => setPrefs({ ...prefs, highlightMyMentions: e.target.checked })}
                style={{ width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                Highlight sentences and topics where my name or project is referenced
              </span>
            </label>
          </div>
        </div>

        {/* Organization Policy Banner (Read-Only) */}
        <div style={{ padding: 14, backgroundColor: 'rgba(99, 102, 241, 0.05)', borderRadius: 8, border: '1px solid rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Lock size={18} style={{ color: 'var(--color-primary-light)' }} />
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            <strong>Organization Governance Enforced:</strong> Attendee recording consent is mandatory. Audio recordings are retained for a maximum of 180 days per tenant policy.
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {saveSuccess && (
              <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} /> Meeting preferences saved successfully.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px' }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Meeting Defaults'}
          </button>
        </div>
      </form>
    </div>
  );
}
