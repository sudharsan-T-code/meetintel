import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/rbac';
import { runMeetingPipeline } from '@/lib/pipeline/orchestrator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthSession();
    if (!hasPermission(session.user.role, 'meeting:create')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to process meetings.' }, { status: 403 });
    }

    const { id: meetingId } = await params;
    let options = {};
    try {
      options = await request.json();
    } catch {
      // Body is optional
    }

    const result = await runMeetingPipeline(
      meetingId,
      {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        userRole: session.user.role,
      },
      options
    );

    return NextResponse.json({ ...result });
  } catch (error) {
    console.error('POST /api/meetings/[id]/process error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    );
  }
}
