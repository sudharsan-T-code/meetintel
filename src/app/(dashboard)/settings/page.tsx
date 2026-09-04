'use client';

import Link from 'next/link';
import {
  Settings,
  User,
  Bell,
  Sliders,
  Brain,
  Link2,
  Building2,
  ArrowRight,
  Shield,
} from 'lucide-react';

const SETTINGS_SECTIONS = [
  {
    href: '/settings/profile',
    title: 'User Profile & Identity',
    description: 'Update your display name, department, title, timezone, and language preferences.',
    icon: <User size={24} style={{ color: '#818cf8' }} />,
    tag: 'Personal',
  },
  {
    href: '/settings/notifications',
    title: 'Notification Preferences',
    description: 'Configure real-time alerts for action item assignments, due dates, risk detections, and summaries.',
    icon: <Bell size={24} style={{ color: '#f59e0b' }} />,
    tag: 'Alerts',
  },
  {
    href: '/settings/meetings',
    title: 'Meeting Defaults & Transcripts',
    description: 'Set default meeting duration, automatic analysis triggers, diarization formats, and visibility.',
    icon: <Sliders size={24} style={{ color: '#10b981' }} />,
    tag: 'Workspace',
  },
  {
    href: '/settings/ai',
    title: 'AI Intelligence & Privacy',
    description: 'Inspect active LLM providers (Gemini, OpenAI, Anthropic, Demo) and data isolation policies.',
    icon: <Brain size={24} style={{ color: '#a855f7' }} />,
    tag: 'Intelligence',
  },
  {
    href: '/integrations',
    title: 'Connected Integrations',
    description: 'Manage Google Calendar, Microsoft 365, Zoom, and Teams video sync connections.',
    icon: <Link2 size={24} style={{ color: '#06b6d4' }} />,
    tag: 'Integrations',
  },
  {
    href: '/admin/settings',
    title: 'Organization Governance',
    description: 'Configure tenant data retention, recording consent mandates, and global workspace defaults.',
    icon: <Building2 size={24} style={{ color: '#ec4899' }} />,
    tag: 'Admin Only',
  },
];

export default function SettingsHubPage() {
  return (
    <div style={{ padding: '32px 40px', maxWidth: 1040, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Settings size={26} style={{ color: 'var(--color-primary-light)' }} /> Enterprise Settings & Preferences
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Central hub for personal profile customization, notification triggers, meeting defaults, and workspace policies.
        </p>
      </div>

      {/* Grid of Settings Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {SETTINGS_SECTIONS.map((sec) => (
          <Link
            key={sec.href}
            href={sec.href}
            className="card"
            style={{
              padding: 24,
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sec.icon}
                </div>
                <span className="badge badge-neutral" style={{ fontSize: 10, textTransform: 'uppercase' }}>
                  {sec.tag}
                </span>
              </div>

              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                {sec.title}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                {sec.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-primary-light)' }}>
              Configure <ArrowRight size={15} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
