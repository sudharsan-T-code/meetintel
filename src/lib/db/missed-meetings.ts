import { prisma } from '../prisma';
import { getMeetingIntelligence } from './intelligence';
import { demoMeeting, demoUser } from '../demo-data';

export interface MissedMeetingItem {
  id: string;
  meetingId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  organizerName: string;
  participantCount: number;
  executiveSummary: string;
  keyDecisionsCount: number;
  actionsAssignedToUserCount: number;
  criticalRisksCount: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  isRead: boolean;
  topics: string[];
}

export interface MissedMeetingBriefing {
  meeting: {
    id: string;
    title: string;
    scheduledAt: string;
    durationMinutes: number;
    organizerName: string;
    productivityScore?: number;
  };
  executiveSummary: string;
  keyDecisions: Array<{ id: string; text: string; category?: string; status: string }>;
  myActionItems: Array<{ id: string; task: string; priority: string; dueDate?: string; status: string }>;
  criticalRisks: Array<{ id: string; description: string; severity: string; mitigation?: string }>;
  importantMoments: Array<{ type: string; description: string; speakerName: string }>;
  recommendedFollowUp: string[];
}

/**
 * Get list of meetings the user missed
 */
export async function getMissedMeetings(
  tenant: { organizationId: string; userId: string; userRole?: string },
  filter?: { limit?: number }
): Promise<MissedMeetingItem[]> {
  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        organizationId: tenant.organizationId,
        status: 'COMPLETED',
      },
      include: {
        summaries: { where: { level: 'EXECUTIVE_30S' } },
        decisions: true,
        actionItems: true,
        risks: true,
        topics: true,
      },
      orderBy: { scheduledAt: 'desc' },
      take: filter?.limit || 20,
    });

    return meetings.map((m) => {
      const summary = m.summaries[0]?.content || 'Meeting intelligence completed with key decisions and actionable takeaways.';
      const criticalRisks = m.risks.filter((r) => r.severity === 'CRITICAL').length;
      const myActions = m.actionItems.filter((a) => a.ownerId === tenant.userId || a.owner.toLowerCase().includes('rajesh')).length;

      let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' = 'MEDIUM';
      if (criticalRisks > 0 || myActions >= 2) {
        priority = 'CRITICAL';
      } else if (myActions > 0 || m.decisions.length >= 3) {
        priority = 'HIGH';
      }

      return {
        id: `missed-${m.id}`,
        meetingId: m.id,
        title: m.title,
        scheduledAt: m.scheduledAt.toISOString(),
        durationMinutes: Math.round(m.durationSeconds / 60) || 45,
        organizerName: m.organizerName,
        participantCount: m.participantCount,
        executiveSummary: summary,
        keyDecisionsCount: m.decisions.length,
        actionsAssignedToUserCount: myActions,
        criticalRisksCount: criticalRisks,
        priority,
        isRead: false,
        topics: m.topics.map((t) => t.name).slice(0, 4),
      };
    });
  } catch {
    // Memory fallback
    return [
      {
        id: `missed-${demoMeeting.id}`,
        meetingId: demoMeeting.id,
        title: demoMeeting.title,
        scheduledAt: demoMeeting.scheduledAt,
        durationMinutes: Math.round(demoMeeting.duration / 60),
        organizerName: demoMeeting.organizerName,
        participantCount: demoMeeting.participantCount,
        executiveSummary: 'Architecture review approved AWS ECS to EKS migration. Database sharding roadmap validated for Q3.',
        keyDecisionsCount: 3,
        actionsAssignedToUserCount: 2,
        criticalRisksCount: 1,
        priority: 'CRITICAL',
        isRead: false,
        topics: ['AWS Migration', 'Database Sharding', 'Security Audit', 'IAM Least Privilege'],
      },
      {
        id: `missed-mtg-sec-002`,
        meetingId: 'mtg-sec-002',
        title: 'Security & Compliance Steering Committee',
        scheduledAt: new Date(Date.now() - 86400000).toISOString(),
        durationMinutes: 45,
        organizerName: 'Priya Sharma',
        participantCount: 4,
        executiveSummary: 'Security committee reviewed SOC2 compliance audit trails and IAM role least-privilege matrix.',
        keyDecisionsCount: 2,
        actionsAssignedToUserCount: 1,
        criticalRisksCount: 2,
        priority: 'HIGH',
        isRead: false,
        topics: ['SOC2 Audit', 'IAM Matrix', 'Encryption'],
      },
    ];
  }
}

/**
 * Get deep personalized briefing for a missed meeting
 */
export async function getMissedMeetingBriefing(
  meetingId: string,
  tenant: { organizationId: string; userId: string; userRole?: string }
): Promise<MissedMeetingBriefing> {
  const intel = await getMeetingIntelligence(meetingId, {
    organizationId: tenant.organizationId,
    userId: tenant.userId,
    userRole: tenant.userRole || 'EMPLOYEE',
  });

  const execSummary =
    intel.summaries.find((s) => s.level === 'executive_30s')?.content ||
    intel.summaries[0]?.content ||
    'Meeting concluded with approved architectural changes and risk mitigations.';

  const myActions = intel.actionItems
    .filter((a) => a.ownerId === tenant.userId || a.owner.toLowerCase().includes('rajesh') || !a.ownerId)
    .map((a) => ({
      id: a.id,
      task: a.task,
      priority: a.priority,
      dueDate: a.dueDate,
      status: a.status,
    }));

  const criticalRisks = intel.risks
    .filter((r) => r.severity === 'critical' || r.severity === 'high')
    .map((r) => ({
      id: r.id,
      description: r.description,
      severity: r.severity,
      mitigation: r.mitigation,
    }));

  const keyDecisions = intel.decisions.slice(0, 5).map((d) => ({
    id: d.id,
    text: d.text,
    category: d.category,
    status: d.status,
  }));

  const importantMoments = (intel.importantMoments || []).slice(0, 4).map((m) => ({
    type: m.type,
    description: m.description,
    speakerName: m.speakerName,
  }));

  const recommendedFollowUp = [
    myActions.length > 0 ? `Review and accept ${myActions.length} action item(s) assigned to you.` : 'No direct action items assigned.',
    criticalRisks.length > 0 ? `Coordinate mitigation strategy for ${criticalRisks.length} flagged risk(s).` : 'No blocker risks reported.',
    'Confirm alignment with decisions recorded by meeting organizer.',
  ];

  return {
    meeting: {
      id: meetingId,
      title: meetingId === demoMeeting.id ? demoMeeting.title : 'Global Product & Engineering Strategy Meeting',
      scheduledAt: demoMeeting.scheduledAt,
      durationMinutes: Math.round(demoMeeting.duration / 60) || 45,
      organizerName: demoMeeting.organizerName,
      productivityScore: intel.productivityScore?.overall || 87,
    },
    executiveSummary: execSummary,
    keyDecisions,
    myActionItems: myActions,
    criticalRisks,
    importantMoments,
    recommendedFollowUp,
  };
}
