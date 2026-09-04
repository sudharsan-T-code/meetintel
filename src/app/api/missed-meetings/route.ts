import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getMissedMeetings } from '@/lib/db/missed-meetings';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const tenant = {
      organizationId: session.user.organizationId,
      userId: session.user.id,
    };

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;

    const missedMeetings = await getMissedMeetings(tenant, { limit });

    return NextResponse.json({
      success: true,
      missedMeetings,
    });
  } catch (error) {
    console.error('Missed Meetings GET Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve missed meetings.' },
      { status: 500 }
    );
  }
}
