import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/session';
import { getUsersList, createInvitation } from '@/lib/db/admin';
import { z } from 'zod';
import { UserRole, ALL_ROLES } from '@/lib/auth/rbac';

const inviteSchema = z.object({
  email: z.string().email('Valid work email is required'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER', 'MEETING_ORGANIZER', 'EMPLOYEE']),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const { searchParams } = new URL(request.url);

    const filter = {
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') || undefined,
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 10,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const result = await getUsersList(session.user.organizationId, filter);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden: Administrative access required.' }, { status: 403 });
    }
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('Users List Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve user directory.' }, { status: 500 });
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
    console.error('User Invite Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create invitation.' }, { status: 500 });
  }
}
