import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/session';
import { revokeInvitation } from '@/lib/db/admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id: invitationId } = await params;

    const result = await revokeInvitation(
      session.user.organizationId,
      invitationId,
      session.user.id,
      session.user.name
    );

    return NextResponse.json({
      ...result,
    });
  } catch (error: any) {
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden: Administrative access required.' }, { status: 403 });
    }
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    if (error.message?.includes('InvitationNotFound')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error('Revoke Invitation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to revoke invitation.' }, { status: 500 });
  }
}
