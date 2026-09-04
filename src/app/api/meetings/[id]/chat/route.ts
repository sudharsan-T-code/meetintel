import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getAIProvider } from '@/lib/ai/factory';
import { getMeetingByIdFromDb } from '@/lib/db/meetings';
import {
  getMeetingChatMessages,
  persistChatMessage,
  clearMeetingChat,
  getMeetingIntelligence,
} from '@/lib/db/intelligence';
import { chatQuerySchema } from '@/lib/validations/intelligence';
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

    const messages = await getMeetingChatMessages(meetingId, tenant);

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Get Chat Messages Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve chat history.' },
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

    const rawBody = await request.json();
    const parsed = chatQuerySchema.safeParse({
      ...rawBody,
      meetingId,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid chat request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { query, conversationHistory } = parsed.data;

    // Persist user prompt
    await persistChatMessage(
      meetingId,
      {
        role: 'user',
        content: query,
        messageType: 'fact',
      },
      tenant
    );

    // Fetch meeting context
    const meetingData = await getMeetingByIdFromDb(meetingId, tenant);
    const intel = await getMeetingIntelligence(meetingId, tenant);

    const segments = ((meetingData?.transcriptSegments || []) as unknown as TranscriptSegment[]).map((s) => ({
      id: s.id,
      speakerName: s.speakerName,
      timestamp: s.startTime,
      text: s.text,
    }));

    const aiProvider = getAIProvider(rawBody.provider);

    const aiResult = await aiProvider.answerMeetingQuery({
      query,
      meetingTitle: meetingData?.title || 'Meeting',
      transcriptSegments: segments,
      decisions: intel.decisions,
      actions: intel.actionItems,
      risks: intel.risks,
      conversationHistory: conversationHistory || [],
    });

    // Persist AI response with grounded source citations
    const assistantMessage = await persistChatMessage(
      meetingId,
      {
        role: 'assistant',
        content: aiResult.content,
        messageType: aiResult.messageType,
        sources: aiResult.sources.map((src) => ({
          ...src,
          confidence: (src.confidence || 'high') as 'high' | 'medium' | 'low',
        })),
      },
      tenant
    );

    return NextResponse.json({
      success: true,
      message: assistantMessage,
    });
  } catch (error) {
    console.error('Chat Query Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate chat response.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await clearMeetingChat(meetingId, tenant);

    return NextResponse.json({
      success: true,
      message: 'Chat history cleared.',
    });
  } catch (error) {
    console.error('Clear Chat Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clear chat history.' },
      { status: 500 }
    );
  }
}
