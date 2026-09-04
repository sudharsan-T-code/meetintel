import 'server-only';
import { prisma } from '@/lib/prisma';
import type { TenantContext } from '@/lib/db/tenant';
import { assertTenantAccess } from '@/lib/db/tenant';
import type {
  MeetingSummary,
  Topic,
  Decision,
  ActionItem,
  Risk,
  MeetingQuestion,
  Commitment,
  ImportantMoment,
  ProductivityScore,
  ChatMessage,
  ChatSource,
  DecisionStatus,
  ActionPriority,
  ActionStatus,
  RiskSeverity,
  ConfidenceLevel,
} from '@/types';
import {
  demoSummaries,
  demoTopics,
  demoDecisions,
  demoActions,
  demoRisks,
  demoQuestions,
  demoCommitments,
  demoImportantMoments,
  demoMeeting,
  demoProductivityScore,
} from '@/lib/demo-data';
import type { UpdateDecisionInput, UpdateActionItemInput, CreateActionItemInput, UpdateRiskInput } from '@/lib/validations/intelligence';

// In-memory runtime stores for demo mode / offline resilient operation
const runtimeSummaries = new Map<string, MeetingSummary[]>();
const runtimeTopics = new Map<string, Topic[]>();
const runtimeDecisions = new Map<string, Decision[]>();
const runtimeActions = new Map<string, ActionItem[]>();
const runtimeRisks = new Map<string, Risk[]>();
const runtimeQuestions = new Map<string, MeetingQuestion[]>();
const runtimeCommitments = new Map<string, Commitment[]>();
const runtimeImportantMoments = new Map<string, ImportantMoment[]>();
const runtimeChatMessages = new Map<string, ChatMessage[]>();
const runtimeProductivityScores = new Map<string, ProductivityScore>();

// Initialize default demo meeting intelligence
runtimeSummaries.set(demoMeeting.id, [...demoSummaries]);
runtimeTopics.set(demoMeeting.id, [...demoTopics]);
runtimeDecisions.set(demoMeeting.id, [...demoDecisions]);
runtimeActions.set(demoMeeting.id, [...demoActions]);
runtimeRisks.set(demoMeeting.id, [...demoRisks]);
runtimeQuestions.set(demoMeeting.id, [...demoQuestions]);
runtimeCommitments.set(demoMeeting.id, [...demoCommitments]);
runtimeImportantMoments.set(demoMeeting.id, [...demoImportantMoments]);
runtimeProductivityScores.set(demoMeeting.id, { ...demoProductivityScore });
runtimeChatMessages.set(demoMeeting.id, [
  {
    id: 'msg-demo-1',
    meetingId: demoMeeting.id,
    role: 'user',
    content: 'What were the critical cloud architecture decisions finalized in this meeting?',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'fact',
  },
  {
    id: 'msg-demo-2',
    meetingId: demoMeeting.id,
    role: 'assistant',
    content: 'The team approved the **AWS Migration** for the legacy authentication service using a gateway-first approach, set **Project Phoenix launch** milestones (Oct 10 web, Oct 15 full), and mandated zero tolerance on the 12 critical security vulnerabilities before migration kickoff.',
    timestamp: new Date(Date.now() - 3500000).toISOString(),
    type: 'fact',
    sources: [
      {
        segmentId: 'seg-15',
        speakerName: 'Rajesh Kumar',
        timestamp: 625,
        text: 'We approve the AWS migration for the authentication service with a gateway-first approach.',
        confidence: 'high',
      },
      {
        segmentId: 'seg-34',
        speakerName: 'Rajesh Kumar',
        timestamp: 3085,
        text: 'Web-only on Oct 10, full launch Oct 15. That gives us 5 days buffer.',
        confidence: 'high',
      },
    ],
  },
]);

/**
 * Normalizes string enum values to Prisma & TypeScript types
 */
function normalizeConfidence(val: unknown): ConfidenceLevel {
  const s = String(val || '').toLowerCase();
  if (s === 'high') return 'high';
  if (s === 'medium') return 'medium';
  if (s === 'low') return 'low';
  return 'high';
}

function normalizeDecisionStatus(val: unknown): DecisionStatus {
  const s = String(val || '').toLowerCase();
  if (s === 'approved') return 'approved';
  if (s === 'pending') return 'pending';
  if (s === 'rejected') return 'rejected';
  if (s === 'revisited') return 'revisited';
  if (s === 'superseded') return 'superseded';
  return 'approved';
}

function normalizeActionPriority(val: unknown): ActionPriority {
  const s = String(val || '').toLowerCase();
  if (s === 'critical') return 'critical';
  if (s === 'high') return 'high';
  if (s === 'low') return 'low';
  return 'medium';
}

function normalizeActionStatus(val: unknown): ActionStatus {
  const s = String(val || '').toLowerCase();
  if (s === 'in_progress' || s === 'in progress') return 'in_progress';
  if (s === 'completed') return 'completed';
  if (s === 'overdue') return 'overdue';
  if (s === 'cancelled') return 'cancelled';
  return 'open';
}

function normalizeRiskSeverity(val: unknown): RiskSeverity {
  const s = String(val || '').toLowerCase();
  if (s === 'critical') return 'critical';
  if (s === 'high') return 'high';
  if (s === 'low') return 'low';
  return 'medium';
}

/**
 * Retrieves the full intelligence bundle for a meeting.
 */
export async function getMeetingIntelligence(meetingId: string, tenant: TenantContext) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        summaries: true,
        topics: true,
        decisions: { orderBy: { decisionNumber: 'asc' } },
        actionItems: { orderBy: { priority: 'asc' } },
        risks: { orderBy: { severity: 'asc' } },
        questions: { orderBy: { timestamp: 'asc' } },
        commitments: { orderBy: { timestamp: 'asc' } },
        importantMoments: { orderBy: { timestamp: 'asc' } },
      },
    });

    if (meeting) {
      assertTenantAccess(tenant.organizationId, meeting.organizationId);

      const productivityScore = meeting.productivityMetrics as unknown as ProductivityScore | null;

      return {
        meetingId,
        summaries: meeting.summaries.map((s) => ({
          id: s.id,
          meetingId: s.meetingId,
          level: s.level.toLowerCase() as MeetingSummary['level'],
          content: s.content,
          generatedAt: s.generatedAt.toISOString(),
          keyPoints: s.keyPoints || [],
        })),
        topics: meeting.topics.map((t) => ({
          id: t.id,
          meetingId: t.meetingId,
          name: t.name,
          duration: t.durationSec,
          startTime: t.startTime,
          endTime: t.endTime,
          speakerIds: t.speakerIds,
          speakerNames: t.speakerNames,
          summary: t.summary,
          decisions: [],
          actions: [],
          risks: [],
          segmentIds: [],
        })),
        decisions: meeting.decisions.map((d) => ({
          id: d.id,
          meetingId: d.meetingId,
          decisionNumber: d.decisionNumber,
          text: d.text,
          timestamp: d.timestamp,
          speakerId: d.speakerId || '',
          speakerName: d.speakerName,
          participants: d.participants,
          confidence: normalizeConfidence(d.confidence),
          confidenceScore: d.confidenceScore,
          status: normalizeDecisionStatus(d.status),
          supportingTranscript: d.supportingTranscript,
          topicId: d.topicId || undefined,
          category: d.category || undefined,
        })),
        actionItems: meeting.actionItems.map((a) => ({
          id: a.id,
          meetingId: a.meetingId,
          task: a.task,
          owner: a.owner,
          ownerId: a.ownerId || undefined,
          dueDate: a.dueDate ? a.dueDate.toISOString() : undefined,
          priority: normalizeActionPriority(a.priority),
          status: normalizeActionStatus(a.status),
          sourceSpeaker: a.sourceSpeaker,
          sourceSpeakerId: a.sourceSpeakerId || '',
          timestamp: a.timestamp,
          confidence: normalizeConfidence(a.confidence),
          confidenceScore: a.confidenceScore,
          requiresConfirmation: a.requiresConfirmation,
          confirmationNote: a.confirmationNote || undefined,
          topicId: a.topicId || undefined,
        })),
        risks: meeting.risks.map((r) => ({
          id: r.id,
          meetingId: r.meetingId,
          description: r.description,
          severity: normalizeRiskSeverity(r.severity),
          timestamp: r.timestamp,
          speakerId: r.speakerId || '',
          speakerName: r.speakerName,
          mitigation: r.mitigation || undefined,
          status: (r.status.toLowerCase() as Risk['status']) || 'identified',
          confidence: normalizeConfidence(r.confidence),
          topicId: r.topicId || undefined,
        })),
        questions: meeting.questions.map((q) => ({
          id: q.id,
          meetingId: q.meetingId,
          question: q.question,
          askedBy: q.askedBy,
          askedById: q.askedById || '',
          timestamp: q.timestamp,
          isResolved: q.isResolved,
          answer: q.answer || undefined,
          answeredBy: q.answeredBy || undefined,
          answeredAt: q.answeredAt || undefined,
        })),
        commitments: meeting.commitments.map((c) => ({
          id: c.id,
          meetingId: c.meetingId,
          text: c.text,
          committedBy: c.committedBy,
          committedById: c.committedById || '',
          timestamp: c.timestamp,
          deadline: c.deadline ? c.deadline.toISOString() : undefined,
          confidence: normalizeConfidence(c.confidence),
        })),
        importantMoments: meeting.importantMoments.map((m) => ({
          id: m.id,
          meetingId: m.meetingId,
          type: m.type as ImportantMoment['type'],
          timestamp: m.timestamp,
          description: m.description,
          speakerName: m.speakerName,
          speakerId: m.speakerId || '',
          confidence: normalizeConfidence(m.confidence),
          details: m.details || undefined,
        })),
        productivityScore: productivityScore || runtimeProductivityScores.get(meetingId) || demoProductivityScore,
      };
    }
  } catch (error) {
    console.warn('Prisma getMeetingIntelligence fallback to memory store:', error);
  }

  // Fallback to runtime memory
  return {
    meetingId,
    summaries: runtimeSummaries.get(meetingId) || runtimeSummaries.get(demoMeeting.id) || demoSummaries,
    topics: runtimeTopics.get(meetingId) || runtimeTopics.get(demoMeeting.id) || demoTopics,
    decisions: runtimeDecisions.get(meetingId) || runtimeDecisions.get(demoMeeting.id) || demoDecisions,
    actionItems: runtimeActions.get(meetingId) || runtimeActions.get(demoMeeting.id) || demoActions,
    risks: runtimeRisks.get(meetingId) || runtimeRisks.get(demoMeeting.id) || demoRisks,
    questions: runtimeQuestions.get(meetingId) || runtimeQuestions.get(demoMeeting.id) || demoQuestions,
    commitments: runtimeCommitments.get(meetingId) || runtimeCommitments.get(demoMeeting.id) || demoCommitments,
    importantMoments: runtimeImportantMoments.get(meetingId) || runtimeImportantMoments.get(demoMeeting.id) || demoImportantMoments,
    productivityScore: runtimeProductivityScores.get(meetingId) || runtimeProductivityScores.get(demoMeeting.id) || demoProductivityScore,
  };
}

/**
 * Persists or updates structured AI intelligence for a meeting in an idempotent transaction.
 */
export async function persistMeetingIntelligence(
  meetingId: string,
  data: {
    summaries?: { level: string; content: string; keyPoints: string[] }[];
    topics?: Omit<Topic, 'id' | 'meetingId'>[];
    decisions: Omit<Decision, 'id' | 'meetingId'>[];
    actionItems: Omit<ActionItem, 'id' | 'meetingId'>[];
    risks: Omit<Risk, 'id' | 'meetingId'>[];
    questions: Omit<MeetingQuestion, 'id' | 'meetingId'>[];
    commitments: Omit<Commitment, 'id' | 'meetingId'>[];
    importantMoments: Omit<ImportantMoment, 'id' | 'meetingId'>[];
    productivityScore: ProductivityScore;
  },
  tenant: TenantContext
) {
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (meeting) {
      assertTenantAccess(tenant.organizationId, meeting.organizationId);

      await prisma.$transaction(async (tx) => {
        // Safe replacement to prevent duplicate intelligence records
        await tx.decision.deleteMany({ where: { meetingId } });
        await tx.actionItem.deleteMany({ where: { meetingId } });
        await tx.risk.deleteMany({ where: { meetingId } });
        await tx.meetingQuestion.deleteMany({ where: { meetingId } });
        await tx.commitment.deleteMany({ where: { meetingId } });
        await tx.importantMoment.deleteMany({ where: { meetingId } });

        // Insert Decisions
        for (let i = 0; i < data.decisions.length; i++) {
          const d = data.decisions[i];
          await tx.decision.create({
            data: {
              meetingId,
              decisionNumber: d.decisionNumber || i + 1,
              text: d.text,
              timestamp: d.timestamp || 0,
              speakerId: d.speakerId || null,
              speakerName: d.speakerName || 'Participant',
              participants: d.participants || [],
              confidence: (String(d.confidence).toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW') || 'HIGH',
              confidenceScore: d.confidenceScore || 90,
              status: (String(d.status).toUpperCase() as 'APPROVED' | 'PENDING' | 'REJECTED' | 'REVISITED' | 'SUPERSEDED') || 'APPROVED',
              supportingTranscript: d.supportingTranscript || '',
              category: d.category || null,
            },
          });
        }

        // Insert Action Items
        for (const a of data.actionItems) {
          await tx.actionItem.create({
            data: {
              meetingId,
              task: a.task,
              owner: a.owner || 'Unassigned',
              ownerId: a.ownerId || null,
              dueDate: a.dueDate ? new Date(a.dueDate) : null,
              priority: (String(a.priority).toUpperCase() as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') || 'MEDIUM',
              status: (String(a.status).toUpperCase() as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED') || 'OPEN',
              sourceSpeaker: a.sourceSpeaker || 'Speaker',
              sourceSpeakerId: a.sourceSpeakerId || null,
              timestamp: a.timestamp || 0,
              confidence: (String(a.confidence).toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW') || 'HIGH',
              confidenceScore: a.confidenceScore || 90,
              requiresConfirmation: a.requiresConfirmation || false,
              confirmationNote: a.confirmationNote || null,
            },
          });
        }

        // Insert Risks
        for (const r of data.risks) {
          await tx.risk.create({
            data: {
              meetingId,
              description: r.description,
              severity: (String(r.severity).toUpperCase() as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') || 'MEDIUM',
              status: (String(r.status).toUpperCase() as 'IDENTIFIED' | 'MITIGATING' | 'RESOLVED' | 'ACCEPTED') || 'IDENTIFIED',
              timestamp: r.timestamp || 0,
              speakerId: r.speakerId || null,
              speakerName: r.speakerName || 'Speaker',
              mitigation: r.mitigation || null,
              confidence: (String(r.confidence).toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW') || 'HIGH',
            },
          });
        }

        // Insert Questions
        for (const q of data.questions) {
          await tx.meetingQuestion.create({
            data: {
              meetingId,
              question: q.question,
              askedBy: q.askedBy || 'Participant',
              askedById: q.askedById || null,
              timestamp: q.timestamp || 0,
              isResolved: q.isResolved || false,
              answer: q.answer || null,
              answeredBy: q.answeredBy || null,
              answeredAt: q.answeredAt || null,
            },
          });
        }

        // Insert Commitments
        for (const c of data.commitments) {
          await tx.commitment.create({
            data: {
              meetingId,
              text: c.text,
              committedBy: c.committedBy || 'Participant',
              committedById: c.committedById || null,
              timestamp: c.timestamp || 0,
              deadline: c.deadline ? new Date(c.deadline) : null,
              confidence: (String(c.confidence).toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW') || 'HIGH',
            },
          });
        }

        // Insert Important Moments
        for (const m of data.importantMoments) {
          await tx.importantMoment.create({
            data: {
              meetingId,
              type: m.type || 'decision',
              timestamp: m.timestamp || 0,
              description: m.description,
              speakerName: m.speakerName || 'Participant',
              speakerId: m.speakerId || null,
              confidence: (String(m.confidence).toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW') || 'HIGH',
              details: m.details || null,
            },
          });
        }

        // Upsert Summaries if provided
        if (data.summaries && data.summaries.length > 0) {
          for (const s of data.summaries) {
            const levelEnum = s.level.toUpperCase() as 'EXECUTIVE_30S' | 'TWO_MINUTE' | 'DETAILED' | 'TOPIC_BY_TOPIC' | 'MISSED_MEETING';
            await tx.meetingSummary.upsert({
              where: {
                meetingId_level: {
                  meetingId,
                  level: levelEnum,
                },
              },
              create: {
                meetingId,
                level: levelEnum,
                content: s.content,
                keyPoints: s.keyPoints || [],
              },
              update: {
                content: s.content,
                keyPoints: s.keyPoints || [],
                updatedAt: new Date(),
              },
            });
          }
        }

        // Update Meeting Productivity Metrics
        await tx.meeting.update({
          where: { id: meetingId },
          data: {
            productivityMetrics: data.productivityScore as unknown as object,
            status: 'COMPLETED',
          },
        });
      });
    }
  } catch (error) {
    console.warn('Prisma persistMeetingIntelligence fallback to memory store:', error);
  }

  // Update in-memory fallback store
  if (data.summaries) {
    runtimeSummaries.set(
      meetingId,
      data.summaries.map((s, idx) => ({
        id: `sum-${meetingId}-${idx}`,
        meetingId,
        level: s.level.toLowerCase() as MeetingSummary['level'],
        content: s.content,
        generatedAt: new Date().toISOString(),
        keyPoints: s.keyPoints || [],
      }))
    );
  }

  runtimeDecisions.set(
    meetingId,
    data.decisions.map((d, i) => ({
      id: `dec-${meetingId}-${i + 1}`,
      meetingId,
      decisionNumber: d.decisionNumber || i + 1,
      text: d.text,
      timestamp: d.timestamp,
      speakerId: d.speakerId || '',
      speakerName: d.speakerName,
      participants: d.participants || [],
      confidence: normalizeConfidence(d.confidence),
      confidenceScore: d.confidenceScore || 90,
      status: normalizeDecisionStatus(d.status),
      supportingTranscript: d.supportingTranscript || '',
      category: d.category || undefined,
    }))
  );

  runtimeActions.set(
    meetingId,
    data.actionItems.map((a, i) => ({
      id: `act-${meetingId}-${i + 1}`,
      meetingId,
      task: a.task,
      owner: a.owner || 'Unassigned',
      ownerId: a.ownerId || undefined,
      dueDate: a.dueDate,
      priority: normalizeActionPriority(a.priority),
      status: normalizeActionStatus(a.status),
      sourceSpeaker: a.sourceSpeaker || 'Speaker',
      sourceSpeakerId: a.sourceSpeakerId || '',
      timestamp: a.timestamp || 0,
      confidence: normalizeConfidence(a.confidence),
      confidenceScore: a.confidenceScore || 90,
      requiresConfirmation: a.requiresConfirmation || false,
      confirmationNote: a.confirmationNote || undefined,
    }))
  );

  runtimeRisks.set(
    meetingId,
    data.risks.map((r, i) => ({
      id: `risk-${meetingId}-${i + 1}`,
      meetingId,
      description: r.description,
      severity: normalizeRiskSeverity(r.severity),
      timestamp: r.timestamp || 0,
      speakerId: r.speakerId || '',
      speakerName: r.speakerName || 'Speaker',
      mitigation: r.mitigation || undefined,
      status: (String(r.status).toLowerCase() as Risk['status']) || 'identified',
      confidence: normalizeConfidence(r.confidence),
    }))
  );

  runtimeQuestions.set(
    meetingId,
    data.questions.map((q, i) => ({
      id: `q-${meetingId}-${i + 1}`,
      meetingId,
      question: q.question,
      askedBy: q.askedBy || 'Participant',
      askedById: q.askedById || '',
      timestamp: q.timestamp || 0,
      isResolved: q.isResolved || false,
      answer: q.answer || undefined,
      answeredBy: q.answeredBy || undefined,
      answeredAt: q.answeredAt || undefined,
    }))
  );

  runtimeCommitments.set(
    meetingId,
    data.commitments.map((c, i) => ({
      id: `com-${meetingId}-${i + 1}`,
      meetingId,
      text: c.text,
      committedBy: c.committedBy || 'Participant',
      committedById: c.committedById || '',
      timestamp: c.timestamp || 0,
      deadline: c.deadline,
      confidence: normalizeConfidence(c.confidence),
      status: ((c as any).status?.toLowerCase() || 'pending') as any,
    }))
  );

  runtimeImportantMoments.set(
    meetingId,
    data.importantMoments.map((m, i) => ({
      id: `mom-${meetingId}-${i + 1}`,
      meetingId,
      type: m.type as ImportantMoment['type'],
      timestamp: m.timestamp || 0,
      description: m.description,
      speakerName: m.speakerName || 'Participant',
      speakerId: m.speakerId || '',
      confidence: normalizeConfidence(m.confidence),
      details: m.details || undefined,
    }))
  );

  runtimeProductivityScores.set(meetingId, data.productivityScore);
}

/**
 * Persists an individual summary level.
 */
export async function persistSummary(
  meetingId: string,
  level: string,
  content: string,
  keyPoints: string[],
  tenant: TenantContext
) {
  const levelEnum = level.toUpperCase().replace('-', '_') as 'EXECUTIVE_30S' | 'TWO_MINUTE' | 'DETAILED' | 'TOPIC_BY_TOPIC' | 'MISSED_MEETING';

  try {
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (meeting) {
      assertTenantAccess(tenant.organizationId, meeting.organizationId);

      const summary = await prisma.meetingSummary.upsert({
        where: {
          meetingId_level: {
            meetingId,
            level: levelEnum,
          },
        },
        create: {
          meetingId,
          level: levelEnum,
          content,
          keyPoints,
        },
        update: {
          content,
          keyPoints,
          updatedAt: new Date(),
        },
      });

      return {
        id: summary.id,
        meetingId: summary.meetingId,
        level: summary.level.toLowerCase() as MeetingSummary['level'],
        content: summary.content,
        generatedAt: summary.generatedAt.toISOString(),
        keyPoints: summary.keyPoints,
      };
    }
  } catch (error) {
    console.warn('Prisma persistSummary fallback to memory store:', error);
  }

  // Memory fallback
  const existingList = runtimeSummaries.get(meetingId) || [...demoSummaries];
  const targetLevel = level.toLowerCase() as MeetingSummary['level'];
  const filtered = existingList.filter((s) => s.level !== targetLevel);
  const newSummary: MeetingSummary = {
    id: `sum-${meetingId}-${targetLevel}`,
    meetingId,
    level: targetLevel,
    content,
    generatedAt: new Date().toISOString(),
    keyPoints,
  };
  runtimeSummaries.set(meetingId, [...filtered, newSummary]);
  return newSummary;
}

/**
 * Updates a decision's status or details.
 */
export async function updateDecisionInDb(
  decisionId: string,
  data: UpdateDecisionInput,
  tenant: TenantContext
) {
  try {
    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: { meeting: true },
    });

    if (decision) {
      assertTenantAccess(tenant.organizationId, decision.meeting.organizationId);

      const updated = await prisma.decision.update({
        where: { id: decisionId },
        data: {
          status: data.status ? (data.status.toUpperCase() as 'APPROVED' | 'PENDING' | 'REJECTED' | 'REVISITED' | 'SUPERSEDED') : undefined,
          category: data.category !== undefined ? data.category : undefined,
          text: data.text !== undefined ? data.text : undefined,
        },
      });

      return {
        ...updated,
        confidence: normalizeConfidence(updated.confidence),
        status: normalizeDecisionStatus(updated.status),
      };
    }
  } catch (error) {
    console.warn('Prisma updateDecision fallback to memory store:', error);
  }

  // Search runtime decisions
  for (const [meetingId, decisions] of runtimeDecisions.entries()) {
    const idx = decisions.findIndex(
      (d) =>
        d.id === decisionId ||
        d.id === `dec-${decisionId}` ||
        `dec-${d.decisionNumber}` === decisionId ||
        `dec-00${d.decisionNumber}` === decisionId ||
        decisionId.endsWith(String(d.decisionNumber))
    );
    if (idx !== -1) {
      const existing = decisions[idx];
      const updated: Decision = {
        ...existing,
        status: data.status ? normalizeDecisionStatus(data.status) : existing.status,
        category: data.category !== undefined ? data.category : existing.category,
        text: data.text !== undefined ? data.text : existing.text,
      };
      decisions[idx] = updated;
      runtimeDecisions.set(meetingId, [...decisions]);
      return updated;
    }
  }

  throw new Error(`DecisionNotFound: Decision with ID "${decisionId}" not found.`);
}

/**
 * Updates an action item's status, priority, owner, or due date.
 */
export async function updateActionItemInDb(
  actionId: string,
  data: UpdateActionItemInput,
  tenant: TenantContext
) {
  try {
    const action = await prisma.actionItem.findUnique({
      where: { id: actionId },
      include: { meeting: true },
    });

    if (action) {
      assertTenantAccess(tenant.organizationId, action.meeting.organizationId);

      const updated = await prisma.actionItem.update({
        where: { id: actionId },
        data: {
          status: data.status ? (data.status.toUpperCase() as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED') : undefined,
          priority: data.priority ? (data.priority.toUpperCase() as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') : undefined,
          owner: data.owner !== undefined ? data.owner : undefined,
          ownerId: data.ownerId !== undefined ? data.ownerId : undefined,
          dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
          requiresConfirmation: data.requiresConfirmation !== undefined ? data.requiresConfirmation : undefined,
          confirmationNote: data.confirmationNote !== undefined ? data.confirmationNote : undefined,
        },
      });

      return {
        ...updated,
        priority: normalizeActionPriority(updated.priority),
        status: normalizeActionStatus(updated.status),
        confidence: normalizeConfidence(updated.confidence),
        dueDate: updated.dueDate ? updated.dueDate.toISOString() : undefined,
      };
    }
  } catch (error) {
    console.warn('Prisma updateActionItem fallback to memory store:', error);
  }

  // Memory fallback
  for (const [meetingId, actions] of runtimeActions.entries()) {
    const idx = actions.findIndex(
      (a, i) =>
        a.id === actionId ||
        a.id === `act-${actionId}` ||
        `act-${i + 1}` === actionId ||
        `act-00${i + 1}` === actionId ||
        actionId.endsWith(String(i + 1))
    );
    if (idx !== -1) {
      const existing = actions[idx];
      const updated: ActionItem = {
        ...existing,
        status: data.status ? normalizeActionStatus(data.status) : existing.status,
        priority: data.priority ? normalizeActionPriority(data.priority) : existing.priority,
        owner: data.owner !== undefined ? data.owner : existing.owner,
        ownerId: data.ownerId !== undefined ? data.ownerId : existing.ownerId,
        dueDate: data.dueDate !== undefined ? (data.dueDate || undefined) : existing.dueDate,
        requiresConfirmation: data.requiresConfirmation !== undefined ? data.requiresConfirmation : existing.requiresConfirmation,
        confirmationNote: data.confirmationNote !== undefined ? data.confirmationNote : existing.confirmationNote,
      };
      actions[idx] = updated;
      runtimeActions.set(meetingId, [...actions]);
      return updated;
    }
  }

  throw new Error(`ActionItemNotFound: Action item with ID "${actionId}" not found.`);
}

/**
 * Creates a new action item manually.
 */
export async function createActionItemInDb(data: CreateActionItemInput, tenant: TenantContext) {
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id: data.meetingId } });
    if (meeting) {
      assertTenantAccess(tenant.organizationId, meeting.organizationId);

      const created = await prisma.actionItem.create({
        data: {
          meetingId: data.meetingId,
          task: data.task,
          owner: data.owner,
          ownerId: data.ownerId || null,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          priority: data.priority.toUpperCase() as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
          status: data.status.toUpperCase() as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED',
          sourceSpeaker: data.sourceSpeaker || 'Manual',
          timestamp: data.timestamp || 0,
          confidence: 'HIGH',
          confidenceScore: 100,
        },
      });

      return {
        ...created,
        priority: normalizeActionPriority(created.priority),
        status: normalizeActionStatus(created.status),
        confidence: 'high' as ConfidenceLevel,
        dueDate: created.dueDate ? created.dueDate.toISOString() : undefined,
      };
    }
  } catch (error) {
    console.warn('Prisma createActionItem fallback to memory store:', error);
  }

  const newAction: ActionItem = {
    id: `act-${Date.now()}`,
    meetingId: data.meetingId,
    task: data.task,
    owner: data.owner,
    ownerId: data.ownerId,
    dueDate: data.dueDate,
    priority: normalizeActionPriority(data.priority),
    status: normalizeActionStatus(data.status),
    sourceSpeaker: data.sourceSpeaker || 'Manual',
    sourceSpeakerId: '',
    timestamp: data.timestamp || 0,
    confidence: 'high',
    confidenceScore: 100,
    requiresConfirmation: false,
  };

  const existing = runtimeActions.get(data.meetingId) || [...demoActions];
  runtimeActions.set(data.meetingId, [newAction, ...existing]);
  return newAction;
}

/**
 * Updates a risk status or mitigation.
 */
export async function updateRiskInDb(
  riskId: string,
  data: UpdateRiskInput,
  tenant: TenantContext
) {
  try {
    const risk = await prisma.risk.findUnique({
      where: { id: riskId },
      include: { meeting: true },
    });

    if (risk) {
      assertTenantAccess(tenant.organizationId, risk.meeting.organizationId);

      const updated = await prisma.risk.update({
        where: { id: riskId },
        data: {
          status: data.status ? (data.status.toUpperCase() as 'IDENTIFIED' | 'MITIGATING' | 'RESOLVED' | 'ACCEPTED') : undefined,
          severity: data.severity ? (data.severity.toUpperCase() as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') : undefined,
          mitigation: data.mitigation !== undefined ? data.mitigation : undefined,
        },
      });

      return {
        ...updated,
        severity: normalizeRiskSeverity(updated.severity),
        confidence: normalizeConfidence(updated.confidence),
        status: updated.status.toLowerCase() as Risk['status'],
      };
    }
  } catch (error) {
    console.warn('Prisma updateRisk fallback to memory store:', error);
  }

  for (const [meetingId, risks] of runtimeRisks.entries()) {
    const idx = risks.findIndex(
      (r, i) =>
        r.id === riskId ||
        r.id === `risk-${riskId}` ||
        `risk-${i + 1}` === riskId ||
        `risk-00${i + 1}` === riskId ||
        riskId.endsWith(String(i + 1))
    );
    if (idx !== -1) {
      const existing = risks[idx];
      const updated: Risk = {
        ...existing,
        status: data.status ? (data.status.toLowerCase() as Risk['status']) : existing.status,
        severity: data.severity ? normalizeRiskSeverity(data.severity) : existing.severity,
        mitigation: data.mitigation !== undefined ? data.mitigation : existing.mitigation,
      };
      risks[idx] = updated;
      runtimeRisks.set(meetingId, [...risks]);
      return updated;
    }
  }

  throw new Error(`RiskNotFound: Risk with ID "${riskId}" not found.`);
}

/**
 * Retrieves chat history for a meeting.
 */
export async function getMeetingChatMessages(meetingId: string, tenant: TenantContext) {
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (meeting) {
      assertTenantAccess(tenant.organizationId, meeting.organizationId);

      const messages = await prisma.chatMessage.findMany({
        where: { meetingId },
        orderBy: { createdAt: 'asc' },
      });

      if (messages.length > 0) {
        return messages.map((m) => ({
          id: m.id,
          meetingId: m.meetingId,
          role: m.role.toLowerCase() as 'user' | 'assistant',
          content: m.content,
          timestamp: m.createdAt.toISOString(),
          type: (m.messageType as ChatMessage['type']) || 'fact',
          sources: (m.sources as unknown as ChatSource[]) || undefined,
        }));
      }
    }
  } catch (error) {
    console.warn('Prisma getMeetingChatMessages fallback to memory store:', error);
  }

  return runtimeChatMessages.get(meetingId) || runtimeChatMessages.get(demoMeeting.id) || [];
}

/**
 * Persists a user or assistant chat message with grounded source citations.
 */
export async function persistChatMessage(
  meetingId: string,
  message: {
    role: 'user' | 'assistant';
    content: string;
    messageType?: string;
    sources?: ChatSource[];
  },
  tenant: TenantContext
) {
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (meeting) {
      assertTenantAccess(tenant.organizationId, meeting.organizationId);

      const created = await prisma.chatMessage.create({
        data: {
          meetingId,
          userId: message.role === 'user' ? tenant.userId : null,
          role: message.role.toUpperCase() as 'USER' | 'ASSISTANT',
          content: message.content,
          messageType: message.messageType || 'fact',
          sources: (message.sources as unknown as object) || null,
        },
      });

      const formatted: ChatMessage = {
        id: created.id,
        meetingId: created.meetingId,
        role: created.role.toLowerCase() as 'user' | 'assistant',
        content: created.content,
        timestamp: created.createdAt.toISOString(),
        type: (created.messageType as ChatMessage['type']) || 'fact',
        sources: (created.sources as unknown as ChatSource[]) || undefined,
      };

      const currentList = runtimeChatMessages.get(meetingId) || [];
      runtimeChatMessages.set(meetingId, [...currentList, formatted]);
      return formatted;
    }
  } catch (error) {
    console.warn('Prisma persistChatMessage fallback to memory store:', error);
  }

  const formatted: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    meetingId,
    role: message.role,
    content: message.content,
    timestamp: new Date().toISOString(),
    type: (message.messageType as ChatMessage['type']) || 'fact',
    sources: message.sources,
  };

  const currentList = runtimeChatMessages.get(meetingId) || [];
  runtimeChatMessages.set(meetingId, [...currentList, formatted]);
  return formatted;
}

/**
 * Clears the chat conversation history for a meeting.
 */
export async function clearMeetingChat(meetingId: string, tenant: TenantContext) {
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (meeting) {
      assertTenantAccess(tenant.organizationId, meeting.organizationId);
      await prisma.chatMessage.deleteMany({ where: { meetingId } });
    }
  } catch (error) {
    console.warn('Prisma clearMeetingChat fallback to memory store:', error);
  }

  runtimeChatMessages.set(meetingId, []);
  return { success: true };
}
