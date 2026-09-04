import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { markNotificationRead } from '@/lib/notifications';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthSession();
    const { id } = await params;

    const success = await markNotificationRead(id, session.user.id);

    return NextResponse.json({
      success,
      notificationId: id,
    });
  } catch (error) {
    console.error('Notification Update Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to mark notification as read.' },
      { status: 500 }
    );
  }
}
