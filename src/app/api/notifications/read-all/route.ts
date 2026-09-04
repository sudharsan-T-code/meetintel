import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { markAllNotificationsRead } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const success = await markAllNotificationsRead(session.user.id);

    return NextResponse.json({
      success,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    console.error('Notifications Read-All Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to mark all notifications as read.' },
      { status: 500 }
    );
  }
}
