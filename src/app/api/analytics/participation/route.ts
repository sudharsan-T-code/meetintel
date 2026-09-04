import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getParticipationAnalytics } from '@/lib/db/analytics';
import { analyticsFilterSchema } from '@/lib/validations/analytics';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const tenant = {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
    };

    const { searchParams } = new URL(request.url);
    const parsedFilter = analyticsFilterSchema.parse({
      timeRange: searchParams.get('timeRange') || '30d',
    });

    const participation = await getParticipationAnalytics(tenant, parsedFilter);

    return NextResponse.json({
      success: true,
      participation,
    });
  } catch (error) {
    console.error('Analytics Participation Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve participation analytics.' },
      { status: 500 }
    );
  }
}
