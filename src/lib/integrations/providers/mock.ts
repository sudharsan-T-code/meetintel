import { BaseIntegrationProvider } from './base';
import {
  IntegrationCapability,
  IntegrationConnectionStatus,
  IntegrationProviderType,
  ExternalMeetingEvent,
  SyncResult,
} from '../types';

export class MockIntegrationProvider extends BaseIntegrationProvider {
  readonly id: IntegrationProviderType;
  readonly name: string;
  readonly capabilities: IntegrationCapability[];
  readonly isMock = true;

  constructor(providerType: IntegrationProviderType = 'google_calendar') {
    super();
    this.id = providerType;
    this.name = this.getProviderDisplayName(providerType);
    this.capabilities = [
      'oauth',
      'calendar_sync',
      'list_meetings',
      'get_meeting',
      'get_participants',
      'get_recording',
      'get_transcript',
    ];
  }

  private getProviderDisplayName(type: IntegrationProviderType): string {
    switch (type) {
      case 'google_calendar':
        return 'Google Calendar (Demo Provider)';
      case 'microsoft_calendar':
        return 'Microsoft 365 Outlook (Demo Provider)';
      case 'zoom':
        return 'Zoom Video Communications (Demo Provider)';
      case 'google_meet':
        return 'Google Meet (Demo Provider)';
      case 'microsoft_teams':
        return 'Microsoft Teams (Demo Provider)';
      case 'slack':
        return 'Slack Enterprise (Demo Provider)';
      case 'jira':
        return 'Atlassian Jira (Demo Provider)';
      default:
        return 'Enterprise Integration (Demo Provider)';
    }
  }

  async connect(params?: { authCode?: string; redirectUri?: string; state?: string }): Promise<{
    success: boolean;
    authUrl?: string;
    accountEmail?: string;
    message?: string;
  }> {
    return {
      success: true,
      accountEmail: `enterprise-admin@meetintel-demo.internal`,
      message: `Successfully connected ${this.name} in deterministic Demo Mode.`,
    };
  }

  async disconnect(organizationId: string): Promise<{ success: boolean; message?: string }> {
    return {
      success: true,
      message: `Disconnected ${this.name} successfully.`,
    };
  }

  async getStatus(organizationId: string): Promise<IntegrationConnectionStatus> {
    return {
      provider: this.id,
      name: this.name,
      status: 'connected',
      isMock: true,
      lastSyncAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      syncStatus: 'SUCCESS',
      capabilities: this.capabilities,
      accountEmail: 'admin@meetintel-demo.internal',
    };
  }

  async syncCalendar(
    organizationId: string,
    options?: { startDate?: Date; endDate?: Date; forceIncremental?: boolean }
  ): Promise<SyncResult> {
    const mockEvents = this.generateMockEvents();
    return {
      success: true,
      provider: this.id,
      totalEventsFetched: mockEvents.length,
      importedMeetingsCount: mockEvents.length,
      updatedMeetingsCount: 0,
      skippedMeetingsCount: 0,
      events: mockEvents,
      syncedAt: new Date().toISOString(),
    };
  }

  async getMeetingDetails(externalId: string): Promise<ExternalMeetingEvent | null> {
    const events = this.generateMockEvents();
    return events.find((e) => e.externalId === externalId) || events[0] || null;
  }

  async getRecording(externalId: string): Promise<{ recordingUrl?: string; audioUrl?: string } | null> {
    return {
      recordingUrl: `https://storage.meetintel.internal/recordings/${this.id}/${externalId}.mp4`,
      audioUrl: `https://storage.meetintel.internal/audio/${this.id}/${externalId}.wav`,
    };
  }

  private generateMockEvents(): ExternalMeetingEvent[] {
    const now = Date.now();
    const prefix = this.id === 'microsoft_calendar' ? 'ms' : this.id === 'zoom' ? 'zoom' : 'gcal';

    return [
      {
        externalId: `${prefix}_evt_q3_arch_sync_001`,
        externalProvider: this.id,
        title: 'Q3 Enterprise Architecture & Cloud Migration Review',
        description: 'Bi-weekly architectural sync regarding AWS ECS to EKS migration, database sharding, and latency budgets.',
        startTime: new Date(now - 86400000 * 2).toISOString(),
        endTime: new Date(now - 86400000 * 2 + 3600000).toISOString(),
        durationMinutes: 60,
        organizer: {
          name: 'Rajesh Kumar',
          email: 'rajesh.kumar@meetintel-demo.internal',
        },
        attendees: [
          { name: 'Rajesh Kumar', email: 'rajesh.kumar@meetintel-demo.internal', responseStatus: 'accepted', isOrganizer: true },
          { name: 'Priya Sharma', email: 'priya.sharma@meetintel-demo.internal', responseStatus: 'accepted' },
          { name: 'Amit Patel', email: 'amit.patel@meetintel-demo.internal', responseStatus: 'accepted' },
          { name: 'Sunita Rao', email: 'sunita.rao@meetintel-demo.internal', responseStatus: 'accepted' },
        ],
        meetingLink: 'https://meet.google.com/xyz-arch-sync',
        platform: 'google_meet',
        recurring: { isRecurring: true, recurrencePattern: 'FREQ=WEEKLY;INTERVAL=2' },
        recordingUrl: 'https://storage.meetintel.internal/recordings/demo-arch-sync.mp4',
        hasRecording: true,
        transcriptAvailable: true,
      },
      {
        externalId: `${prefix}_evt_prod_sec_audit_002`,
        externalProvider: this.id,
        title: 'Security & Compliance Steering Committee — SOC2 / GDPR Readiness',
        description: 'Monthly executive security review on customer data encryption keys, audit retention, and RBAC privilege audit.',
        startTime: new Date(now - 86400000).toISOString(),
        endTime: new Date(now - 86400000 + 45 * 60000).toISOString(),
        durationMinutes: 45,
        organizer: {
          name: 'Priya Sharma',
          email: 'priya.sharma@meetintel-demo.internal',
        },
        attendees: [
          { name: 'Priya Sharma', email: 'priya.sharma@meetintel-demo.internal', responseStatus: 'accepted', isOrganizer: true },
          { name: 'Vikram Singh', email: 'vikram.singh@meetintel-demo.internal', responseStatus: 'accepted' },
          { name: 'Ananya Verma', email: 'ananya.verma@meetintel-demo.internal', responseStatus: 'accepted' },
        ],
        meetingLink: 'https://teams.microsoft.com/l/meetup-join/sec-audit-committee',
        platform: 'teams',
        recurring: { isRecurring: true, recurrencePattern: 'FREQ=MONTHLY;BYDAY=1MO' },
        recordingUrl: 'https://storage.meetintel.internal/recordings/demo-sec-audit.mp4',
        hasRecording: true,
        transcriptAvailable: true,
      },
      {
        externalId: `${prefix}_evt_weekly_eng_standup_003`,
        externalProvider: this.id,
        title: 'Sprint 24 Platform Engineering Standup & Blocker Resolution',
        description: 'Engineering weekly triage of CI/CD pipelines, flaky Cypress suites, and memory leak mitigation.',
        startTime: new Date(now - 3600000 * 4).toISOString(),
        endTime: new Date(now - 3600000 * 3.5).toISOString(),
        durationMinutes: 30,
        organizer: {
          name: 'Amit Patel',
          email: 'amit.patel@meetintel-demo.internal',
        },
        attendees: [
          { name: 'Amit Patel', email: 'amit.patel@meetintel-demo.internal', responseStatus: 'accepted', isOrganizer: true },
          { name: 'Kavita Nair', email: 'kavita.nair@meetintel-demo.internal', responseStatus: 'accepted' },
          { name: 'Rohan Gupta', email: 'rohan.gupta@meetintel-demo.internal', responseStatus: 'accepted' },
        ],
        meetingLink: 'https://zoom.us/j/9876543210',
        platform: 'zoom',
        recurring: { isRecurring: true, recurrencePattern: 'FREQ=WEEKLY;BYDAY=MO,WE,FR' },
        recordingUrl: 'https://storage.meetintel.internal/recordings/demo-eng-standup.mp4',
        hasRecording: true,
        transcriptAvailable: true,
      },
      {
        externalId: `${prefix}_evt_prod_strategy_upcoming_004`,
        externalProvider: this.id,
        title: 'FY27 Enterprise Roadmap & AI Productivity Strategy',
        description: 'Quarterly roadmap sync with Product, Design, and GTM leaders.',
        startTime: new Date(now + 86400000 * 2).toISOString(),
        endTime: new Date(now + 86400000 * 2 + 3600000).toISOString(),
        durationMinutes: 60,
        organizer: {
          name: 'Sunita Rao',
          email: 'sunita.rao@meetintel-demo.internal',
        },
        attendees: [
          { name: 'Sunita Rao', email: 'sunita.rao@meetintel-demo.internal', responseStatus: 'accepted', isOrganizer: true },
          { name: 'Rajesh Kumar', email: 'rajesh.kumar@meetintel-demo.internal', responseStatus: 'accepted' },
          { name: 'Vikram Singh', email: 'vikram.singh@meetintel-demo.internal', responseStatus: 'tentative' },
        ],
        meetingLink: 'https://meet.google.com/abc-roadmap-sync',
        platform: 'google_meet',
        recurring: { isRecurring: false },
        hasRecording: false,
        transcriptAvailable: false,
      },
    ];
  }
}
