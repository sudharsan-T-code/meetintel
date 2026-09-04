import 'server-only';
import { prisma } from '@/lib/prisma';
import type { TenantContext } from '@/lib/db/tenant';
import { assertTenantAccess } from '@/lib/db/tenant';
import type { TranscriptionResult } from '@/lib/speech/types';
import type { CreateMeetingInput, MeetingFilterInput } from '@/lib/validations/meeting';
import type { Prisma, Speaker, TranscriptSegment, MeetingStatus, MeetingSource } from '@prisma/client';
import {
  demoMeeting,
  demoMeetingsList,
  demoSpeakers,
  demoTranscript,
} from '@/lib/demo-data';

export interface StoredMeetingRecord {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  scheduledAt: Date;
  durationSeconds: number;
  duration?: number;
  participantCount: number;
  source: string;
  status: string;
  organizerId?: string | null;
  organizerName?: string;
  recordingUrl?: string | null;
  audioUrl?: string | null;
  tags: string[];
  productivityScore?: { overall: number };
  productivityMetrics?: unknown;
  costMetrics?: unknown;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date | string | null;
  speakers?: unknown[];
  transcriptSegments?: unknown[];
}

// In-memory runtime cache for dynamically created/processed meetings during demo runtime
const runtimeMeetings = new Map<string, StoredMeetingRecord>();
const runtimeTranscripts = new Map<string, TranscriptSegment[] | typeof demoTranscript>();
const runtimeSpeakers = new Map<string, Speaker[] | typeof demoSpeakers>();

// Initialize with demo data
runtimeMeetings.set(demoMeeting.id, {
  ...demoMeeting,
  scheduledAt: new Date(demoMeeting.scheduledAt),
  createdAt: new Date(demoMeeting.createdAt),
  updatedAt: new Date(demoMeeting.createdAt),
  durationSeconds: demoMeeting.duration,
});
runtimeTranscripts.set(demoMeeting.id, demoTranscript);
runtimeSpeakers.set(demoMeeting.id, demoSpeakers);

for (const m of demoMeetingsList) {
  if (!runtimeMeetings.has(m.id)) {
    runtimeMeetings.set(m.id, {
      ...m,
      scheduledAt: new Date(m.scheduledAt),
      createdAt: new Date(m.createdAt),
      updatedAt: new Date(m.createdAt),
      durationSeconds: m.duration,
    });
  }
}

/**
 * Creates a new meeting within tenant scope.
 */
export async function createMeetingInDb(data: CreateMeetingInput, tenant: TenantContext) {
  try {
    const meeting = await prisma.meeting.create({
      data: {
        organizationId: tenant.organizationId,
        title: data.title,
        description: data.description,
        scheduledAt: data.scheduledAt,
        durationSeconds: data.durationSeconds || 0,
        participantCount: data.participantCount || 1,
        source: (data.source as MeetingSource) || 'UPLOAD',
        status: (data.recordingUrl ? 'UPLOADED' : 'DRAFT') as MeetingStatus,
        organizerId: tenant.userId,
        organizerName: 'Organizer',
        recordingUrl: data.recordingUrl,
        tags: data.tags || [],
      },
    });

    runtimeMeetings.set(meeting.id, {
      ...meeting,
      tags: meeting.tags || [],
    });
    return meeting;
  } catch (error) {
    console.warn('Prisma createMeeting fallback to runtime memory store:', error);
    const id = `mtg-${Date.now()}`;
    const newMeeting: StoredMeetingRecord = {
      id,
      organizationId: tenant.organizationId,
      title: data.title,
      description: data.description || '',
      scheduledAt: new Date(data.scheduledAt),
      durationSeconds: data.durationSeconds || 0,
      participantCount: data.participantCount || 1,
      source: data.source || 'UPLOAD',
      status: data.recordingUrl ? 'UPLOADED' : 'DRAFT',
      organizerId: tenant.userId,
      organizerName: 'Priya Sharma',
      recordingUrl: data.recordingUrl,
      tags: data.tags || ['Strategy'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    runtimeMeetings.set(id, newMeeting);
    return newMeeting;
  }
}

/**
 * Lists meetings for the tenant with optional status, search, and date filters.
 */
export async function listMeetingsFromDb(filter: MeetingFilterInput, tenant: TenantContext) {
  try {
    const where: Prisma.MeetingWhereInput = {
      organizationId: tenant.organizationId,
    };

    if (filter.status) {
      where.status = filter.status as MeetingStatus;
    }
    if (filter.source) {
      where.source = filter.source as MeetingSource;
    }
    if (filter.search) {
      where.title = { contains: filter.search, mode: 'insensitive' };
    }

    const meetings = await prisma.meeting.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      take: filter.limit || 50,
      skip: ((filter.page || 1) - 1) * (filter.limit || 50),
      include: {
        speakers: true,
      },
    });

    if (meetings.length > 0) {
      return meetings;
    }
  } catch (error) {
    console.warn('Prisma listMeetings fallback to memory store:', error);
  }

  // Return runtime/demo meetings matching filter
  let results = Array.from(runtimeMeetings.values());
  if (filter.status) {
    results = results.filter((m) => m.status === filter.status);
  }
  if (filter.source) {
    results = results.filter((m) => m.source?.toLowerCase() === filter.source?.toLowerCase());
  }
  if (filter.search) {
    const s = filter.search.toLowerCase();
    results = results.filter(
      (m) =>
        m.title.toLowerCase().includes(s) ||
        (m.tags || []).some((t: string) => t.toLowerCase().includes(s))
    );
  }

  return results;
}

/**
 * Retrieves a single meeting by ID with tenant security check.
 */
export async function getMeetingByIdFromDb(meetingId: string, tenant: TenantContext) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        speakers: {
          include: { segments: true },
        },
        transcriptSegments: {
          orderBy: { startTime: 'asc' },
        },
        topics: true,
        decisions: true,
        actionItems: true,
        risks: true,
      },
    });

    if (meeting) {
      assertTenantAccess(tenant.organizationId, meeting.organizationId);
      return meeting;
    }
  } catch (error) {
    console.warn('Prisma getMeetingById fallback to memory store:', error);
  }

  const memoryMeeting = runtimeMeetings.get(meetingId);
  if (memoryMeeting) {
    return {
      ...memoryMeeting,
      speakers: runtimeSpeakers.get(meetingId) || [],
      transcriptSegments: runtimeTranscripts.get(meetingId) || [],
    };
  }

  return null;
}

/**
 * Updates meeting state and metadata.
 */
export async function updateMeetingInDb(
  meetingId: string,
  data: Prisma.MeetingUpdateInput,
  tenant: TenantContext
) {
  try {
    const existing = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (existing) {
      assertTenantAccess(tenant.organizationId, existing.organizationId);
      const updated = await prisma.meeting.update({
        where: { id: meetingId },
        data,
      });
      runtimeMeetings.set(meetingId, {
        ...updated,
        tags: updated.tags || [],
      });
      return updated;
    }
  } catch (error) {
    console.warn('Prisma updateMeeting fallback to memory store:', error);
  }

  const memoryMeeting = runtimeMeetings.get(meetingId);
  if (memoryMeeting) {
    const updated = {
      ...memoryMeeting,
      ...(data as Partial<StoredMeetingRecord>),
      updatedAt: new Date(),
    };
    runtimeMeetings.set(meetingId, updated);
    return updated;
  }

  throw new Error(`MeetingNotFound: Meeting with ID "${meetingId}" does not exist.`);
}

/**
 * Persists transcription result and diarized speakers into database.
 */
export async function persistTranscriptionResult(
  meetingId: string,
  result: TranscriptionResult,
  tenant: TenantContext
) {
  try {
    const existing = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (existing) {
      assertTenantAccess(tenant.organizationId, existing.organizationId);

      // Save speakers & segments in transaction
      await prisma.$transaction(async (tx) => {
        // Delete existing segments if reprocessing
        await tx.transcriptSegment.deleteMany({ where: { meetingId } });
        await tx.speakerSegment.deleteMany({ where: { meetingId } });
        await tx.speaker.deleteMany({ where: { meetingId } });

        // Insert speakers
        for (const spk of result.speakers) {
          await tx.speaker.create({
            data: {
              id: spk.id,
              meetingId,
              name: spk.name,
              speakerLabel: spk.speakerLabel,
              isIdentified: spk.isIdentified,
              role: spk.role,
              department: spk.department,
              speakingDurationSec: spk.speakingDuration,
              speakingPercentage: spk.speakingPercentage,
              contributionCount: spk.contributionCount,
              topicsDiscussed: spk.topicsDiscussed,
              decisionsInfluenced: spk.decisionsInfluenced,
              actionsCreated: spk.actionsCreated,
              questionsAsked: spk.questionsAsked,
              questionsAnswered: spk.questionsAnswered,
              commitmentsMade: spk.commitmentsMade,
            },
          });
        }

        // Insert transcript segments
        if (result.transcriptSegments.length > 0) {
          await tx.transcriptSegment.createMany({
            data: result.transcriptSegments.map((s) => ({
              meetingId,
              speakerId: s.speakerId,
              speakerName: s.speakerName,
              startTime: s.startTime,
              endTime: s.endTime,
              text: s.text,
              confidence: s.confidence,
              language: s.language || result.language || 'en',
              topics: s.topics || [],
              isImportant: s.isImportant || false,
              importanceReason: s.importanceReason,
            })),
          });
        }

        // Update meeting status
        await tx.meeting.update({
          where: { id: meetingId },
          data: {
            status: 'COMPLETED',
            durationSeconds: result.durationSeconds || 6300,
            processedAt: new Date(),
          },
        });
      });
    }
  } catch (error) {
    console.warn('Prisma persistTranscriptionResult fallback to memory store:', error);
  }

  // Update in-memory runtime store
  runtimeTranscripts.set(meetingId, result.transcriptSegments);
  runtimeSpeakers.set(meetingId, result.speakers);

  const existingMem = runtimeMeetings.get(meetingId);
  if (existingMem) {
    runtimeMeetings.set(meetingId, {
      ...existingMem,
      status: 'COMPLETED',
      durationSeconds: result.durationSeconds || 6300,
      processedAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
