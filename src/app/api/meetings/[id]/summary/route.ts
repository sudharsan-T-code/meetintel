import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getAIProvider } from '@/lib/ai/factory';
import { getMeetingByIdFromDb } from '@/lib/db/meetings';
import { persistSummary, getMeetingIntelligence } from '@/lib/db/intelligence';
import type { TranscriptSegment } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: meetingId } = await params;
    const session = await requireAuthSession();
    const tenant = {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
    };

    const intel = await getMeetingIntelligence(meetingId, tenant);
    return NextResponse.json({
      success: true,
      summaries: intel.summaries,
    });
  } catch (error) {
    console.error('Get Summaries Route Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve summaries.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: meetingId } = await params;
    const session = await requireAuthSession();
    const tenant = {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
    };

    const body = await request.json();
    const level = (body.level || 'executive_30s') as 'executive_30s' | 'two_minute' | 'detailed' | 'topic_by_topic' | 'missed_meeting';

    const meetingData = await getMeetingByIdFromDb(meetingId, tenant);
    if (!meetingData) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const rawSegments = (meetingData.transcriptSegments || []) as unknown as TranscriptSegment[];
    const transcriptText = rawSegments.length > 0
      ? rawSegments.map((s) => `[${s.speakerName || 'Speaker'}]: ${s.text}`).join('\n')
      : 'No acoustic transcript segments available for this meeting.';

    const durationMinutes = Math.max(
      1,
      Math.round(('durationSeconds' in meetingData ? meetingData.durationSeconds : (meetingData as { duration?: number }).duration || 3600) / 60)
    );

    const aiProvider = getAIProvider(body.provider);
    const result = await aiProvider.generateSummary({
      meetingTitle: meetingData.title,
      transcriptText,
      durationMinutes,
      level,
    });

    const savedSummary = await persistSummary(
      meetingId,
      level,
      result.content,
      result.keyPoints || [],
      tenant
    );

    return NextResponse.json({
      success: true,
      summary: savedSummary,
    });
  } catch (error) {
    console.error('Generate Summary Route Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate summary.' },
      { status: 500 }
    );
  }
}
