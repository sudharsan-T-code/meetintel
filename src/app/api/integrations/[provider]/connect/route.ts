import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getIntegrationProvider } from '@/lib/integrations/factory';
import { IntegrationProviderType } from '@/lib/integrations/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await requireAuthSession();
    const { provider } = await params;

    let body = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    const providerInstance = getIntegrationProvider(provider as IntegrationProviderType);
    const result = await providerInstance.connect(body);

    return NextResponse.json({
      provider,
      ...result,
    });
  } catch (error) {
    console.error('Integration Connect Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect integration.' },
      { status: 500 }
    );
  }
}
