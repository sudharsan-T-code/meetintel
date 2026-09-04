import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/session';
import { getAuditLogs } from '@/lib/db/admin';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const { searchParams } = new URL(request.url);

    const filter = {
      search: searchParams.get('search') || undefined,
      actor: searchParams.get('actor') || undefined,
      action: searchParams.get('action') || undefined,
      resource: searchParams.get('resource') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
    };

    const result = await getAuditLogs(session.user.organizationId, filter);

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
    console.error('Audit Logs Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve audit records.' }, { status: 500 });
  }
}
