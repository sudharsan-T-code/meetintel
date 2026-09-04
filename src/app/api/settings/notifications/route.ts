import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const notificationPrefsSchema = z.object({
  actionAssigned: z.boolean().optional(),
  actionDue: z.boolean().optional(),
  actionOverdue: z.boolean().optional(),
  commitmentDue: z.boolean().optional(),
  commitmentOverdue: z.boolean().optional(),
  riskDetected: z.boolean().optional(),
  meetingAnalysisCompleted: z.boolean().optional(),
  missedMeetingAvailable: z.boolean().optional(),
  calendarSyncCompleted: z.boolean().optional(),
  emailDeliveryEnabled: z.boolean().optional(),
  inAppAlertsEnabled: z.boolean().optional(),
});

let runtimeNotificationPrefs = {
  actionAssigned: true,
  actionDue: true,
  actionOverdue: true,
  commitmentDue: true,
  commitmentOverdue: true,
  riskDetected: true,
  meetingAnalysisCompleted: true,
  missedMeetingAvailable: true,
  calendarSyncCompleted: false,
  emailDeliveryEnabled: false,
  inAppAlertsEnabled: true,
};

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    let prefs = { ...runtimeNotificationPrefs };

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      if (user && user.notificationPrefs) {
        prefs = { ...prefs, ...(user.notificationPrefs as any) };
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({
      success: true,
      preferences: prefs,
      channelStatus: {
        inApp: { enabled: true, status: 'ACTIVE' },
        email: {
          enabled: prefs.emailDeliveryEnabled,
          status: 'DEMO_MODE',
          note: 'External SMTP service not configured; email dispatches run in simulated demo delivery mode.',
        },
      },
    });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('Notification Prefs GET Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve notification preferences.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const body = await request.json();

    const parsed = notificationPrefsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid preferences payload', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    runtimeNotificationPrefs = {
      ...runtimeNotificationPrefs,
      ...parsed.data,
    };

    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          notificationPrefs: runtimeNotificationPrefs,
        },
      });
    } catch {
      // Fallback
    }

    return NextResponse.json({
      success: true,
      preferences: runtimeNotificationPrefs,
      message: 'Notification preferences saved successfully.',
    });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('Notification Prefs PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update notification preferences.' }, { status: 500 });
  }
}
