import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getPersonalProductivityMetrics } from '@/lib/db/personal-productivity';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const tenant = {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
    };

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId') || undefined;

    const metrics = await getPersonalProductivityMetrics(tenant, targetUserId);

    return NextResponse.json({
      success: true,
      metrics,
      productivity: {
        metrics: {
          ...metrics.kpis,
          focusHours: metrics.kpis.focusHoursAvailable,
          effectivenessScore: metrics.kpis.personalEffectivenessScore,
        },
      },
    });
  } catch (error) {
    console.error('Personal Productivity GET Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve personal productivity metrics.' },
      { status: 500 }
    );
  }
}
