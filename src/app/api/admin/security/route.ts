import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/session';
import { getSecurityOverview } from '@/lib/db/admin';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const securityData = await getSecurityOverview(session.user.organizationId);

    return NextResponse.json({
      success: true,
      ...securityData,
    });
  } catch (error: any) {
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden: Administrative access required.' }, { status: 403 });
    }
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('Security Overview Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve security overview.' }, { status: 500 });
  }
}
