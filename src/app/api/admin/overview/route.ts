import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/session';
import { getAdminOverview } from '@/lib/db/admin';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const overview = await getAdminOverview(session.user.organizationId);

    return NextResponse.json({
      success: true,
      ...overview,
    });
  } catch (error: any) {
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden: Administrative access required.' }, { status: 403 });
    }
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('Admin Overview Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve administrative overview.' }, { status: 500 });
  }
}
