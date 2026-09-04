import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { updateCommitmentInDb } from '@/lib/db/commitments';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthSession();
    const { id } = await params;
    const body = await request.json();

    const tenant = {
      organizationId: session.user.organizationId,
      userId: session.user.id,
    };

    const updated = await updateCommitmentInDb(id, body, tenant);

    return NextResponse.json({
      success: true,
      commitment: updated,
    });
  } catch (error) {
    console.error('Commitment Update Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update commitment.' },
      { status: 500 }
    );
  }
}
