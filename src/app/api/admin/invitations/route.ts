import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/session';
import { getInvitations, createInvitation } from '@/lib/db/admin';
import { z } from 'zod';
import { UserRole } from '@/lib/auth/rbac';

const inviteSchema = z.object({
  email: z.string().email('Valid work email is required'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER', 'MEETING_ORGANIZER', 'EMPLOYEE']),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const invitations = await getInvitations(session.user.organizationId);

    return NextResponse.json({
      success: true,
      invitations,
      total: invitations.length,
    });
  } catch (error: any) {
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden: Administrative access required.' }, { status: 403 });
    }
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('Invitations GET Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve invitations.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const body = await request.json();
    const parsed = inviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid invitation payload', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await createInvitation(
      session.user.organizationId,
      { id: session.user.id, name: session.user.name },
      parsed.data.email,
      parsed.data.role as UserRole
    );

    return NextResponse.json({
      success: true,
      ...result,
    }, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden: Administrative access required.' }, { status: 403 });
    }
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('Create Invitation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create invitation.' }, { status: 500 });
  }
}
