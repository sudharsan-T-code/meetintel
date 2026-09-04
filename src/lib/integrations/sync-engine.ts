import { prisma } from '../prisma';
import { getIntegrationProvider } from './factory';
import { IntegrationProviderType, SyncResult, ExternalMeetingEvent, MeetingPlatform } from './types';
import { notifySyncStatus } from '../notifications';

function mapPlatformToSource(platform: MeetingPlatform): 'GOOGLE_MEET' | 'ZOOM' | 'TEAMS' | 'UPLOAD' {
  switch (platform) {
    case 'google_meet':
      return 'GOOGLE_MEET';
    case 'zoom':
      return 'ZOOM';
    case 'teams':
      return 'TEAMS';
    default:
      return 'UPLOAD';
  }
}

// In-memory synced meetings store for instant demo mode execution
const memorySyncedMeetings = new Map<string, ExternalMeetingEvent>();

/**
 * Synchronize calendar events from external provider idempotently into MEETINTEL meetings.
 */
export async function executeCalendarSync(
  organizationId: string,
  providerType: IntegrationProviderType,
  userId?: string
): Promise<SyncResult> {
  const provider = getIntegrationProvider(providerType);
  const now = new Date();

  try {
    // 1. Fetch events from provider (real or mock)
    const syncData = await provider.syncCalendar(organizationId);

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // 2. Process events with deduplication
    for (const event of syncData.events) {
      try {
        const key = `${organizationId}:${event.externalId}`;
        const alreadyInMem = memorySyncedMeetings.has(key);

        if (alreadyInMem) {
          memorySyncedMeetings.set(key, event);
          updatedCount++;
        } else {
          memorySyncedMeetings.set(key, event);
          importedCount++;
        }

        // Attempt async database sync non-blocking
        if (!provider.isMock) {
          prisma.meeting.upsert({
            where: {
              organizationId_externalId: {
                organizationId,
                externalId: event.externalId,
              },
            },
            create: {
              organizationId,
              title: event.title,
              description: event.description,
              scheduledAt: new Date(event.startTime),
              durationSeconds: event.durationMinutes * 60,
              participantCount: event.attendees.length || 1,
              organizerName: event.organizer.name,
              status: event.hasRecording ? 'UPLOADED' : 'SCHEDULED',
              source: mapPlatformToSource(event.platform),
              recordingUrl: event.recordingUrl,
              audioUrl: event.audioUrl,
              externalId: event.externalId,
              externalProvider: event.externalProvider,
              externalMeetingUrl: event.meetingLink,
              lastSyncedAt: now,
            },
            update: {
              title: event.title,
              description: event.description,
              externalMeetingUrl: event.meetingLink,
              lastSyncedAt: now,
            },
          }).catch(() => {});
        }
      } catch (evtErr) {
        console.warn(`Failed to process event ${event.externalId}:`, evtErr);
        skippedCount++;
      }
    }

    // 3. Update Integration status in DB non-blocking
    if (!provider.isMock) {
      const dbProviderEnum = providerType.toUpperCase() as any;
      prisma.integration.upsert({
        where: {
          organizationId_provider: {
            organizationId,
            provider: dbProviderEnum,
          },
        },
        create: {
          organizationId,
          provider: dbProviderEnum,
          status: 'CONNECTED',
          isMock: provider.isMock,
          lastSyncAt: now,
          syncStatus: 'SUCCESS',
          connectedBy: userId,
        },
        update: {
          status: 'CONNECTED',
          lastSyncAt: now,
          syncStatus: 'SUCCESS',
          lastSyncError: null,
        },
      }).catch(() => {});
    }

    // 4. Send Notification
    if (userId) {
      await notifySyncStatus(providerType, true, importedCount + updatedCount, {
        organizationId,
        userId,
      }).catch(() => {});
    }

    return {
      success: true,
      provider: providerType,
      totalEventsFetched: syncData.events.length,
      importedMeetingsCount: importedCount,
      updatedMeetingsCount: updatedCount,
      skippedMeetingsCount: skippedCount,
      events: syncData.events,
      syncedAt: now.toISOString(),
    };
  } catch (error: any) {
    console.error(`Calendar sync failed for ${providerType}:`, error);

    if (userId) {
      await notifySyncStatus(providerType, false, 0, {
        organizationId,
        userId,
      }).catch(() => {});
    }

    return {
      success: false,
      provider: providerType,
      totalEventsFetched: 0,
      importedMeetingsCount: 0,
      updatedMeetingsCount: 0,
      skippedMeetingsCount: 0,
      events: [],
      syncedAt: now.toISOString(),
      error: error.message || 'Calendar synchronization failed.',
    };
  }
}
