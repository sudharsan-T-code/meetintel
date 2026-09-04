import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/session';
import { updateUserRole, toggleUserStatus, removeUser } from '@/lib/db/admin';
import { z } from 'zod';
import { UserRole } from '@/lib/auth/rbac';

const patchSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER', 'MEETING_ORGANIZER', 'EMPLOYEE']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED']).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id: targetUserId } = await params;
    const body = await request.json();

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let updatedResult: any = {};

    if (parsed.data.role) {
      updatedResult.user = await updateUserRole(
        session.user.organizationId,
        session.user.id,
        targetUserId,
        parsed.data.role as UserRole,
        session.user.name
      );
    }

    if (parsed.data.status) {
      updatedResult.user = await toggleUserStatus(
        session.user.organizationId,
        session.user.id,
        targetUserId,
        parsed.data.status,
        session.user.name
      );
    }

    return NextResponse.json({
      success: true,
      ...updatedResult,
    });
  } catch (error: any) {
    if (error.message?.includes('ActionProhibited')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden: Administrative access required.' }, { status: 403 });
    }
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    if (error.message?.includes('UserNotFound')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error('Update User Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update user.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id: targetUserId } = await params;

    const result = await removeUser(
      session.user.organizationId,
      session.user.id,
      targetUserId,
      session.user.name
    );

    return NextResponse.json({
      ...result,
    });
  } catch (error: any) {
    if (error.message?.includes('ActionProhibited')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden: Administrative access required.' }, { status: 403 });
    }
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    if (error.message?.includes('UserNotFound')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error('Delete User Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete user.' }, { status: 500 });
  }
}
