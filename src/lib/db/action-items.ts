import { prisma } from '../prisma';
import { ActionItem, ActionStatus, ActionPriority } from '@/types';
import { demoActions, demoMeeting } from '../demo-data';

export interface ActionItemFilter {
  status?: ActionStatus | 'all';
  priority?: ActionPriority | 'all';
  assignee?: string;
  meetingId?: string;
  overdueOnly?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ActionItemWithMeeting extends ActionItem {
  meetingTitle?: string;
  meetingScheduledAt?: string;
}

// In-memory fallback action items
let memoryActionItems: ActionItemWithMeeting[] = demoActions.map((ai) => ({
  ...ai,
  meetingTitle: ai.meetingId === demoMeeting.id ? demoMeeting.title : 'Enterprise Architecture Review',
  meetingScheduledAt: ai.meetingId === demoMeeting.id ? demoMeeting.scheduledAt : new Date().toISOString(),
}));

/**
 * Retrieve filtered action items across tenant
 */
export async function getActionItems(
  tenant: { organizationId: string; userId: string; userRole?: string },
  filter: ActionItemFilter = {}
): Promise<{ items: ActionItemWithMeeting[]; total: number; metrics: { open: number; inProgress: number; completed: number; overdue: number } }> {
  try {
    const where: any = {
      meeting: { organizationId: tenant.organizationId },
    };

    if (filter.status && filter.status !== 'all') {
      where.status = filter.status.toUpperCase();
    }
    if (filter.priority && filter.priority !== 'all') {
      where.priority = filter.priority.toUpperCase();
    }
    if (filter.assignee) {
      where.owner = { contains: filter.assignee, mode: 'insensitive' };
    }
    if (filter.meetingId) {
      where.meetingId = filter.meetingId;
    }
    if (filter.search) {
      where.task = { contains: filter.search, mode: 'insensitive' };
    }
    if (filter.overdueOnly) {
      where.dueDate = { lt: new Date() };
      where.status = { notIn: ['COMPLETED', 'CANCELLED'] };
    }

    const [dbItems, total] = await Promise.all([
      prisma.actionItem.findMany({
        where,
        include: {
          meeting: {
            select: { id: true, title: true, scheduledAt: true },
          },
        },
        orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
        take: filter.limit || 100,
        skip: filter.offset || 0,
      }),
      prisma.actionItem.count({ where }),
    ]);

    const mapped: ActionItemWithMeeting[] = dbItems.map((item) => ({
      id: item.id,
      meetingId: item.meetingId,
      task: item.task,
      owner: item.owner,
      ownerId: item.ownerId || undefined,
      dueDate: item.dueDate?.toISOString(),
      priority: item.priority.toLowerCase() as ActionPriority,
      status: item.status.toLowerCase() as ActionStatus,
      sourceSpeaker: item.sourceSpeaker,
      sourceSpeakerId: item.sourceSpeakerId || '',
      timestamp: item.timestamp,
      confidence: item.confidence.toLowerCase() as any,
      confidenceScore: item.confidenceScore,
      requiresConfirmation: item.requiresConfirmation,
      confirmationNote: item.confirmationNote || undefined,
      meetingTitle: item.meeting?.title,
      meetingScheduledAt: item.meeting?.scheduledAt?.toISOString(),
    }));

    // Calculate metrics
    const metrics = {
      open: mapped.filter((i) => i.status === 'open').length,
      inProgress: mapped.filter((i) => i.status === 'in_progress').length,
      completed: mapped.filter((i) => i.status === 'completed').length,
      overdue: mapped.filter(
        (i) => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'completed' && i.status !== 'cancelled'
      ).length,
    };

    return { items: mapped, total, metrics };
  } catch {
    // Return memory fallback
    let list = [...memoryActionItems];

    if (filter.status && filter.status !== 'all') {
      list = list.filter((i) => i.status === filter.status);
    }
    if (filter.priority && filter.priority !== 'all') {
      list = list.filter((i) => i.priority === filter.priority);
    }
    if (filter.assignee) {
      list = list.filter((i) => i.owner.toLowerCase().includes(filter.assignee!.toLowerCase()));
    }
    if (filter.meetingId) {
      list = list.filter((i) => i.meetingId === filter.meetingId);
    }
    if (filter.search) {
      list = list.filter((i) => i.task.toLowerCase().includes(filter.search!.toLowerCase()));
    }
    if (filter.overdueOnly) {
      list = list.filter(
        (i) => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'completed' && i.status !== 'cancelled'
      );
    }

    const metrics = {
      open: memoryActionItems.filter((i) => i.status === 'open').length,
      inProgress: memoryActionItems.filter((i) => i.status === 'in_progress').length,
      completed: memoryActionItems.filter((i) => i.status === 'completed').length,
      overdue: memoryActionItems.filter(
        (i) => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'completed' && i.status !== 'cancelled'
      ).length,
    };

    return {
      items: list.slice(filter.offset || 0, (filter.offset || 0) + (filter.limit || 100)),
      total: list.length,
      metrics,
    };
  }
}

/**
 * Update an action item status, priority, or assignee
 */
export async function updateActionItemInDb(
  actionId: string,
  updates: {
    status?: ActionStatus;
    priority?: ActionPriority;
    dueDate?: string | null;
    owner?: string;
    ownerId?: string | null;
  },
  tenant: { organizationId: string; userId: string }
): Promise<ActionItemWithMeeting> {
  const now = new Date();

  try {
    const dataToUpdate: any = {};
    if (updates.status) dataToUpdate.status = updates.status.toUpperCase();
    if (updates.priority) dataToUpdate.priority = updates.priority.toUpperCase();
    if (updates.dueDate !== undefined) dataToUpdate.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    if (updates.owner) dataToUpdate.owner = updates.owner;
    if (updates.ownerId !== undefined) dataToUpdate.ownerId = updates.ownerId;

    const updated = await prisma.actionItem.update({
      where: { id: actionId },
      data: dataToUpdate,
      include: {
        meeting: { select: { id: true, title: true, scheduledAt: true } },
      },
    });

    return {
      id: updated.id,
      meetingId: updated.meetingId,
      task: updated.task,
      owner: updated.owner,
      ownerId: updated.ownerId || undefined,
      dueDate: updated.dueDate?.toISOString(),
      priority: updated.priority.toLowerCase() as ActionPriority,
      status: updated.status.toLowerCase() as ActionStatus,
      sourceSpeaker: updated.sourceSpeaker,
      sourceSpeakerId: updated.sourceSpeakerId || '',
      timestamp: updated.timestamp,
      confidence: updated.confidence.toLowerCase() as any,
      confidenceScore: updated.confidenceScore,
      requiresConfirmation: updated.requiresConfirmation,
      confirmationNote: updated.confirmationNote || undefined,
      meetingTitle: updated.meeting?.title,
      meetingScheduledAt: updated.meeting?.scheduledAt?.toISOString(),
    };
  } catch {
    const item = memoryActionItems.find((i) => i.id === actionId);
    if (!item) {
      throw new Error(`Action item ${actionId} not found.`);
    }

    if (updates.status) item.status = updates.status;
    if (updates.priority) item.priority = updates.priority;
    if (updates.dueDate !== undefined) item.dueDate = updates.dueDate || undefined;
    if (updates.owner) item.owner = updates.owner;

    return item;
  }
}
