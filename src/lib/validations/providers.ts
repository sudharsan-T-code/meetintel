import { z } from 'zod';

export const aiProviderTypeSchema = z.enum([
  'demo',
  'openai',
  'anthropic',
  'gemini',
  'local',
]);

export const speechProviderTypeSchema = z.enum([
  'demo',
  'whisper',
  'google_cloud',
  'azure',
]);

export const aiProviderConfigSchema = z.object({
  provider: aiProviderTypeSchema,
  apiKey: z.string().optional(),
  model: z.string().optional(),
  endpoint: z.string().url().optional(),
  temperature: z.number().min(0).max(2).optional().default(0.2),
  maxTokens: z.number().int().positive().optional().default(4096),
});

export const speechProviderConfigSchema = z.object({
  provider: speechProviderTypeSchema,
  apiKey: z.string().optional(),
  endpoint: z.string().url().optional(),
  language: z.string().optional().default('en'),
  enableDiarization: z.boolean().optional().default(true),
  maxSpeakers: z.number().int().positive().optional().default(10),
});

export type AIProviderConfigInput = z.infer<typeof aiProviderConfigSchema>;
export type SpeechProviderConfigInput = z.infer<typeof speechProviderConfigSchema>;
