import { IntegrationProviderType, IIntegrationProvider } from './types';
import { GoogleCalendarProvider } from './providers/google-calendar';
import { MicrosoftCalendarProvider } from './providers/microsoft-calendar';
import { ZoomIntegrationProvider } from './providers/zoom';
import { GoogleMeetProvider } from './providers/google-meet';
import { MicrosoftTeamsProvider } from './providers/microsoft-teams';
import { MockIntegrationProvider } from './providers/mock';

/**
 * Returns the appropriate provider instance for a given IntegrationProviderType.
 */
export function getIntegrationProvider(providerType: IntegrationProviderType): IIntegrationProvider {
  switch (providerType) {
    case 'google_calendar':
      return new GoogleCalendarProvider();
    case 'microsoft_calendar':
      return new MicrosoftCalendarProvider();
    case 'zoom':
      return new ZoomIntegrationProvider();
    case 'google_meet':
      return new GoogleMeetProvider();
    case 'microsoft_teams':
      return new MicrosoftTeamsProvider();
    case 'slack':
    case 'jira':
    default:
      return new MockIntegrationProvider(providerType);
  }
}
