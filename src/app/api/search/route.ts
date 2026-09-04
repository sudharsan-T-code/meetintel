import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { executeGlobalSearch, SearchEntityType } from '@/lib/db/search';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const tenant = {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
    };

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = (searchParams.get('type')?.toUpperCase() as SearchEntityType) || 'ALL';
    const meetingId = searchParams.get('meetingId') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;

    const result = await executeGlobalSearch(tenant, {
      query,
      type,
      meetingId,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      query,
      type,
      ...result,
    });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('Global Search API Error:', error);
    return NextResponse.json({ error: 'Failed to perform search query.' }, { status: 500 });
  }
}
