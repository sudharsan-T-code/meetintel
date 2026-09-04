import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getActionItems } from '@/lib/db/action-items';
import { ActionPriority, ActionStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const tenant = {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
    };

    const { searchParams } = new URL(request.url);
    const filter = {
      status: (searchParams.get('status') as ActionStatus) || undefined,
      priority: (searchParams.get('priority') as ActionPriority) || undefined,
      assignee: searchParams.get('assignee') || undefined,
      meetingId: searchParams.get('meetingId') || undefined,
      search: searchParams.get('search') || undefined,
      overdueOnly: searchParams.get('overdue') === 'true',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0,
    };

    const result = await getActionItems(tenant, filter);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Action Items GET Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve action items.' },
      { status: 500 }
    );
  }
}
