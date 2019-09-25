import axios, { AxiosResponse } from 'axios';
import { LanguageVariantResponses } from 'kentico-cloud-content-management';
import {
    ContentItem,
    Elements,
} from 'kentico-cloud-delivery';
import {
    EmptyGuid,
    InternalApiBaseAddress,
    InternalDraftApiHeader,
    TenMinutes,
    WorkflowArchivedId,
    WorkflowPublishedId,
    WorkflowScheduledId,
} from './constants';
import { contentManagementClient } from './external/kenticoClient';

interface IInnerItems {
    readonly childComponents: ContentItem[];
    readonly childLinkedItems: ContentItem[];
}

export interface IInnerItemCodenames {
    readonly componentCodenames: string[];
    readonly linkedItemCodenames: string[];
}

export const getWorkflowStepOfItem = async (codename: string): Promise<string> => {
    const response: LanguageVariantResponses.ViewLanguageVariantResponse = await contentManagementClient
        .viewLanguageVariant()
        .byItemCodename(codename)
        .byLanguageId(EmptyGuid)
        .toPromise();

    return response.data.workflowStep.id || EmptyGuid;
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

const getScheduledPublishTime = async (itemId: string): Promise<string> => {
    const response: AxiosResponse = await axios({
        headers: InternalDraftApiHeader,
        method: 'GET',
        url: `${InternalApiBaseAddress}/item/${itemId}/variant/${EmptyGuid}`
    });

    return response.data.variant.assignment.publishScheduleTime;
};

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

const getItemsByCodenames = (linkedItems: ContentItem[], codenames: string[]): ContentItem[] =>
    linkedItems.filter((linkedItem: ContentItem) =>
        codenames.includes(linkedItem.system.codename),
    );
