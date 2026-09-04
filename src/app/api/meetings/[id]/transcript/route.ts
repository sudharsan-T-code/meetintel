import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/rbac';
import { getMeetingByIdFromDb } from '@/lib/db/meetings';

export async function GET(
  request: NextRequest,
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

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('q')?.toLowerCase();
    const speakerId = searchParams.get('speakerId');

    interface SegmentRecord {
      id: string;
      speakerId?: string | null;
      speakerName: string;
      startTime: number;
      endTime: number;
      text: string;
    }

    let segments = (meeting.transcriptSegments || []) as SegmentRecord[];

    if (speakerId && speakerId !== 'all') {
      segments = segments.filter((s) => s.speakerId === speakerId || s.speakerName === speakerId);
    }

    if (search) {
      segments = segments.filter((s) =>
        s.text.toLowerCase().includes(search) ||
        s.speakerName.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      count: segments.length,
      segments,
    });
  } catch (error) {
    console.error('GET /api/meetings/[id]/transcript error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
}
