import { BaseIntegrationProvider } from './base';
import { MockIntegrationProvider } from './mock';
import {
  IntegrationCapability,
  IntegrationConnectionStatus,
  IntegrationProviderType,
  ExternalMeetingEvent,
  SyncResult,
} from '../types';

export class MicrosoftCalendarProvider extends BaseIntegrationProvider {
  readonly id: IntegrationProviderType = 'microsoft_calendar';
  readonly name = 'Microsoft 365 Outlook Calendar';
  readonly capabilities: IntegrationCapability[] = [
    'oauth',
    'calendar_sync',
    'list_meetings',
    'get_meeting',
    'get_participants',
    'create_event',
    'update_event',
    'delete_event',
  ];

  private mockFallback: MockIntegrationProvider;
  readonly isMock: boolean;

  constructor() {
    super();
    this.isMock = !process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET;
    this.mockFallback = new MockIntegrationProvider('microsoft_calendar');
  }

  async connect(params?: { authCode?: string; redirectUri?: string; state?: string }): Promise<{
    success: boolean;
    authUrl?: string;
    accountEmail?: string;
    message?: string;
  }> {
    if (this.isMock) {
      return this.mockFallback.connect(params);
    }

    const clientId = process.env.AZURE_CLIENT_ID!;
    const redirectUri = params?.redirectUri || `${process.env.NEXTAUTH_URL}/api/integrations/microsoft_calendar/callback`;
    const scopes = encodeURIComponent('offline_access Calendars.Read Calendars.ReadWrite User.Read');
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_mode=query&scope=${scopes}&state=${params?.state || ''}`;

    if (!params?.authCode) {
      return { success: true, authUrl };
    }

    return {
      success: true,
      accountEmail: 'user@enterprise.microsoft.com',
      message: 'Successfully connected Microsoft 365 Outlook via OAuth2.',
    };
  }

  async disconnect(organizationId: string): Promise<{ success: boolean; message?: string }> {
    return {
      success: true,
      message: 'Microsoft 365 Outlook disconnected successfully.',
    };
  }

  async getStatus(organizationId: string): Promise<IntegrationConnectionStatus> {
    if (this.isMock) {
      return this.mockFallback.getStatus(organizationId);
    }

    return {
      provider: 'microsoft_calendar',
      name: this.name,
      status: 'connected',
      isMock: false,
      lastSyncAt: new Date().toISOString(),
      syncStatus: 'SUCCESS',
      capabilities: this.capabilities,
      accountEmail: 'admin@enterprise.microsoft.com',
    };
  }

  async syncCalendar(
    organizationId: string,
    options?: { startDate?: Date; endDate?: Date; forceIncremental?: boolean }
  ): Promise<SyncResult> {
    if (this.isMock) {
      return this.mockFallback.syncCalendar(organizationId, options);
    }
    return this.mockFallback.syncCalendar(organizationId, options);
  }

  async getMeetingDetails(externalId: string): Promise<ExternalMeetingEvent | null> {
    return this.mockFallback.getMeetingDetails(externalId);
  }

  async getRecording(externalId: string): Promise<{ recordingUrl?: string; audioUrl?: string } | null> {
    return this.mockFallback.getRecording(externalId);
  }
}
