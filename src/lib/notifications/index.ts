import { prisma } from '../prisma';
import { demoUser } from '../demo-data';

export interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  meetingId?: string;
  link?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  meetingId?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

// In-memory fallback for demo mode
let fallbackNotifications: NotificationItem[] = [
  {
    id: 'notif-demo-1',
    userId: demoUser.id,
    type: 'action_assigned',
    title: 'New Action Item Assigned',
    message: 'You have been assigned: "Implement AWS API Gateway rate limiter" from Architecture Review.',
    meetingId: 'mtg-demo-001',
    link: '/action-items',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'notif-demo-2',
    userId: demoUser.id,
    type: 'risk_detected',
    title: 'Critical Risk Flagged',
    message: 'Security risk detected: "Database migration lock contention during peak traffic hours".',
    meetingId: 'mtg-demo-001',
    link: '/meetings/mtg-demo-001',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'notif-demo-3',
    userId: demoUser.id,
    type: 'meeting_ready',
    title: 'Meeting Intelligence Ready',
    message: 'AI analysis and executive summaries completed for "Security & Compliance Steering Committee".',
    meetingId: 'mtg-demo-002',
    link: '/meetings/mtg-demo-002',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

/**
 * Create a new notification with deduplication
 */
export async function createNotification(
  userId: string,
  payload: NotificationPayload
): Promise<NotificationItem> {
  const now = new Date();

  try {
    // Check if an identical unread notification was created in the last 10 minutes
    const recentDuplicate = await prisma.notification.findFirst({
      where: {
        userId,
        type: payload.type,
        title: payload.title,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
      },
    });

    if (recentDuplicate) {
      return {
        id: recentDuplicate.id,
        userId: recentDuplicate.userId,
        type: recentDuplicate.type,
        title: recentDuplicate.title,
        message: recentDuplicate.message,
        meetingId: recentDuplicate.meetingId,
        link: recentDuplicate.link,
        isRead: recentDuplicate.isRead,
        createdAt: recentDuplicate.createdAt.toISOString(),
      };
    }

    const created = await prisma.notification.create({
      data: {
        userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        meetingId: payload.meetingId,
        link: payload.link,
        isRead: false,
      },
    });

    return {
      id: created.id,
      userId: created.userId,
      type: created.type,
      title: created.title,
      message: created.message,
      meetingId: created.meetingId,
      link: created.link,
      isRead: created.isRead,
      createdAt: created.createdAt.toISOString(),
    };
  } catch {
    // In-memory fallback
    const item: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      meetingId: payload.meetingId || null,
      link: payload.link || null,
      isRead: false,
      createdAt: now.toISOString(),
    };
    fallbackNotifications.unshift(item);
    return item;
  }
}

/**
 * Notify user about assigned action item
 */
export async function notifyActionAssigned(
  actionItem: { id: string; task: string; ownerId?: string; meetingId?: string },
  tenant: { organizationId: string; userId: string }
) {
  const targetUserId = actionItem.ownerId || tenant.userId;
  return createNotification(targetUserId, {
    type: 'action_assigned',
    title: 'Action Item Assigned',
    message: `You were assigned: "${actionItem.task.substring(0, 80)}"`,
    meetingId: actionItem.meetingId,
    link: '/action-items',
  });
}

/**
 * Notify about critical risk detected in a meeting
 */
export async function notifyRiskDetected(
  risk: { description: string; severity: string; meetingId?: string },
  meeting: { id: string; title: string },
  tenant: { organizationId: string; userId: string }
) {
  return createNotification(tenant.userId, {
    type: 'risk_detected',
    title: `Critical Risk Detected (${risk.severity.toUpperCase()})`,
    message: `Risk flagged in "${meeting.title}": "${risk.description.substring(0, 90)}"`,
    meetingId: meeting.id,
    link: `/meetings/${meeting.id}`,
  });
}

/**
 * Notify when meeting intelligence processing completes
 */
export async function notifyMeetingReady(
  meeting: { id: string; title: string },
  tenant: { organizationId: string; userId: string }
) {
  return createNotification(tenant.userId, {
    type: 'meeting_ready',
    title: 'Meeting Intelligence Ready',
    message: `AI analysis, summaries, and action extraction ready for "${meeting.title}".`,
    meetingId: meeting.id,
    link: `/meetings/${meeting.id}`,
  });
}

/**
 * Notify about calendar sync status
 */
export async function notifySyncStatus(
  provider: string,
  success: boolean,
  count: number,
  tenant: { organizationId: string; userId: string }
) {
  const providerName = provider.replace('_', ' ').toUpperCase();
  return createNotification(tenant.userId, {
    type: success ? 'sync_success' : 'sync_failure',
    title: success ? `${providerName} Sync Completed` : `${providerName} Sync Failed`,
    message: success
      ? `Successfully synchronized ${count} calendar events from ${providerName}.`
      : `Failed to synchronize calendar events from ${providerName}. Please check settings.`,
    link: '/settings/integrations',
  });
}

/**
 * Get all notifications for user
 */
export async function getUserNotifications(
  userId: string,
  filter?: { unreadOnly?: boolean; limit?: number }
): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
  try {
    const where: any = { userId };
    if (filter?.unreadOnly) {
      where.isRead = false;
    }

    const items = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filter?.limit || 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return {
      notifications: items.map((n) => ({
        id: n.id,
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        meetingId: n.meetingId,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    };
  } catch {
    let list = fallbackNotifications.filter((n) => n.userId === userId || userId === demoUser.id);
    if (filter?.unreadOnly) {
      list = list.filter((n) => !n.isRead);
    }
    const unreadCount = list.filter((n) => !n.isRead).length;
    return {
      notifications: list.slice(0, filter?.limit || 50),
      unreadCount,
    };
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(notificationId: string, userId: string): Promise<boolean> {
  try {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
    return true;
  } catch {
    const found = fallbackNotifications.find((n) => n.id === notificationId);
    if (found) {
      found.isRead = true;
    }
    return true;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return true;
  } catch {
    fallbackNotifications.forEach((n) => {
      if (n.userId === userId || userId === demoUser.id) {
        n.isRead = true;
      }
    });
    return true;
  }
}
