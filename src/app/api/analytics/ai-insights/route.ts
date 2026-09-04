import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { generateGroundedAIExecutiveInsights } from '@/lib/db/analytics';
import { analyticsFilterSchema } from '@/lib/validations/analytics';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const tenant = {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
    };

    let body = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    const parsedFilter = analyticsFilterSchema.parse({
      timeRange: (body as { timeRange?: string }).timeRange || '30d',
    });

    const insights = await generateGroundedAIExecutiveInsights(tenant, parsedFilter);

    return NextResponse.json({
      success: true,
      insights,
    });
  } catch (error) {
    console.error('Analytics AI Insights Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate AI executive insights.' },
      { status: 500 }
    );
  }
}
