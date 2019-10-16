import { EventGridClient } from 'azure-eventgrid';
import { EventGridEvent } from 'azure-eventgrid/lib/models';
import { TopicCredentials } from 'ms-rest-azure';
import {
    EmptyGuid,
    EventGridKey,
    NotifierEndpoint,
    ProjectId,
} from './constants';
import {
    eventComposer,
    publishEventsCreator,
} from './external/eventGridClient';

export const sendNotification = async (codename: string, itemId: string, errorMessage: string): Promise<void> => {
    const errorText: string = `Publishing of content item **${codename}** has failed.`;
    const errorTextEscaped: string = errorText.replace(/_/g, '\\_');

    const text: string =
        `${errorTextEscaped}  ${errorMessage}: ` +
        `[Content item in Kentico Kontent](https://app.kontent.ai/` +
        `${ProjectId}/content-inventory/${EmptyGuid}/content/${itemId})`;

    if (!EventGridKey || !NotifierEndpoint) {
        throw new Error('Undefined env property provided');
    }

    const topicCredentials: TopicCredentials = new TopicCredentials(EventGridKey);
    const eventGridClient: EventGridClient = new EventGridClient(topicCredentials);
    const publishEvents: (events: EventGridEvent[]) => Promise<void> = publishEventsCreator({
        eventGridClient,
        host: NotifierEndpoint
    });

    const event: EventGridEvent = eventComposer('Cascade publish failed.', text);
    await publishEvents([event]);
};
