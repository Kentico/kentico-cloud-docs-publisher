import axios, { AxiosResponse } from 'axios';
import { EventGridClient } from 'azure-eventgrid';
import { EventGridEvent } from 'azure-eventgrid/lib/models';
import { LanguageVariantResponses } from 'kentico-cloud-content-management';
import { ContentItem, Elements } from 'kentico-cloud-delivery';
import { TopicCredentials } from 'ms-rest-azure';
import { parse } from 'node-html-parser';

import {
    EmptyGuid,
    EventGridKey,
    InternalApiBaseAddress,
    InternalDraftApiHeader,
    NotifierEndpoint,
    ProjectId,
    TenMinutes,
    WorkflowArchivedId,
    WorkflowPublishedId,
    WorkflowScheduledId,
} from './constants';
import { eventComposer, publishEventsCreator } from './external/eventGridClient';
import { contentManagementClient } from './external/kenticoClient';

export interface IInnerItemCodenames {
    readonly componentCodenames: string[];
    readonly linkedItemCodenames: string[];
}

export const sendNotification = async (codename: string, itemId: string, errorMessage: string): Promise<void> => {
    const errorText: string = `Publishing of content item **${codename}** has failed.`;
    const errorTextEscaped: string = errorText.replace(/_/g, '\\_');

    const text: string =
        `${errorTextEscaped}  ${errorMessage}: ` +
        `[Content item in Kentico Cloud](https://app.kenticocloud.com/` +
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

export const getWorkflowStepOfItem = async (codename: string): Promise<string> => {
    const response: LanguageVariantResponses.ViewLanguageVariantResponse = await contentManagementClient
        .viewLanguageVariant()
        .byItemCodename(codename)
        .byLanguageId(EmptyGuid)
        .toPromise();

    return response.data.workflowStep.id || EmptyGuid;
};

export const getScheduledPublishTime = async (itemId: string): Promise<string> => {
    const response: AxiosResponse = await axios({
        headers: InternalDraftApiHeader,
        method: 'GET',
        url: `${InternalApiBaseAddress}/item/${itemId}/variant/${EmptyGuid}`
    });

    return response.data.variant.assignment.publishScheduleTime;
};

export const isDue = async (itemId: string): Promise<boolean> => {
    const timeToPublish: string = await getScheduledPublishTime(itemId);
    const scheduledTime: number = new Date(timeToPublish).getTime();
    const currentTime: number = Date.now();

    return scheduledTime - currentTime < TenMinutes;
};

const shouldItemBePublished = async (item: ContentItem) => {
    const itemWorkflowStep: string = await getWorkflowStepOfItem(item.system.codename);
    const isPublished: boolean = itemWorkflowStep === WorkflowPublishedId;
    const isArchived: boolean = itemWorkflowStep === WorkflowArchivedId;
    const isScheduled: boolean = itemWorkflowStep === WorkflowScheduledId;
    const isDueToBePublished: boolean = !isScheduled || (isScheduled && (await isDue(item.system.id)));

    return !isPublished && !isArchived && isDueToBePublished;
};

export const publishDefaultLanguageVariant = async (item: ContentItem | undefined): Promise<AxiosResponse | void> => {
    if (item === undefined) {
        return;
    }

    try {
        if (await shouldItemBePublished(item)) {
            await contentManagementClient
                .publishOrScheduleLanguageVariant()
                .byItemId(item.system.id)
                .byLanguageId(EmptyGuid)
                .withData({} as any)
                .toPromise();
        }
    } catch (error) {
        await sendNotification(item.system.codename, item.system.id, error.message);

        throw error;
    }
};

export const getRichtextChildrenCodenames = (item: ContentItem): IInnerItemCodenames => {
    let contentOfRichtextElements = '';

    for (const propName of Object.keys(item)) {
        const prop = item[propName];
        if (prop instanceof Elements.RichTextElement) {
            const richTextElement = prop;
            contentOfRichtextElements = contentOfRichtextElements.concat(richTextElement.value);
        }
    }

    return parseRichtextContent(contentOfRichtextElements);
};

const parseRichtextContent = (content: string): IInnerItemCodenames => {
    const root = parse(content) as any;
    const objectElements = root.querySelectorAll('object');

    const linkedItemCodenames = getInnerItemCodenames(objectElements, 'link');
    const componentCodenames = getInnerItemCodenames(objectElements, 'component');

    return {
        componentCodenames,
        linkedItemCodenames
    };
};

const getInnerItemCodenames = (elements: HTMLElement[], type: string): string[] =>
    elements
        .filter(
            (objectElement: any) =>
                objectElement.rawAttributes.type === 'application/kenticocloud' &&
                objectElement.rawAttributes['data-type'] === 'item' &&
                objectElement.rawAttributes['data-rel'] === type
        )
        .map((objectElement: any) => objectElement.rawAttributes['data-codename']);
