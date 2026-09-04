import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5432/meetintel?schema=public'),

  // NextAuth
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().min(1).default('meetintel_dev_secret_key_cts_techathon_2026_enterprise_analyzer'),

  // AI Providers
  DEFAULT_AI_PROVIDER: z.enum(['demo', 'openai', 'anthropic', 'gemini', 'local']).default('demo'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o'),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default('claude-3-7-sonnet-20250219'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  LOCAL_AI_ENDPOINT: z.string().url().default('http://localhost:11434/v1'),
  LOCAL_AI_MODEL: z.string().default('llama3'),

  // Speech Providers
  DEFAULT_SPEECH_PROVIDER: z.enum(['demo', 'whisper', 'google_cloud', 'azure']).default('demo'),
  WHISPER_API_KEY: z.string().optional(),
  WHISPER_ENDPOINT: z.string().url().default('https://api.openai.com/v1/audio/transcriptions'),
  GOOGLE_CLOUD_PROJECT_ID: z.string().optional(),
  GOOGLE_CLOUD_CLIENT_EMAIL: z.string().optional(),
  GOOGLE_CLOUD_PRIVATE_KEY: z.string().optional(),
  AZURE_SPEECH_KEY: z.string().optional(),
  AZURE_SPEECH_REGION: z.string().optional(),

  // Storage
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  S3_BUCKET_NAME: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables configuration:', result.error.format());
    throw new Error('Invalid environment variables. Check .env file against .env.example.');
  }
  return result.data;
}

export const env = parseEnv();
