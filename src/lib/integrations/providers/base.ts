import crypto from 'crypto';
import {
  IIntegrationProvider,
  IntegrationCapability,
  IntegrationConnectionStatus,
  IntegrationProviderType,
  ExternalMeetingEvent,
  SyncResult,
} from '../types';

export abstract class BaseIntegrationProvider implements IIntegrationProvider {
  abstract readonly id: IntegrationProviderType;
  abstract readonly name: string;
  abstract readonly capabilities: IntegrationCapability[];
  abstract readonly isMock: boolean;

  /**
   * Check if this provider has a specific capability
   */
  hasCapability(capability: IntegrationCapability): boolean {
    return this.capabilities.includes(capability);
  }

  /**
   * Generate secure CSRF OAuth state parameter
   */
  protected generateOAuthState(organizationId: string, userId?: string): string {
    const payload = JSON.stringify({
      org: organizationId,
      user: userId,
      nonce: crypto.randomBytes(16).toString('hex'),
      ts: Date.now(),
    });
    return Buffer.from(payload).toString('base64url');
  }

  /**
   * Verify and parse OAuth state
   */
  protected parseOAuthState(state: string): { org: string; user?: string; ts: number } | null {
    try {
      const decoded = Buffer.from(state, 'base64url').toString('utf8');
      const parsed = JSON.parse(decoded);
      // State valid for 15 minutes
      if (Date.now() - parsed.ts > 15 * 60 * 1000) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  abstract connect(params?: { authCode?: string; redirectUri?: string; state?: string }): Promise<{
    success: boolean;
    authUrl?: string;
    accountEmail?: string;
    message?: string;
  }>;

  abstract disconnect(organizationId: string): Promise<{ success: boolean; message?: string }>;

  abstract getStatus(organizationId: string): Promise<IntegrationConnectionStatus>;

  abstract syncCalendar(
    organizationId: string,
    options?: { startDate?: Date; endDate?: Date; forceIncremental?: boolean }
  ): Promise<SyncResult>;

  abstract getMeetingDetails(externalId: string): Promise<ExternalMeetingEvent | null>;

  abstract getRecording(externalId: string): Promise<{ recordingUrl?: string; audioUrl?: string } | null>;
}
