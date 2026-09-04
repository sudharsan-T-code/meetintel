import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getCommitments } from '@/lib/db/commitments';
import { CommitmentStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const tenant = {
      organizationId: session.user.organizationId,
      userId: session.user.id,
    };

    const { searchParams } = new URL(request.url);
    const filter = {
      status: (searchParams.get('status') as CommitmentStatus) || undefined,
      committedBy: searchParams.get('committedBy') || undefined,
      meetingId: searchParams.get('meetingId') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0,
    };

    const result = await getCommitments(tenant, filter);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Commitments GET Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve commitments.' },
      { status: 500 }
    );
  }
}
