import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { executeCalendarSync } from '@/lib/integrations/sync-engine';
import { IntegrationProviderType } from '@/lib/integrations/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await requireAuthSession();
    const { provider } = await params;

    const syncResult = await executeCalendarSync(
      session.user.organizationId,
      provider as IntegrationProviderType,
      session.user.id
    );

    return NextResponse.json({
      success: syncResult.success,
      sync: syncResult,
    });
  } catch (error) {
    console.error('Integration Sync Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync calendar events.' },
      { status: 500 }
    );
  }
}
