// ============================================================
// MEETINTEL - Enterprise Integration Architecture Types
// ============================================================

export type IntegrationProviderType =
  | 'google_calendar'
  | 'microsoft_calendar'
  | 'zoom'
  | 'google_meet'
  | 'microsoft_teams'
  | 'slack'
  | 'jira';

export type IntegrationCapability =
  | 'oauth'
  | 'calendar_sync'
  | 'list_meetings'
  | 'get_meeting'
  | 'get_participants'
  | 'get_recording'
  | 'get_transcript'
  | 'create_event'
  | 'update_event'
  | 'delete_event';

export type MeetingPlatform = 'google_meet' | 'teams' | 'zoom' | 'webex' | 'in_person';

export interface ExternalAttendee {
  name: string;
  email: string;
  responseStatus?: 'accepted' | 'tentative' | 'declined' | 'needsAction';
  avatarUrl?: string;
  isOrganizer?: boolean;
}

export interface ExternalMeetingEvent {
  externalId: string;
  externalProvider: IntegrationProviderType;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  durationMinutes: number;
  organizer: {
    name: string;
    email: string;
  };
  attendees: ExternalAttendee[];
  meetingLink?: string;
  platform: MeetingPlatform;
  recurring?: {
    isRecurring: boolean;
    recurrencePattern?: string;
  };
  recordingUrl?: string;
  audioUrl?: string;
  hasRecording?: boolean;
  transcriptAvailable?: boolean;
}

export interface SyncResult {
  success: boolean;
  provider: IntegrationProviderType;
  totalEventsFetched: number;
  importedMeetingsCount: number;
  updatedMeetingsCount: number;
  skippedMeetingsCount: number;
  events: ExternalMeetingEvent[];
  syncedAt: string;
  error?: string;
}

export interface IntegrationConnectionStatus {
  provider: IntegrationProviderType;
  name: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  isMock: boolean;
  lastSyncAt?: string | null;
  syncStatus?: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  capabilities: IntegrationCapability[];
  accountEmail?: string;
  errorMessage?: string;
}

export interface IntegrationProviderConfig {
  organizationId: string;
  isMock?: boolean;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface IIntegrationProvider {
  readonly id: IntegrationProviderType;
  readonly name: string;
  readonly capabilities: IntegrationCapability[];
  readonly isMock: boolean;

  connect(params?: { authCode?: string; redirectUri?: string; state?: string }): Promise<{
    success: boolean;
    authUrl?: string;
    accountEmail?: string;
    message?: string;
  }>;

  disconnect(organizationId: string): Promise<{ success: boolean; message?: string }>;

  getStatus(organizationId: string): Promise<IntegrationConnectionStatus>;

  syncCalendar(
    organizationId: string,
    options?: { startDate?: Date; endDate?: Date; forceIncremental?: boolean }
  ): Promise<SyncResult>;

  getMeetingDetails(externalId: string): Promise<ExternalMeetingEvent | null>;

  getRecording(externalId: string): Promise<{ recordingUrl?: string; audioUrl?: string } | null>;
}
