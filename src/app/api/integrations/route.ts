import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getIntegrationProvider } from '@/lib/integrations/factory';
import { IntegrationProviderType } from '@/lib/integrations/types';

const SUPPORTED_PROVIDERS: IntegrationProviderType[] = [
  'google_calendar',
  'microsoft_calendar',
  'zoom',
  'google_meet',
  'microsoft_teams',
];

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const orgId = session.user.organizationId;

    const statuses = await Promise.all(
      SUPPORTED_PROVIDERS.map(async (p) => {
        const providerInstance = getIntegrationProvider(p);
        return providerInstance.getStatus(orgId);
      })
    );

    return NextResponse.json({
      success: true,
      integrations: statuses,
    });
  } catch (error) {
    console.error('Integrations GET Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve integrations.' },
      { status: 500 }
    );
  }
}
