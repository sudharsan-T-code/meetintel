import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getExecutiveOverviewAnalytics } from '@/lib/db/analytics';
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
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      team: searchParams.get('team') || undefined,
      source: searchParams.get('source') || undefined,
    });

    const overview = await getExecutiveOverviewAnalytics(tenant, parsedFilter);

    return NextResponse.json({
      success: true,
      overview,
    });
  } catch (error) {
    console.error('Analytics Overview Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve executive analytics overview.' },
      { status: 500 }
    );
  }
}
