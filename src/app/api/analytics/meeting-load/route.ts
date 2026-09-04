import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getMeetingLoadAnalytics } from '@/lib/db/analytics';
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

    const loadData = await getMeetingLoadAnalytics(tenant, parsedFilter);

    // RBAC check: only managers and admins see individual participant names
    const isPrivileged = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR'].includes(session.user.role.toUpperCase());
    const sanitizedParticipants = isPrivileged
      ? loadData.topParticipants
      : loadData.topParticipants.map((p, idx) => ({
          ...p,
          name: `Team Member ${idx + 1}`,
          role: 'Contributor',
        }));

    return NextResponse.json({
      success: true,
      meetingLoad: {
        ...loadData,
        topParticipants: sanitizedParticipants,
      },
    });
  } catch (error) {
    console.error('Analytics Meeting Load Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve meeting load analytics.' },
      { status: 500 }
    );
  }
}
