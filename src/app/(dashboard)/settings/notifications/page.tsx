'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Save,
  Mail,
  Smartphone,
  Info,
  Calendar,
  AlertTriangle,
  ListChecks,
  GitBranch,
  Clock,
} from 'lucide-react';

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<any>({
    actionAssigned: true,
    actionDue: true,
    actionOverdue: true,
    commitmentDue: true,
    commitmentOverdue: true,
    riskDetected: true,
    meetingAnalysisCompleted: true,
    missedMeetingAvailable: true,
    calendarSyncCompleted: false,
    emailDeliveryEnabled: false,
    inAppAlertsEnabled: true,
  });
  const [channelStatus, setChannelStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchPrefs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/notifications');
      if (res.ok) {
        const data = await res.json();
        if (data.preferences) setPrefs(data.preferences);
        if (data.channelStatus) setChannelStatus(data.channelStatus);
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
      const res = await fetch('/api/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update notification preferences.');
      setPrefs(data.preferences);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: string) => {
    setPrefs((prev: any) => ({ ...prev, [key]: !prev[key] }));
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
          <Bell size={26} style={{ color: 'var(--color-primary-light)' }} /> Notification Preferences
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Choose when and how MEETINTEL notifies you regarding task assignments, risks, and meeting briefings.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Delivery Channels */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Delivery Channels</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: 'var(--bg-elevated)', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Smartphone size={20} style={{ color: '#10b981' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>In-App Toast & Notification Center</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Live real-time alerts inside the dashboard</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.inAppAlertsEnabled}
                onChange={() => toggle('inAppAlertsEnabled')}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: 'var(--bg-elevated)', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Mail size={20} style={{ color: '#f59e0b' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    Email Notifications
                    <span className="badge badge-warning" style={{ fontSize: 9 }}>DEMO MODE</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                    Simulated dispatch. External SMTP provider not configured in demo mode.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.emailDeliveryEnabled}
                onChange={() => toggle('emailDeliveryEnabled')}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Action Items & Commitments */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ListChecks size={18} style={{ color: 'var(--color-primary-light)' }} /> Action Items & Commitments
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>New Action Item Assigned</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>When an AI-extracted or organizer-created task is assigned to you</div>
              </div>
              <input
                type="checkbox"
                checked={prefs.actionAssigned}
                onChange={() => toggle('actionAssigned')}
                style={{ width: 18, height: 18 }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Action Item Due Soon</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Reminder 24 hours prior to scheduled deadline</div>
              </div>
              <input
                type="checkbox"
                checked={prefs.actionDue}
                onChange={() => toggle('actionDue')}
                style={{ width: 18, height: 18 }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Action Item Overdue Alert</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Escalation notice when an assigned task passes its due date</div>
              </div>
              <input
                type="checkbox"
                checked={prefs.actionOverdue}
                onChange={() => toggle('actionOverdue')}
                style={{ width: 18, height: 18 }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Commitment Due / Pending Confirmation</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>When an extracted verbal commitment approaches its target date</div>
              </div>
              <input
                type="checkbox"
                checked={prefs.commitmentDue}
                onChange={() => toggle('commitmentDue')}
                style={{ width: 18, height: 18 }}
              />
            </label>
          </div>
        </div>

        {/* Intelligence & Meeting Alerts */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} style={{ color: '#ef4444' }} /> Intelligence & Risk Alerts
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>High Severity Risk Detected</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Immediate notification if a critical roadblock or technical risk is flagged</div>
              </div>
              <input
                type="checkbox"
                checked={prefs.riskDetected}
                onChange={() => toggle('riskDetected')}
                style={{ width: 18, height: 18 }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Meeting Analysis Completed</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>When executive summary and decisions are ready to review</div>
              </div>
              <input
                type="checkbox"
                checked={prefs.meetingAnalysisCompleted}
                onChange={() => toggle('meetingAnalysisCompleted')}
                style={{ width: 18, height: 18 }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Missed Meeting &ldquo;What Did I Miss&rdquo; Available</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Personalized 2-minute recap ready for meetings you could not attend</div>
              </div>
              <input
                type="checkbox"
                checked={prefs.missedMeetingAvailable}
                onChange={() => toggle('missedMeetingAvailable')}
                style={{ width: 18, height: 18 }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Calendar Synchronization Completed</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Status updates after Google or Microsoft calendar sync jobs</div>
              </div>
              <input
                type="checkbox"
                checked={prefs.calendarSyncCompleted}
                onChange={() => toggle('calendarSyncCompleted')}
                style={{ width: 18, height: 18 }}
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {saveSuccess && (
              <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} /> Notification preferences saved successfully.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px' }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Notification Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
