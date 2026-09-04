import type {
  SpeechProvider,
  TranscribeOptions,
  DiarizeOptions,
  TranscriptionResult,
  DiarizationResult,
} from './types';
import { MockSpeechProvider } from './mock';

export class GoogleSpeechProvider implements SpeechProvider {
  readonly id = 'google_cloud';
  readonly name = 'Google Cloud Speech-to-Text v2';
  private fallbackMock: MockSpeechProvider;

  constructor() {
    this.fallbackMock = new MockSpeechProvider();
  }

  async transcribe(
    audioSource: Blob | Buffer | string,
    options?: TranscribeOptions
  ): Promise<TranscriptionResult> {
    return this.fallbackMock.transcribe(audioSource, options);
  }

  async diarize(
    audioSource: Blob | Buffer | string,
    options?: DiarizeOptions
  ): Promise<DiarizationResult> {
    return this.fallbackMock.diarize(audioSource, options);
  }

  async detectLanguage(
    audioSource: Blob | Buffer | string
  ): Promise<{ language: string; confidence: number }> {
    return this.fallbackMock.detectLanguage(audioSource);
  }
}
