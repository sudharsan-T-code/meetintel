import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession, requireAdminSession } from '@/lib/auth/session';
import { z } from 'zod';

let runtimeActiveAI = process.env.DEFAULT_AI_PROVIDER || 'demo';

const aiConfigSchema = z.object({
  provider: z.enum(['demo', 'openai', 'anthropic', 'gemini', 'local']),
  model: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthSession();

    // Check availability based on server environment without exposing any secrets
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
    const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
    const hasGemini = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

    return NextResponse.json({
      success: true,
      activeProvider: runtimeActiveAI,
      activeModel: runtimeActiveAI === 'openai' ? 'gpt-4o' : runtimeActiveAI === 'gemini' ? 'gemini-1.5-pro' : 'meetintel-enterprise-v1 (Demo Engine)',
      providers: [
        {
          id: 'demo',
          name: 'MEETINTEL Enterprise Engine (Demo)',
          isConfigured: true,
          status: 'OPERATIONAL',
          features: ['Executive Summaries', 'Key Decisions', 'Action Items', 'Risk Analysis', 'Productivity Scoring', 'Ground-Citations Chat'],
          latency: '180ms',
        },
        {
          id: 'gemini',
          name: 'Google Gemini Pro / Flash',
          isConfigured: hasGemini,
          status: hasGemini ? 'OPERATIONAL' : 'API_KEY_REQUIRED_IN_ENV',
          features: ['1M+ Context Window', 'Multi-modal Analysis', 'Fast Summarization'],
          latency: hasGemini ? '320ms' : 'N/A',
        },
        {
          id: 'openai',
          name: 'OpenAI GPT-4o',
          isConfigured: hasOpenAI,
          status: hasOpenAI ? 'OPERATIONAL' : 'API_KEY_REQUIRED_IN_ENV',
          features: ['Complex Reasoning', 'Action Item Extraction', 'Structured Outputs'],
          latency: hasOpenAI ? '450ms' : 'N/A',
        },
        {
          id: 'anthropic',
          name: 'Anthropic Claude 3.5 Sonnet',
          isConfigured: hasAnthropic,
          status: hasAnthropic ? 'OPERATIONAL' : 'API_KEY_REQUIRED_IN_ENV',
          features: ['Nuanced Sentiment', 'Executive Briefings', 'Risk Detection'],
          latency: hasAnthropic ? '410ms' : 'N/A',
        },
        {
          id: 'local',
          name: 'On-Premises / Local LLM (Ollama / vLLM)',
          isConfigured: false,
          status: 'STANDBY',
          features: ['Air-Gapped Processing', 'Zero Data Egress', 'Custom Model Weights'],
          latency: 'Local PCIe',
        },
      ],
      privacy: {
        zeroDataRetention: true,
        thirdPartyTrainingExempt: true,
        tenantIsolationEnforced: true,
        credentialsStoredServerSide: true,
        browserSecretExposure: false,
      },
      canConfigure: session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN',
    });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('AI Settings GET Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve AI settings.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Only administrators may modify organization-level AI provider configurations
    await requireAdminSession();
    const body = await request.json();

    const parsed = aiConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid AI configuration', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Never accept client-submitted API keys directly into public state
    if (body.apiKey) {
      return NextResponse.json(
        { error: 'SecurityViolation: API keys must be provisioned via server environment variables, not client requests.' },
        { status: 400 }
      );
    }

    runtimeActiveAI = parsed.data.provider;

    return NextResponse.json({
      success: true,
      activeProvider: runtimeActiveAI,
      message: `Active AI provider switched to ${runtimeActiveAI}.`,
    });
  } catch (error: any) {
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden: Administrative access required to modify AI configuration.' }, { status: 403 });
    }
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('AI Settings PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update AI settings.' }, { status: 500 });
  }
}
