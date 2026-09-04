import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/rbac';
import { getMeetingByIdFromDb } from '@/lib/db/meetings';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthSession();
    if (!hasPermission(session.user.role, 'meeting:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: meetingId } = await params;
    const meeting = await getMeetingByIdFromDb(meetingId, {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      speakers: meeting.speakers || [],
    });
  } catch (error) {
    console.error('GET /api/meetings/[id]/speakers error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch speakers' },
      { status: 500 }
    );
  }
}
