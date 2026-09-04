'use client';

import { Activity, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { getPipelineStageLabel, getPipelineProgressPercent } from '@/lib/pipeline/state-machine';
import type { PipelineState } from '@/lib/pipeline/types';

interface PipelineProgressProps {
  status: PipelineState | string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

const STAGES: { key: PipelineState; label: string }[] = [
  { key: 'UPLOADED', label: 'Uploaded' },
  { key: 'EXTRACTING_AUDIO', label: 'Audio Extract' },
  { key: 'TRANSCRIBING', label: 'Transcription' },
  { key: 'DIARIZING', label: 'Diarization' },
  { key: 'COMPLETED', label: 'Ready' },
];

export default function PipelineProgress({ status, onRetry, isRetrying }: PipelineProgressProps) {
  const currentStage = (status || 'UPLOADED') as PipelineState;
  const isFailed = currentStage === 'FAILED';
  const isCompleted = currentStage === 'COMPLETED';
  const progressPercent = getPipelineProgressPercent(currentStage);

  return (
    <div
      style={{
        padding: '24px 28px',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isCompleted ? (
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
              <CheckCircle2 size={20} />
            </div>
          ) : isFailed ? (
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)' }}>
              <AlertTriangle size={20} />
            </div>
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
              <Activity size={20} className="animate-spin" />
            </div>
          )}

          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              {isCompleted ? 'Transcription & Diarization Complete' : isFailed ? 'Pipeline Encountered an Error' : getPipelineStageLabel(currentStage)}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {isCompleted
                ? 'All transcript segments, timestamps, and speaker contributions are synchronized.'
                : isFailed
                ? 'An error occurred during audio model inference. You can retry processing safely.'
                : 'Automated AI pipeline is running speech recognition and acoustic speaker diarization.'}
            </p>
          </div>
        </div>

        {isFailed && onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="btn btn-primary"
            style={{ fontSize: 13, gap: 8 }}
          >
            <RefreshCw size={14} className={isRetrying ? 'animate-spin' : ''} />
            {isRetrying ? 'Retrying...' : 'Retry Pipeline'}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {!isFailed && !isCompleted && (
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              height: 6,
              width: '100%',
              borderRadius: 3,
              background: 'var(--bg-elevated)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                borderRadius: 3,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Stage Flow Nodes */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`, gap: 8, marginTop: 12 }}>
        {STAGES.map((s, idx) => {
          const stageIndex = STAGES.findIndex((x) => x.key === currentStage);
          const isPast = stageIndex > idx || isCompleted;
          const isCurrent = s.key === currentStage;

          return (
            <div
              key={s.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '8px 4px',
                borderRadius: 'var(--radius-md)',
                background: isCurrent ? 'var(--bg-elevated)' : 'transparent',
                border: isCurrent ? '1px solid var(--border-default)' : '1px solid transparent',
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  fontSize: 10,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 6,
                  background: isPast
                    ? 'var(--color-success)'
                    : isCurrent
                    ? 'var(--color-primary)'
                    : 'var(--bg-elevated)',
                  color: isPast || isCurrent ? '#fff' : 'var(--text-tertiary)',
                }}
              >
                {isPast ? '✓' : idx + 1}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--text-primary)' : isPast ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
