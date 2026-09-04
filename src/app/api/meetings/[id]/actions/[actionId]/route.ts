import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { updateActionItemInDb } from '@/lib/db/intelligence';
import { updateActionItemSchema } from '@/lib/validations/intelligence';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; actionId: string }> }
) {
  try {
    const { actionId } = await params;
    const session = await requireAuthSession();
    const tenant = {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
    };

    const rawBody = await request.json();
    const parsed = updateActionItemSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = await updateActionItemInDb(actionId, parsed.data, tenant);

    return NextResponse.json({
      success: true,
      actionItem: updated,
    });
  } catch (error) {
    console.error('Update Action Item Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update action item.' },
      { status: 500 }
    );
  }
}
