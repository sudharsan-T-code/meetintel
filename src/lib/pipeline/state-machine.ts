import type { PipelineState } from './types';

const VALID_TRANSITIONS: Record<PipelineState, PipelineState[]> = {
  DRAFT: ['SCHEDULED', 'UPLOADING', 'UPLOADED', 'FAILED'],
  SCHEDULED: ['UPLOADING', 'UPLOADED', 'FAILED'],
  UPLOADING: ['UPLOADED', 'FAILED'],
  UPLOADED: ['EXTRACTING_AUDIO', 'TRANSCRIBING', 'FAILED'],
  EXTRACTING_AUDIO: ['TRANSCRIBING', 'FAILED'],
  TRANSCRIBING: ['DIARIZING', 'ANALYZING', 'COMPLETED', 'FAILED'],
  DIARIZING: ['ANALYZING', 'GENERATING_INSIGHTS', 'COMPLETED', 'FAILED'],
  ANALYZING: ['GENERATING_INSIGHTS', 'COMPLETED', 'FAILED'],
  GENERATING_INSIGHTS: ['COMPLETED', 'FAILED'],
  COMPLETED: ['UPLOADING', 'UPLOADED', 'EXTRACTING_AUDIO', 'TRANSCRIBING'], // Allow reprocessing
  FAILED: ['UPLOADING', 'UPLOADED', 'EXTRACTING_AUDIO', 'TRANSCRIBING'], // Allow retry
};

/**
 * Asserts whether moving from current state to next state is valid.
 */
export function isValidTransition(current: PipelineState, next: PipelineState): boolean {
  if (current === next) return true;
  const allowed = VALID_TRANSITIONS[current];
  return Boolean(allowed && allowed.includes(next));
}

/**
 * Guard that throws if state transition is illegal.
 */
export function assertValidTransition(current: PipelineState, next: PipelineState): void {
  if (!isValidTransition(current, next)) {
    throw new Error(
      `InvalidStateTransition: Cannot transition meeting pipeline from "${current}" to "${next}".`
    );
  }
}

/**
 * Human-readable description of current pipeline state.
 */
export function getPipelineStageLabel(state: PipelineState): string {
  switch (state) {
    case 'DRAFT':
      return 'Draft';
    case 'SCHEDULED':
      return 'Scheduled';
    case 'UPLOADING':
      return 'Uploading recording...';
    case 'UPLOADED':
      return 'Ready for processing';
    case 'EXTRACTING_AUDIO':
      return 'Extracting & optimizing audio track...';
    case 'TRANSCRIBING':
      return 'Transcribing speech with AI model...';
    case 'DIARIZING':
      return 'Identifying distinct speakers & talk-time...';
    case 'ANALYZING':
      return 'Analyzing meeting intelligence...';
    case 'GENERATING_INSIGHTS':
      return 'Generating summaries & decision register...';
    case 'COMPLETED':
      return 'Analyzed & Completed';
    case 'FAILED':
      return 'Processing failed';
    default:
      return state;
  }
}

/**
 * Returns estimated progress percentage for given pipeline stage.
 */
export function getPipelineProgressPercent(state: PipelineState): number {
  switch (state) {
    case 'DRAFT':
    case 'SCHEDULED':
      return 0;
    case 'UPLOADING':
      return 15;
    case 'UPLOADED':
      return 25;
    case 'EXTRACTING_AUDIO':
      return 40;
    case 'TRANSCRIBING':
      return 65;
    case 'DIARIZING':
      return 85;
    case 'ANALYZING':
    case 'GENERATING_INSIGHTS':
      return 95;
    case 'COMPLETED':
      return 100;
    case 'FAILED':
      return 0;
    default:
      return 0;
  }
}
