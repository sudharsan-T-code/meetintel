import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/session';
import { getOrganizationSettings, updateOrganizationSettings } from '@/lib/db/admin';
import { z } from 'zod';

const orgSettingsSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  transcriptRetentionDays: z.number().int().min(1).max(3650).optional(),
  recordingRetentionDays: z.number().int().min(1).max(3650).optional(),
  aiProcessingEnabled: z.boolean().optional(),
  meetingConsentRequired: z.boolean().optional(),
  externalSharingEnabled: z.boolean().optional(),
  defaultTimezone: z.string().optional(),
  defaultMeetingDuration: z.number().int().min(5).max(480).optional(),
  autoAnalysisEnabled: z.boolean().optional(),
  sessionTimeoutHours: z.number().int().min(1).max(168).optional(),
  mfaEnforcement: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const settings = await getOrganizationSettings(session.user.organizationId);

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden: Administrative access required.' }, { status: 403 });
    }
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('Organization Settings GET Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve organization settings.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const body = await request.json();
    const parsed = orgSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid settings payload', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateOrganizationSettings(
      session.user.organizationId,
      session.user.id,
      session.user.name,
      parsed.data
    );

    return NextResponse.json({
      success: true,
      settings: updated,
    });
  } catch (error: any) {
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden: Administrative access required.' }, { status: 403 });
    }
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('Organization Settings PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update organization settings.' }, { status: 500 });
  }
}
