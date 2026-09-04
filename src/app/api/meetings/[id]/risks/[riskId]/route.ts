import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { updateRiskInDb } from '@/lib/db/intelligence';
import { updateRiskSchema } from '@/lib/validations/intelligence';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; riskId: string }> }
) {
  try {
    const { riskId } = await params;
    const session = await requireAuthSession();
    const tenant = {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
    };

    const rawBody = await request.json();
    const parsed = updateRiskSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = await updateRiskInDb(riskId, parsed.data, tenant);

    return NextResponse.json({
      success: true,
      risk: updated,
    });
  } catch (error) {
    console.error('Update Risk Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update risk.' },
      { status: 500 }
    );
  }
}
