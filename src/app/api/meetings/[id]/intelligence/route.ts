import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getMeetingIntelligence } from '@/lib/db/intelligence';

export async function GET(
  _request: NextRequest,
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

    const intelligence = await getMeetingIntelligence(meetingId, tenant);

    return NextResponse.json({
      success: true,
      intelligence,
    });
  } catch (error) {
    console.error('Get Meeting Intelligence Route Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve meeting intelligence.',
      },
      { status: 500 }
    );
  }
}
