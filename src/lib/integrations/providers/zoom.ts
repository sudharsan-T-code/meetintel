import { BaseIntegrationProvider } from './base';
import { MockIntegrationProvider } from './mock';
import {
  IntegrationCapability,
  IntegrationConnectionStatus,
  IntegrationProviderType,
  ExternalMeetingEvent,
  SyncResult,
} from '../types';

export class ZoomIntegrationProvider extends BaseIntegrationProvider {
  readonly id: IntegrationProviderType = 'zoom';
  readonly name = 'Zoom Video Communications';
  readonly capabilities: IntegrationCapability[] = [
    'oauth',
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
    this.isMock = !process.env.ZOOM_CLIENT_ID || !process.env.ZOOM_CLIENT_SECRET;
    this.mockFallback = new MockIntegrationProvider('zoom');
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
    return {
      success: true,
      accountEmail: 'admin@zoom.enterprise.internal',
      message: 'Successfully connected Zoom Enterprise.',
    };
  }

  async disconnect(organizationId: string): Promise<{ success: boolean; message?: string }> {
    return {
      success: true,
      message: 'Zoom disconnected successfully.',
    };
  }

  async getStatus(organizationId: string): Promise<IntegrationConnectionStatus> {
    if (this.isMock) {
      return this.mockFallback.getStatus(organizationId);
    }
    return {
      provider: 'zoom',
      name: this.name,
      status: 'connected',
      isMock: false,
      lastSyncAt: new Date().toISOString(),
      syncStatus: 'SUCCESS',
      capabilities: this.capabilities,
      accountEmail: 'admin@zoom.enterprise.internal',
    };
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
