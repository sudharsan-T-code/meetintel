import type { Speaker, SpeakerSegment, TranscriptSegment } from '@/types';

export interface TranscribeOptions {
  language?: string;
  enableDiarization?: boolean;
  maxSpeakers?: number;
  prompt?: string;
}

export interface DiarizeOptions {
  minSpeakers?: number;
  maxSpeakers?: number;
}

export interface TranscriptionResult {
  text: string;
  durationSeconds: number;
  language: string;
  confidence: number;
  speakers: Speaker[];
  speakerSegments: SpeakerSegment[];
  transcriptSegments: TranscriptSegment[];
}

export interface DiarizationResult {
  speakers: {
    speakerLabel: string;
    speakingDuration: number;
    speakingPercentage: number;
  }[];
  segments: {
    speakerLabel: string;
    startTime: number;
    endTime: number;
    text: string;
  }[];
}

export interface SpeechProvider {
  readonly id: string;
  readonly name: string;

  /**
   * Transcribes an audio file or stream with timestamps and speaker diarization.
   */
  transcribe(
    audioSource: Blob | Buffer | string,
    options?: TranscribeOptions
  ): Promise<TranscriptionResult>;

  /**
   * Performs standalone speaker diarization on audio data.
   */
  diarize(
    audioSource: Blob | Buffer | string,
    options?: DiarizeOptions
  ): Promise<DiarizationResult>;

  /**
   * Detects the primary language spoken in the audio.
   */
  detectLanguage(
    audioSource: Blob | Buffer | string
  ): Promise<{ language: string; confidence: number }>;
}
