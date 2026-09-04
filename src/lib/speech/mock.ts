import type {
  SpeechProvider,
  TranscribeOptions,
  DiarizeOptions,
  TranscriptionResult,
  DiarizationResult,
} from './types';
import { demoSpeakers, demoTranscript } from '@/lib/demo-data';

/**
 * Deterministic Mock Speech Provider returning aligned meeting transcript & speaker data.
 */
export class MockSpeechProvider implements SpeechProvider {
  readonly id = 'demo';
  readonly name = 'MEETINTEL VoiceIntelligence Engine (Demo)';

  async transcribe(
    _audioSource: Blob | Buffer | string,
    _options?: TranscribeOptions
  ): Promise<TranscriptionResult> {
    const fullText = demoTranscript.map((t) => `[${t.speakerName}]: ${t.text}`).join('\n\n');

    const speakerSegments = demoTranscript.map((t, idx) => ({
      id: `seg-${idx + 1}`,
      speakerId: t.speakerId,
      startTime: t.startTime,
      endTime: t.endTime,
      text: t.text,
      confidence: t.confidence,
      sentiment: (idx % 3 === 0 ? 'positive' : idx % 3 === 1 ? 'neutral' : 'negative') as
        | 'positive'
        | 'neutral'
        | 'negative',
    }));

    return {
      text: fullText,
      durationSeconds: 6300, // 1h 45m
      language: 'en',
      confidence: 0.96,
      speakers: demoSpeakers,
      speakerSegments,
      transcriptSegments: demoTranscript,
    };
  }

  async diarize(
    _audioSource: Blob | Buffer | string,
    _options?: DiarizeOptions
  ): Promise<DiarizationResult> {
    return {
      speakers: demoSpeakers.map((s) => ({
        speakerLabel: s.speakerLabel,
        speakingDuration: s.speakingDuration,
        speakingPercentage: s.speakingPercentage,
      })),
      segments: demoTranscript.map((t) => ({
        speakerLabel: t.speakerName,
        startTime: t.startTime,
        endTime: t.endTime,
        text: t.text,
      })),
    };
  }

  async detectLanguage(
    _audioSource: Blob | Buffer | string
  ): Promise<{ language: string; confidence: number }> {
    return {
      language: 'en',
      confidence: 0.98,
    };
  }
}
