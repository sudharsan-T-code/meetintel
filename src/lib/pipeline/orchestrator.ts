import 'server-only';
import { getSpeechProvider } from '@/lib/speech/factory';
import type { PipelineExecutionOptions, PipelineProgressEvent, PipelineState } from './types';
import { assertValidTransition } from './state-machine';
import {
  getMeetingByIdFromDb,
  updateMeetingInDb,
  persistTranscriptionResult,
} from '@/lib/db/meetings';
import type { TenantContext } from '@/lib/db/tenant';

// Active listeners for progress events
type ProgressCallback = (event: PipelineProgressEvent) => void;
const progressListeners = new Map<string, Set<ProgressCallback>>();

export function subscribeToPipelineProgress(meetingId: string, callback: ProgressCallback) {
  if (!progressListeners.has(meetingId)) {
    progressListeners.set(meetingId, new Set());
  }
  progressListeners.get(meetingId)!.add(callback);
  return () => {
    progressListeners.get(meetingId)?.delete(callback);
  };
}

function emitProgress(meetingId: string, event: PipelineProgressEvent) {
  const listeners = progressListeners.get(meetingId);
  if (listeners) {
    listeners.forEach((cb) => cb(event));
  }
}

/**
 * Runs the end-to-end meeting transcription and speaker diarization pipeline.
 */
export async function runMeetingPipeline(
  meetingId: string,
  tenant: TenantContext,
  options?: PipelineExecutionOptions
) {
  const meeting = await getMeetingByIdFromDb(meetingId, tenant);
  if (!meeting) {
    throw new Error(`Meeting "${meetingId}" not found.`);
  }

  try {
    // 1. Transition to EXTRACTING_AUDIO
    assertValidTransition(meeting.status as PipelineState, 'EXTRACTING_AUDIO');
    await updateMeetingInDb(meetingId, { status: 'EXTRACTING_AUDIO' }, tenant);
    emitProgress(meetingId, {
      meetingId,
      stage: 'EXTRACTING_AUDIO',
      percent: 30,
      message: 'Extracting audio channel and optimizing for acoustic models...',
      timestamp: new Date().toISOString(),
    });

    // 2. Select Speech Provider via abstraction factory
    const speechProvider = getSpeechProvider({ provider: options?.speechProvider });

    // 3. Transition to TRANSCRIBING
    assertValidTransition('EXTRACTING_AUDIO', 'TRANSCRIBING');
    await updateMeetingInDb(meetingId, { status: 'TRANSCRIBING' }, tenant);
    emitProgress(meetingId, {
      meetingId,
      stage: 'TRANSCRIBING',
      percent: 60,
      message: `Transcribing audio with speech provider "${speechProvider.name}"...`,
      timestamp: new Date().toISOString(),
      details: { modelUsed: speechProvider.name },
    });

    const transcriptionResult = await speechProvider.transcribe(
      meeting.recordingUrl || 'demo_audio_buffer',
      {
        language: options?.language || 'en',
        enableDiarization: options?.enableDiarization ?? true,
        maxSpeakers: options?.maxSpeakers || 12,
      }
    );

    // 4. Transition to DIARIZING
    assertValidTransition('TRANSCRIBING', 'DIARIZING');
    await updateMeetingInDb(meetingId, { status: 'DIARIZING' }, tenant);
    emitProgress(meetingId, {
      meetingId,
      stage: 'DIARIZING',
      percent: 85,
      message: 'Running speaker clustering and talk-time diarization...',
      timestamp: new Date().toISOString(),
      details: {
        speakerCount: transcriptionResult.speakers.length,
        segmentCount: transcriptionResult.transcriptSegments.length,
      },
    });

    // 5. Persist transcript segments and speakers into database
    await persistTranscriptionResult(meetingId, transcriptionResult, tenant);

    // 6. Complete
    emitProgress(meetingId, {
      meetingId,
      stage: 'COMPLETED',
      percent: 100,
      message: 'Meeting ingestion, transcription, and diarization complete.',
      timestamp: new Date().toISOString(),
      details: {
        durationSeconds: transcriptionResult.durationSeconds,
        speakerCount: transcriptionResult.speakers.length,
        segmentCount: transcriptionResult.transcriptSegments.length,
      },
    });

    return {
      success: true,
      meetingId,
      speakersCount: transcriptionResult.speakers.length,
      segmentsCount: transcriptionResult.transcriptSegments.length,
      durationSeconds: transcriptionResult.durationSeconds,
    };
  } catch (error) {
    console.error(`Pipeline execution failed for meeting ${meetingId}:`, error);

    await updateMeetingInDb(meetingId, { status: 'FAILED' }, tenant);
    emitProgress(meetingId, {
      meetingId,
      stage: 'FAILED',
      percent: 0,
      message: error instanceof Error ? error.message : 'Unknown transcription failure.',
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}
