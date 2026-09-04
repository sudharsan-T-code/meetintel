import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/rbac';
import { getMeetingByIdFromDb, updateMeetingInDb } from '@/lib/db/meetings';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthSession();
    const { id: meetingId } = await params;

    const meeting = await getMeetingByIdFromDb(meetingId, {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, meeting });
  } catch (error) {
    console.error('GET /api/meetings/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthSession();
    if (!hasPermission(session.user.role, 'meeting:edit')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to edit meetings.' }, { status: 403 });
    }

    const { id: meetingId } = await params;
    const body = await request.json();

    const updated = await updateMeetingInDb(meetingId, body, {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
    });

    return NextResponse.json({ success: true, meeting: updated });
  } catch (error) {
    console.error('PATCH /api/meetings/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update meeting' },
      { status: 400 }
    );
  }
}
