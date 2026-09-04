export type PipelineState =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'UPLOADING'
  | 'UPLOADED'
  | 'EXTRACTING_AUDIO'
  | 'TRANSCRIBING'
  | 'DIARIZING'
  | 'ANALYZING'
  | 'GENERATING_INSIGHTS'
  | 'COMPLETED'
  | 'FAILED';

export interface PipelineProgressEvent {
  meetingId: string;
  stage: PipelineState;
  percent: number;
  message: string;
  timestamp: string;
  details?: {
    durationSeconds?: number;
    speakerCount?: number;
    segmentCount?: number;
    modelUsed?: string;
  };
}

export interface PipelineExecutionOptions {
  speechProvider?: 'demo' | 'whisper' | 'google_cloud' | 'azure';
  language?: string;
  enableDiarization?: boolean;
  maxSpeakers?: number;
}
