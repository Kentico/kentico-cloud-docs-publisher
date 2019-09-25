import {
    ContentItem,
    ItemResponses,
} from 'kentico-cloud-delivery';
import {
    EmptyGuid,
    WorkflowCascadePublishId,
    WorkflowScheduledId,
} from './constants';
import {
    contentManagementClient,
    deliveryClient,
} from './external/kenticoClient';
import { CodeSamples } from './models/code_samples';
import { ProcessedCodenames } from './ProcessedCodenames';
import { sendNotification } from './sendNotification';
import {
    getChildItems,
    getWorkflowStepOfItem,
    isDue,
    shouldItemBePublished,
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
    ProcessedCodenames.initialize();

    const linkedItemsAsArray: ContentItem[] = Object.keys(response.linkedItems).map(key => response.linkedItems[key]);
    for (const item of response.items) {
        await processItem(item, linkedItemsAsArray);
    }
};

const processItem = async (item: ContentItem, linkedItems: ContentItem[]): Promise<void> => {
    const codename = item.system.codename;

    if (!ProcessedCodenames.has(codename)) {
        const workflowStep: string = await getWorkflowStepOfItem(codename);
        if (workflowStep === WorkflowCascadePublishId) {
            await publishItemInCascadePublishStep(item, linkedItems);
        }
        if (workflowStep === WorkflowScheduledId && (await isDue(item.system.id))) {
            await publishItemInCascadePublishStep(item, linkedItems);
        }
    }
};

const publishItemInCascadePublishStep = async (item: ContentItem, linkedItems: ContentItem[]): Promise<void> => {
    if (item instanceof CodeSamples) {
        await publishCodeSamples(item, linkedItems);
    } else {
        await cascadePublishItem(item, linkedItems);
    }
};

const publishCodeSamples = async (codeSamples: CodeSamples, linkedItems: ContentItem[]): Promise<void> => {
    await publishDefaultLanguageVariant(codeSamples);

    for (const codeSampleCodename of codeSamples._raw.elements.code_samples.value) {
        const codeSample: ContentItem = linkedItems.find(
            (linkedItem: ContentItem) => linkedItem.system.codename === codeSampleCodename,
        );
        await publishDefaultLanguageVariant(codeSample);
    }
};

const cascadePublishItem = async (
    item: ContentItem,
    linkedItems: ContentItem[],
    isComponent?: boolean
): Promise<void> => {
    const codename = item.system.codename;

    if (!ProcessedCodenames.has(codename)) {
        ProcessedCodenames.add(codename);

        await publishChildItems(item, linkedItems);

        if (!isComponent) {
            await publishDefaultLanguageVariant(item);
        }
    }
};

const publishDefaultLanguageVariant = async (item: ContentItem | undefined): Promise<void> => {
    if (item === undefined) {
        return;
    }

    try {
        if (await shouldItemBePublished(item)) {
            await contentManagementClient
                .publishOrScheduleLanguageVariant()
                .byItemId(item.system.id)
                .byLanguageId(EmptyGuid)
                .withData(undefined as any)
                .toPromise();
        }
    } catch (error) {
        await sendNotification(item.system.codename, item.system.id, error.message);

        throw error;
    }
};

const publishChildItems = async (item: ContentItem, linkedItems: ContentItem[]): Promise<void> => {
    const { childComponents, childLinkedItems } = getChildItems(item, linkedItems);

    const notProcessedLinkedItems = childLinkedItems.filter(
        (linkedItem) => !ProcessedCodenames.has(linkedItem.system.codename),
    );

    await publishLinkedItems(notProcessedLinkedItems, linkedItems);

    for (const componentItem of childComponents) {
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
