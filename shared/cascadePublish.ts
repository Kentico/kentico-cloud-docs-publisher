import { ContentItem, ItemResponses } from 'kentico-cloud-delivery';

import { WorkflowCascadePublishId, WorkflowScheduledId } from './constants';
import { deliveryClient } from './external/kenticoClient';
import { CodeSamples } from './models/code_samples';
import {
    getRichtextChildrenCodenames,
    getWorkflowStepOfItem,
    IInnerItemCodenames,
    isDue,
    publishDefaultLanguageVariant
} from './utils';

export const cascadePublish = async (): Promise<void> =>
    await deliveryClient
        .items()
        .depthParameter(1)
        .toPromise()
        .then(async (response: ItemResponses.ListContentItemsResponse<ContentItem>) => {
            await processItems(response);
        });

const processItems = async (response: ItemResponses.ListContentItemsResponse<ContentItem>): Promise<void> => {
    const linkedItemsAsArray: ContentItem[] = Object.keys(response.linkedItems).map(key => response.linkedItems[key]);
    for (const item of response.items) {
        await processItem(item, linkedItemsAsArray);
    }
};

const processItem = async (item: ContentItem, linkedItems: ContentItem[]): Promise<void> => {
    const workflowStep: string = await getWorkflowStepOfItem(item.system.codename);

    if (workflowStep === WorkflowCascadePublishId) {
        await publishItemInCascadePublishStep(item, linkedItems);
    }

    if (workflowStep === WorkflowScheduledId && (await isDue(item.system.id))) {
        await publishItemInCascadePublishStep(item, linkedItems);
    }
};

const publishItemInCascadePublishStep = async (item: ContentItem, linkedItems: ContentItem[]): Promise<void> => {
    if (item instanceof CodeSamples) {
        await publishCodeSamples(item, linkedItems);
    } else {
        await cascadePublishItem(item, linkedItems);
    }
};

const cascadePublishItem = async (
    item: ContentItem,
    linkedItems: ContentItem[],
    isComponent?: boolean
): Promise<void> => {
    await publishLinkedItemsOfItem(item, linkedItems);

    if (!isComponent) {
        await publishDefaultLanguageVariant(item);
    }
};

const publishLinkedItemsOfItem = async (item: ContentItem, linkedItems: ContentItem[]): Promise<void> => {
    const richTextChildren: IInnerItemCodenames = getRichtextChildrenCodenames(item);
    const itemsLinkedItems: ContentItem[] = linkedItems.filter((linkedItem: ContentItem) =>
        richTextChildren.linkedItemCodenames.includes(linkedItem.system.codename)
    );
    const componentItems: ContentItem[] = linkedItems.filter((linkedItem: ContentItem) =>
        richTextChildren.componentCodenames.includes(linkedItem.system.codename)
    );

    for (const linkedItem of itemsLinkedItems) {
        if (linkedItem instanceof CodeSamples) {
            await publishCodeSamples(linkedItem, linkedItems);
        } else {
            await cascadePublishItem(linkedItem, linkedItems);
        }
    }

    for (const componentItem of componentItems) {
        await cascadePublishItem(componentItem, linkedItems, true);
    }
};

const publishCodeSamples = async (codeSamples: CodeSamples, linkedItems: ContentItem[]): Promise<void> => {
    await publishDefaultLanguageVariant(codeSamples);

    for (const codeSampleCodename of codeSamples.elements.code_samples.value) {
        const codeSample: ContentItem = linkedItems.find(
            (linkedItem: ContentItem) => linkedItem.system.codename === codeSampleCodename
        );
        await publishDefaultLanguageVariant(codeSample);
    }
};
