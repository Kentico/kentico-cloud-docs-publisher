import {
    ContentItem,
    ItemResponses,
} from 'kentico-cloud-delivery';

import {
    WorkflowCascadePublishId,
    WorkflowScheduledId,
} from './constants';
import { deliveryClient } from './external/kenticoClient';
import { CodeSamples } from './models/code_samples';
import {
    getRichtextChildrenCodenames,
    getWorkflowStepOfItem,
    IInnerItemCodenames,
    isDue,
    publishDefaultLanguageVariant,
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
    await publishChildrenItems(item, linkedItems);

    if (!isComponent) {
        await publishDefaultLanguageVariant(item);
    }
};

const publishChildrenItems = async (item: ContentItem, linkedItems: ContentItem[]): Promise<void> => {
    const richTextChildren: IInnerItemCodenames = getRichtextChildrenCodenames(item);
    const itemsLinkedItems: ContentItem[] = getItemsByCodename(linkedItems, richTextChildren.linkedItemCodenames);
    const componentItems: ContentItem[] = getItemsByCodename(linkedItems, richTextChildren.componentCodenames);

    if (item.system.type.includes('zapi')) {
        itemsLinkedItems.push(...getModularContentItems(item, linkedItems));
    }

    await publishLinkedItems(itemsLinkedItems, linkedItems);

    for (const componentItem of componentItems) {
        await cascadePublishItem(componentItem, linkedItems, true);
    }
};

const publishLinkedItems = async (itemsLinkedItems: ContentItem[], linkedItems: ContentItem[]) => {
    for (const linkedItem of itemsLinkedItems) {
        if (linkedItem instanceof CodeSamples) {
            await publishCodeSamples(linkedItem, linkedItems);
        } else {
            await cascadePublishItem(linkedItem, linkedItems);
        }
    }
};

const getItemsByCodename = (linkedItems: ContentItem[], richTextChildren: string[]): ContentItem[] =>
    linkedItems.filter((linkedItem: ContentItem) =>
        richTextChildren.includes(linkedItem.system.codename),
    );

const getModularContentItems = (item: ContentItem, linkedItems: ContentItem[]) =>
    Object
        .keys(item._raw.elements)
        .map(key => item._raw.elements[key])
        .filter((element) => element.type === 'modular_content' && element.value.length > 0)
        .reduce(getItemsFromLinkedItemsElements(linkedItems), []);

const getItemsFromLinkedItemsElements = (linkedItems: ContentItem[]) =>
    (matchedItems, current) => {
        const codenames = current.value as string[];

        return codenames
            .map(getMatchingContentItem(linkedItems))
            .concat(matchedItems);
    };

const getMatchingContentItem = (linkedItems: ContentItem[]) =>
    (codename) =>
        linkedItems.find((contentItem) => contentItem.system.codename === codename);

const publishCodeSamples = async (codeSamples: CodeSamples, linkedItems: ContentItem[]): Promise<void> => {
    await publishDefaultLanguageVariant(codeSamples);

    for (const codeSampleCodename of codeSamples._raw.elements.code_samples.value) {
        const codeSample: ContentItem = linkedItems.find(
            (linkedItem: ContentItem) => linkedItem.system.codename === codeSampleCodename,
        );
        await publishDefaultLanguageVariant(codeSample);
    }
};
