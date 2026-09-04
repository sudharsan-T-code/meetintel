'use client';

import Link from 'next/link';
import { Users, Clock, Calendar, ChevronRight, Activity, AlertTriangle } from 'lucide-react';
import { formatDuration } from '@/lib/demo-data';

interface MeetingCardProps {
  meeting: {
    id: string;
    title: string;
    description?: string | null;
    scheduledAt: string | Date;
    durationSeconds?: number;
    duration?: number;
    participantCount: number;
    organizerName?: string;
    status: string;
    source: string;
    tags?: string[];
    productivityScore?: { overall: number };
  };
}

export default function MeetingCard({ meeting }: MeetingCardProps) {
  const duration = meeting.durationSeconds ?? meeting.duration ?? 0;
  const isProcessing = ['UPLOADING', 'EXTRACTING_AUDIO', 'TRANSCRIBING', 'DIARIZING', 'ANALYZING', 'GENERATING_INSIGHTS'].includes(
    meeting.status
  );
  const isFailed = meeting.status === 'FAILED';
  const isCompleted = meeting.status === 'COMPLETED';

  const sourceColor =
    meeting.source === 'GOOGLE_MEET' || meeting.source === 'google_meet'
      ? '#10b981'
      : meeting.source === 'TEAMS' || meeting.source === 'teams'
      ? '#3b82f6'
      : meeting.source === 'ZOOM' || meeting.source === 'zoom'
      ? '#2563eb'
      : '#6366f1';

  return (
    <Link
      href={`/meetings/${meeting.id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all var(--transition-fast)',
      }}
      className="hover-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: sourceColor,
            flexShrink: 0,
            boxShadow: `0 0 8px ${sourceColor}66`,
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              marginBottom: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: 'var(--text-primary)',
            }}
          >
            {meeting.title}
          </div>

          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={12} /> {meeting.participantCount} {meeting.participantCount === 1 ? 'person' : 'people'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {formatDuration(duration)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} />{' '}
              {new Date(meeting.scheduledAt).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(meeting.tags || []).slice(0, 2).map((tag) => (
            <span key={tag} className="badge badge-neutral" style={{ fontSize: 10 }}>
              {tag}
            </span>
          ))}
        </div>

        {isProcessing && (
          <span className="badge badge-warning" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Activity size={12} className="animate-spin" />
            {meeting.status}
          </span>
        )}

        {isFailed && (
          <span className="badge badge-danger" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={12} />
            Failed
          </span>
        )}

        {isCompleted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {meeting.productivityScore && (
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color:
                    meeting.productivityScore.overall >= 80
                      ? 'var(--color-success)'
                      : meeting.productivityScore.overall >= 60
                      ? 'var(--color-warning)'
                      : 'var(--color-danger)',
                  minWidth: 50,
                  textAlign: 'right',
                }}
              >
                {meeting.productivityScore.overall}/100
              </div>
            )}
            <span className="badge badge-success" style={{ fontSize: 11 }}>
              Analyzed
            </span>
          </div>
        )}

        <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
      </div>
    </Link>
  );
}
