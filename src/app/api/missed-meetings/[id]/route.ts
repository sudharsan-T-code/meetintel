import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getMissedMeetingBriefing } from '@/lib/db/missed-meetings';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthSession();
    const { id } = await params;

    const tenant = {
      organizationId: session.user.organizationId,
      userId: session.user.id,
    };

    // Strip "missed-" prefix if present
    const cleanMeetingId = id.startsWith('missed-') ? id.replace('missed-', '') : id;

    const briefing = await getMissedMeetingBriefing(cleanMeetingId, tenant);

    return NextResponse.json({
      success: true,
      briefing,
      meeting: {
        ...(briefing?.meeting || {}),
        executiveTakeaway: briefing?.executiveSummary || '',
      },
    });
  } catch (error) {
    console.error('Missed Meeting Briefing GET Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve missed meeting briefing.' },
      { status: 500 }
    );
  }
}
