import type {
  SpeechProvider,
  TranscribeOptions,
  DiarizeOptions,
  TranscriptionResult,
  DiarizationResult,
} from './types';
import { MockSpeechProvider } from './mock';

export class WhisperSpeechProvider implements SpeechProvider {
  readonly id = 'whisper';
  readonly name = 'OpenAI Whisper API';
  private apiKey: string;
  private endpoint: string;
  private fallbackMock: MockSpeechProvider;

  constructor(apiKey?: string, endpoint = 'https://api.openai.com/v1/audio/transcriptions') {
    this.apiKey = apiKey || process.env.WHISPER_API_KEY || process.env.OPENAI_API_KEY || '';
    this.endpoint = endpoint;
    this.fallbackMock = new MockSpeechProvider();
  }

  async transcribe(
    audioSource: Blob | Buffer | string,
    options?: TranscribeOptions
  ): Promise<TranscriptionResult> {
    if (!this.apiKey) {
      return this.fallbackMock.transcribe(audioSource, options);
    }

    try {
      const formData = new FormData();
      if (typeof audioSource === 'string') {
        formData.append('url', audioSource);
      } else if (audioSource instanceof Blob) {
        formData.append('file', audioSource, 'audio.mp3');
      }
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'verbose_json');
      if (options?.language) {
        formData.append('language', options.language);
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Whisper API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.text || '',
        durationSeconds: data.duration || 0,
        language: data.language || 'en',
        confidence: 0.95,
        speakers: [],
        speakerSegments: [],
        transcriptSegments: (data.segments || []).map((s: { id: number; start: number; end: number; text: string }, i: number) => ({
          id: `whisper-${s.id || i}`,
          meetingId: 'unknown',
          speakerId: 'speaker-1',
          speakerName: 'Speaker 1',
          startTime: s.start,
          endTime: s.end,
          text: s.text,
          confidence: 0.95,
          language: data.language || 'en',
          topics: [],
          isImportant: false,
        })),
      };
    } catch (error) {
      console.warn('Whisper API failed, falling back to mock speech provider:', error);
      return this.fallbackMock.transcribe(audioSource, options);
    }
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
