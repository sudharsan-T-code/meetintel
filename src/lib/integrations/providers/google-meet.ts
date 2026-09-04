import { BaseIntegrationProvider } from './base';
import { MockIntegrationProvider } from './mock';
import {
  IntegrationCapability,
  IntegrationConnectionStatus,
  IntegrationProviderType,
  ExternalMeetingEvent,
  SyncResult,
} from '../types';

export class GoogleMeetProvider extends BaseIntegrationProvider {
  readonly id: IntegrationProviderType = 'google_meet';
  readonly name = 'Google Meet';
  readonly capabilities: IntegrationCapability[] = [
    'list_meetings',
    'get_meeting',
    'get_participants',
    'get_recording',
    'get_transcript',
  ];

  private mockFallback: MockIntegrationProvider;
  readonly isMock: boolean;

  constructor() {
    super();
    this.isMock = !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET;
    this.mockFallback = new MockIntegrationProvider('google_meet');
  }

  async connect(params?: { authCode?: string; redirectUri?: string; state?: string }): Promise<{
    success: boolean;
    authUrl?: string;
    accountEmail?: string;
    message?: string;
  }> {
    return this.mockFallback.connect(params);
  }

  async disconnect(organizationId: string): Promise<{ success: boolean; message?: string }> {
    return { success: true, message: 'Google Meet disconnected successfully.' };
  }

  async getStatus(organizationId: string): Promise<IntegrationConnectionStatus> {
    return this.mockFallback.getStatus(organizationId);
  }

  async syncCalendar(
    organizationId: string,
    options?: { startDate?: Date; endDate?: Date; forceIncremental?: boolean }
  ): Promise<SyncResult> {
    return this.mockFallback.syncCalendar(organizationId, options);
  }

  async getMeetingDetails(externalId: string): Promise<ExternalMeetingEvent | null> {
    return this.mockFallback.getMeetingDetails(externalId);
  }

  async getRecording(externalId: string): Promise<{ recordingUrl?: string; audioUrl?: string } | null> {
    return this.mockFallback.getRecording(externalId);
  }
}
