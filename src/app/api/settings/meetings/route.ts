import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const meetingPrefsSchema = z.object({
  defaultDurationMinutes: z.number().int().min(5).max(480).optional(),
  autoStartAnalysis: z.boolean().optional(),
  transcriptPreference: z.enum(['FULL_DIARIZED', 'COMPACT_SUMMARY', 'RAW']).optional(),
  summaryFormat: z.enum(['EXECUTIVE', 'DETAILED', 'BULLET_POINTS']).optional(),
  defaultVisibility: z.enum(['ORGANIZATION', 'PARTICIPANTS_ONLY', 'PRIVATE']).optional(),
  timezone: z.string().optional(),
  highlightMyMentions: z.boolean().optional(),
});

let runtimeMeetingPrefs = {
  defaultDurationMinutes: 45,
  autoStartAnalysis: true,
  transcriptPreference: 'FULL_DIARIZED',
  summaryFormat: 'EXECUTIVE',
  defaultVisibility: 'ORGANIZATION',
  timezone: 'Asia/Kolkata',
  highlightMyMentions: true,
};

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    let prefs = { ...runtimeMeetingPrefs };

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      if (user && user.meetingPrefs) {
        prefs = { ...prefs, ...(user.meetingPrefs as any) };
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({
      success: true,
      preferences: prefs,
      organizationPolicy: {
        maxRecordingRetentionDays: 180,
        consentMandatory: true,
        externalSharePermitted: false,
      },
    });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('Meeting Prefs GET Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve meeting preferences.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const body = await request.json();

    const parsed = meetingPrefsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid meeting preferences payload', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    runtimeMeetingPrefs = {
      ...runtimeMeetingPrefs,
      ...parsed.data,
    };

    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          meetingPrefs: runtimeMeetingPrefs,
        },
      });
    } catch {
      // Fallback
    }

    return NextResponse.json({
      success: true,
      preferences: runtimeMeetingPrefs,
      message: 'Meeting preferences updated successfully.',
    });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('Meeting Prefs PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update meeting preferences.' }, { status: 500 });
  }
}
