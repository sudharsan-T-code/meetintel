import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/rbac';
import { createMeetingSchema, meetingFilterSchema } from '@/lib/validations/meeting';
import { createMeetingInDb, listMeetingsFromDb } from '@/lib/db/meetings';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    if (!hasPermission(session.user.role, 'meeting:view')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to view meetings.' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filterData = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      source: searchParams.get('source') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    };

    const parsedFilter = meetingFilterSchema.parse(filterData);
    const meetings = await listMeetingsFromDb(parsedFilter, {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
    });

    return NextResponse.json({ success: true, meetings });
  } catch (error) {
    console.error('GET /api/meetings error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    if (!hasPermission(session.user.role, 'meeting:create')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to create meetings.' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createMeetingSchema.parse(body);

    const meeting = await createMeetingInDb(validatedData, {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
    });

    return NextResponse.json({ success: true, meeting }, { status: 201 });
  } catch (error) {
    console.error('POST /api/meetings error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create meeting' },
      { status: 400 }
    );
  }
}
