import { prisma } from '../prisma';
import { Commitment, CommitmentStatus } from '@/types';
import { demoCommitments, demoMeeting } from '../demo-data';

export interface CommitmentFilter {
  status?: CommitmentStatus | 'all';
  committedBy?: string;
  meetingId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CommitmentWithMeeting extends Commitment {
  meetingTitle?: string;
  meetingScheduledAt?: string;
}

// In-memory fallback commitments
let memoryCommitments: CommitmentWithMeeting[] = demoCommitments.map((c, i) => ({
  ...c,
  status: (i === 0 ? 'in_progress' : i === 1 ? 'completed' : 'pending') as CommitmentStatus,
  meetingTitle: c.meetingId === demoMeeting.id ? demoMeeting.title : 'Enterprise Architecture Review',
  meetingScheduledAt: c.meetingId === demoMeeting.id ? demoMeeting.scheduledAt : new Date().toISOString(),
}));

/**
 * Get filtered commitments
 */
export async function getCommitments(
  tenant: { organizationId: string; userId: string },
  filter: CommitmentFilter = {}
): Promise<{
  items: CommitmentWithMeeting[];
  total: number;
  health: { total: number; pending: number; inProgress: number; completed: number; overdue: number; completionRate: number };
}> {
  try {
    const where: any = {
      meeting: { organizationId: tenant.organizationId },
    };

    if (filter.status && filter.status !== 'all') {
      where.status = filter.status.toUpperCase();
    }
    if (filter.committedBy) {
      where.committedBy = { contains: filter.committedBy, mode: 'insensitive' };
    }
    if (filter.meetingId) {
      where.meetingId = filter.meetingId;
    }
    if (filter.search) {
      where.text = { contains: filter.search, mode: 'insensitive' };
    }

    const [dbItems, total] = await Promise.all([
      prisma.commitment.findMany({
        where,
        include: {
          meeting: { select: { id: true, title: true, scheduledAt: true } },
        },
        orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
        take: filter.limit || 100,
        skip: filter.offset || 0,
      }),
      prisma.commitment.count({ where }),
    ]);

    const mapped: CommitmentWithMeeting[] = dbItems.map((c) => ({
      id: c.id,
      meetingId: c.meetingId,
      text: c.text,
      committedBy: c.committedBy,
      committedById: c.committedById || '',
      timestamp: c.timestamp,
      deadline: c.deadline?.toISOString(),
      confidence: c.confidence.toLowerCase() as any,
      status: (c.status?.toLowerCase() || 'pending') as CommitmentStatus,
      meetingTitle: c.meeting?.title,
      meetingScheduledAt: c.meeting?.scheduledAt?.toISOString(),
    }));

    const allMapped = mapped;
    const completedCount = allMapped.filter((c) => c.status === 'completed').length;
    const totalCount = allMapped.length || 1;

    const health = {
      total: allMapped.length,
      pending: allMapped.filter((c) => c.status === 'pending').length,
      inProgress: allMapped.filter((c) => c.status === 'in_progress').length,
      completed: completedCount,
      overdue: allMapped.filter((c) => c.status === 'overdue' || (c.deadline && new Date(c.deadline) < new Date() && c.status !== 'completed')).length,
      completionRate: Math.round((completedCount / totalCount) * 100),
    };

    return { items: mapped, total, health };
  } catch {
    let list = [...memoryCommitments];

    if (filter.status && filter.status !== 'all') {
      list = list.filter((c) => c.status === filter.status);
    }
    if (filter.committedBy) {
      list = list.filter((c) => c.committedBy.toLowerCase().includes(filter.committedBy!.toLowerCase()));
    }
    if (filter.meetingId) {
      list = list.filter((c) => c.meetingId === filter.meetingId);
    }
    if (filter.search) {
      list = list.filter((c) => c.text.toLowerCase().includes(filter.search!.toLowerCase()));
    }

    const completed = memoryCommitments.filter((c) => c.status === 'completed').length;
    const health = {
      total: memoryCommitments.length,
      pending: memoryCommitments.filter((c) => c.status === 'pending').length,
      inProgress: memoryCommitments.filter((c) => c.status === 'in_progress').length,
      completed,
      overdue: memoryCommitments.filter((c) => c.status === 'overdue').length,
      completionRate: Math.round((completed / (memoryCommitments.length || 1)) * 100),
    };

    return {
      items: list.slice(filter.offset || 0, (filter.offset || 0) + (filter.limit || 100)),
      total: list.length,
      health,
    };
  }
}

/**
 * Update commitment status or deadline
 */
export async function updateCommitmentInDb(
  commitmentId: string,
  updates: { status?: CommitmentStatus; deadline?: string | null },
  tenant: { organizationId: string; userId: string }
): Promise<CommitmentWithMeeting> {
  try {
    const dataToUpdate: any = {};
    if (updates.status) dataToUpdate.status = updates.status.toUpperCase();
    if (updates.deadline !== undefined) dataToUpdate.deadline = updates.deadline ? new Date(updates.deadline) : null;

    const updated = await prisma.commitment.update({
      where: { id: commitmentId },
      data: dataToUpdate,
      include: {
        meeting: { select: { id: true, title: true, scheduledAt: true } },
      },
    });

    return {
      id: updated.id,
      meetingId: updated.meetingId,
      text: updated.text,
      committedBy: updated.committedBy,
      committedById: updated.committedById || '',
      timestamp: updated.timestamp,
      deadline: updated.deadline?.toISOString(),
      confidence: updated.confidence.toLowerCase() as any,
      status: (updated.status?.toLowerCase() || 'pending') as CommitmentStatus,
      meetingTitle: updated.meeting?.title,
      meetingScheduledAt: updated.meeting?.scheduledAt?.toISOString(),
    };
  } catch {
    const item = memoryCommitments.find((c) => c.id === commitmentId);
    if (!item) {
      throw new Error(`Commitment ${commitmentId} not found.`);
    }

    if (updates.status) item.status = updates.status;
    if (updates.deadline !== undefined) item.deadline = updates.deadline || undefined;

    return item;
  }
}
