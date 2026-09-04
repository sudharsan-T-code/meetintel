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

    const providerInstance = getIntegrationProvider(provider as IntegrationProviderType);
    const result = await providerInstance.disconnect(session.user.organizationId);

    return NextResponse.json({
      provider,
      ...result,
    });
  } catch (error) {
    console.error('Integration Disconnect Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to disconnect integration.' },
      { status: 500 }
    );
  }
}
