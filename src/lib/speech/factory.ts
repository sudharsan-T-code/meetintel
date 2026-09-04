import type { SpeechProvider } from './types';
import { MockSpeechProvider } from './mock';
import { WhisperSpeechProvider } from './whisper';
import { GoogleSpeechProvider } from './google';
import { AzureSpeechProvider } from './azure';

export interface SpeechProviderOptions {
  provider?: 'demo' | 'whisper' | 'google_cloud' | 'azure';
  apiKey?: string;
  endpoint?: string;
}

/**
 * Returns an instance of the configured Speech Provider.
 */
export function getSpeechProvider(options?: SpeechProviderOptions): SpeechProvider {
  const providerType =
    options?.provider ||
    (process.env.DEFAULT_SPEECH_PROVIDER as SpeechProviderOptions['provider']) ||
    'demo';

  switch (providerType) {
    case 'whisper':
      return new WhisperSpeechProvider(options?.apiKey, options?.endpoint);
    case 'google_cloud':
      return new GoogleSpeechProvider();
    case 'azure':
      return new AzureSpeechProvider();
    case 'demo':
    default:
      return new MockSpeechProvider();
  }
}
