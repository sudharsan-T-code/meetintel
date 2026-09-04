import { CheckCircle, HelpCircle } from 'lucide-react';
import { formatDuration } from '@/lib/demo-data';

interface Speaker {
  id: string;
  name: string;
  speakerLabel: string;
  role?: string;
  department?: string;
  speakingDuration?: number;
  speakingDurationSec?: number;
  speakingPercentage?: number;
  contributionCount?: number;
  questionsAsked?: number;
  questionsAnswered?: number;
  commitmentsMade?: number;
}

interface SpeakerTimelineProps {
  speakers: Speaker[];
  totalDurationSeconds?: number;
}

const SPEAKER_COLORS = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b',
  '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6',
];

export default function SpeakerTimeline({ speakers, totalDurationSeconds = 6300 }: SpeakerTimelineProps) {
  const getSpeakerColor = (name: string, index: number) => {
    return SPEAKER_COLORS[index % SPEAKER_COLORS.length];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Talk-Time Distribution Bar */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            Acoustic Talk-Time Distribution
          </h3>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {speakers.length} identified speakers • Total Duration: {formatDuration(totalDurationSeconds)}
          </span>
        </div>

        {/* Multi-Segment Proportion Bar */}
        <div
          style={{
            height: 12,
            width: '100%',
            borderRadius: 6,
            display: 'flex',
            overflow: 'hidden',
            background: 'var(--bg-elevated)',
            marginBottom: 16,
          }}
        >
          {speakers.map((spk, idx) => {
            const pct = spk.speakingPercentage ?? 0;
            if (pct <= 0) return null;
            return (
              <div
                key={spk.id || spk.name}
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: getSpeakerColor(spk.name, idx),
                  transition: 'width 0.3s ease',
                }}
                title={`${spk.name}: ${pct}%`}
              />
            );
          })}
        </div>

        {/* Color Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {speakers.map((spk, idx) => {
            const pct = spk.speakingPercentage ?? 0;
            return (
              <div key={spk.id || spk.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: getSpeakerColor(spk.name, idx),
                  }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>
                  {spk.name} <strong style={{ color: 'var(--text-primary)' }}>({pct}%)</strong>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Speaker Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {speakers.map((spk, idx) => {
          const duration = spk.speakingDuration ?? spk.speakingDurationSec ?? 0;
          const color = getSpeakerColor(spk.name, idx);

          return (
            <div
              key={spk.id || spk.name}
              style={{
                padding: '18px 20px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
              className="hover-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: `${color}22`,
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {spk.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {spk.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {spk.role || spk.speakerLabel || 'Participant'} {spk.department ? `• ${spk.department}` : ''}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  fontSize: 11,
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Speaking Time:</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                    {formatDuration(duration)}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Contributions:</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                    {spk.contributionCount || 12} segments
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-tertiary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <HelpCircle size={12} /> {spk.questionsAsked || 0} asked
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={12} /> {spk.questionsAnswered || 0} answered
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
