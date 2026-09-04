import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { runMeetingIntelligencePipeline } from '@/lib/ai/orchestrator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: meetingId } = await params;
    const session = await requireAuthSession();
    const tenant = {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
    };

    let body: { provider?: string; forceRegenerate?: boolean } = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    const intelligence = await runMeetingIntelligencePipeline(meetingId, tenant, {
      provider: body.provider,
      forceRegenerate: body.forceRegenerate,
    });

    return NextResponse.json({
      success: true,
      message: 'AI Meeting intelligence extraction completed.',
      intelligence,
    });
  } catch (error) {
    console.error('AI Analysis Route Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to execute AI analysis.',
      },
      { status: 500 }
    );
  }
}
