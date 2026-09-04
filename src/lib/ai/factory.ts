import type { AIProvider } from './types';
import { MockAIProvider } from './mock';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { GeminiProvider } from './gemini';
import { LocalAIProvider } from './local';

export interface AIProviderOptions {
  provider?: 'demo' | 'openai' | 'anthropic' | 'gemini' | 'local';
  apiKey?: string;
  model?: string;
  endpoint?: string;
}

/**
 * Returns an instance of the configured AI Provider with fallback chaining.
 */
export function getAIProvider(options?: AIProviderOptions | string): AIProvider {
  const opts: AIProviderOptions = typeof options === 'string' ? { provider: options as AIProviderOptions['provider'] } : (options || {});
  const providerType =
    opts?.provider ||
    (process.env.DEFAULT_AI_PROVIDER as AIProviderOptions['provider']) ||
    'demo';

  switch (providerType) {
    case 'openai':
      return new OpenAIProvider(opts.apiKey, opts.model);
    case 'anthropic':
      return new AnthropicProvider(opts.apiKey, opts.model);
    case 'gemini':
      return new GeminiProvider(opts.apiKey, opts.model);
    case 'local':
      return new LocalAIProvider(opts.endpoint, opts.model);
    case 'demo':
    default:
      return new MockAIProvider();
  }
}
