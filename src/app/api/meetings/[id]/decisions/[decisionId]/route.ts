import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { updateDecisionInDb } from '@/lib/db/intelligence';
import { updateDecisionSchema } from '@/lib/validations/intelligence';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; decisionId: string }> }
) {
  try {
    const { decisionId } = await params;
    const session = await requireAuthSession();
    const tenant = {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
    };

    const rawBody = await request.json();
    const parsed = updateDecisionSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = await updateDecisionInDb(decisionId, parsed.data, tenant);

    return NextResponse.json({
      success: true,
      decision: updated,
    });
  } catch (error) {
    console.error('Update Decision Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update decision.' },
      { status: 500 }
    );
  }
}
