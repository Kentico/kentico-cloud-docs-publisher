import axios, { AxiosResponse } from 'axios';
import { EventGridClient } from 'azure-eventgrid';
import { EventGridEvent } from 'azure-eventgrid/lib/models';
import { LanguageVariantResponses } from 'kentico-cloud-content-management';
import {
    ContentItem,
    Elements,
} from 'kentico-cloud-delivery';
import { TopicCredentials } from 'ms-rest-azure';

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
import {
    eventComposer,
    publishEventsCreator,
} from './external/eventGridClient';
import { contentManagementClient } from './external/kenticoClient';

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

export const shouldItemBePublished = async (item: ContentItem): Promise<boolean> => {
    const itemWorkflowStep: string = await getWorkflowStepOfItem(item.system.codename);
    const isPublished: boolean = itemWorkflowStep === WorkflowPublishedId;
    const isArchived: boolean = itemWorkflowStep === WorkflowArchivedId;
    const isScheduled: boolean = itemWorkflowStep === WorkflowScheduledId;
    const isDueToBePublished: boolean = !isScheduled || (isScheduled && (await isDue(item.system.id)));

    return !isPublished && !isArchived && isDueToBePublished;
};

interface IInnerItems {
    readonly childComponents: ContentItem[];
    readonly childLinkedItems: ContentItem[];
}

export interface IInnerItemCodenames {
    readonly componentCodenames: string[];
    readonly linkedItemCodenames: string[];
}

export const getChildItems = (item: ContentItem, linkedItems: ContentItem[]): IInnerItems => {
    const richTextChildren: IInnerItemCodenames = getRichtextChildCodenames(item);
    const childLinkedItems: ContentItem[] = getItemsByCodenames(linkedItems, richTextChildren.linkedItemCodenames);
    const components: ContentItem[] = getItemsByCodenames(linkedItems, richTextChildren.componentCodenames);

    if (item.system.type.includes('zapi')) {
        const modularContentCodenames = getModularContentCodenames(item);
        const modularContentItems = getItemsByCodenames(linkedItems, modularContentCodenames);

        childLinkedItems.push(...modularContentItems);
    }

    return {
        childComponents: components,
        childLinkedItems,
    };
};

const getItemsByCodenames = (linkedItems: ContentItem[], codenames: string[]): ContentItem[] =>
    linkedItems.filter((linkedItem: ContentItem) =>
        codenames.includes(linkedItem.system.codename),
    );

export const getRichtextChildCodenames = (item: ContentItem): IInnerItemCodenames => {
    const innerItemCodenames: IInnerItemCodenames = {
        componentCodenames: [],
        linkedItemCodenames: [],
    };

    for (const propName of Object.keys(item)) {
        const prop = item[propName];
        if (prop instanceof Elements.RichTextElement) {
            const richTextData = prop.resolveData();
            innerItemCodenames.componentCodenames.push(...richTextData.componentCodenames);
            innerItemCodenames.linkedItemCodenames.push(...richTextData.linkedItemCodenames);
        }
    }

    return innerItemCodenames;
};

const getModularContentCodenames = (item: ContentItem): string[] =>
    Object
        .keys(item._raw.elements)
        .map(key => item._raw.elements[key])
        .filter((element) => element.type === 'modular_content' && element.value.length > 0)
        .map((modularContent) => modularContent.value)
        .join()
        .split(',');
