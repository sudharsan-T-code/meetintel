import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getUserNotifications } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const { searchParams } = new URL(request.url);

    const filter = {
      unreadOnly: searchParams.get('unread') === 'true',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50,
    };

    const result = await getUserNotifications(session.user.id, filter);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Notifications GET Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve notifications.' },
      { status: 500 }
    );
  }
}
