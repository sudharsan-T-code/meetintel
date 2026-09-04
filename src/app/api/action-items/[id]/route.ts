import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { updateActionItemInDb } from '@/lib/db/action-items';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthSession();
    const { id } = await params;
    const body = await request.json();

    const tenant = {
      organizationId: session.user.organizationId,
      userId: session.user.id,
    };

    const updated = await updateActionItemInDb(id, body, tenant);

    return NextResponse.json({
      success: true,
      actionItem: updated,
    });
  } catch (error) {
    console.error('Action Item Update Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update action item.' },
      { status: 500 }
    );
  }
}
