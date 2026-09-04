import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/rbac';
import { validateMediaFile, storeMediaFile } from '@/lib/storage';
import { updateMeetingInDb } from '@/lib/db/meetings';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthSession();
    if (!hasPermission(session.user.role, 'meeting:upload_recording')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to upload recordings.' }, { status: 403 });
    }

    const { id: meetingId } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const isDemoRecording = formData.get('isDemo') === 'true';

    let recordingUrl = '/demo-recording.mp3';

    if (file && !isDemoRecording) {
      const validation = validateMediaFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await storeMediaFile(buffer, file.name, file.type);
      recordingUrl = uploadResult.url;
    }

    // Update meeting with uploaded recording URL and status UPLOADED
    const updated = await updateMeetingInDb(
      meetingId,
      {
        recordingUrl,
        status: 'UPLOADED',
      },
      {
        organizationId: session.user.organizationId,
        userId: session.user.id,
        userRole: session.user.role,
      }
    );

    return NextResponse.json({
      success: true,
      recordingUrl,
      meeting: updated,
    });
  } catch (error) {
    console.error('POST /api/meetings/[id]/upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
