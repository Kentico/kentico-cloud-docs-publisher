import { EventGridClient, EventGridModels } from 'azure-eventgrid';
import * as getUuid from 'uuid';

interface IDeps {
  readonly host: string;
  readonly eventGridClient: EventGridClient;
}

export const publishEventsCreator = (dependencies: IDeps) =>
  async (events: EventGridModels.EventGridEvent[]): Promise<void> => {
    const notifierHost = new URL(dependencies.host).host;
    if (!notifierHost) {
      throw new Error('Host property is not defined');
    }

    return dependencies.eventGridClient.publishEvents(notifierHost, events);
  };

export const eventComposer = (
    activityTitle: string,
    text: string,
    mode: string = 'error',
): EventGridModels.EventGridEvent => ({
    data: {
        activityTitle,
        mode,
        text,
    },
    dataVersion: '1.0',
    eventTime: new Date(),
    eventType: 'KenticoDocs.Notification.Created',
    id: getUuid(),
    subject: 'Publisher notification',
});
