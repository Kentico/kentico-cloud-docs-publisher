import DeliveryItemListingResponse = ItemResponses.DeliveryItemListingResponse;
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
import { MultiplatformArticle } from './models/multiplatform_article';
import {
  getLinkedItemsCodenames,
  getWorkflowStepOfItem,
  isDue,
  publishDefaultLanguageVariant,
} from './utils';

export const cascadePublish = async (): Promise<void> =>
  await deliveryClient
    .items()
    .depthParameter(0)
    .getPromise()
    .then(async (response: DeliveryItemListingResponse<ContentItem>) => {
      await processItems(response);
    });

const processItems =
  async ({ items }: DeliveryItemListingResponse<ContentItem>): Promise<void> => {
    for (const item of items) {
      await processItem(item, items);
    }
  };

const processItem = async (item: ContentItem, linkedItems: ContentItem[]): Promise<void> => {
  const workflowStep = await getWorkflowStepOfItem(item.system.codename);

  if (workflowStep === WorkflowCascadePublishId) {
    await publishItemInCascadePublishStep(item, linkedItems);
  }

  if (workflowStep === WorkflowScheduledId && await isDue(item.system.id)) {
    await publishItemInCascadePublishStep(item, linkedItems);
  }
};

const publishItemInCascadePublishStep = async (item: ContentItem, linkedItems: ContentItem[]): Promise<void> => {
  if (item instanceof MultiplatformArticle) {
    await publishDefaultLanguageVariant(item);
  } else {
    await cascadePublishItem(item, linkedItems);
  }
};

const cascadePublishItem = async (item: ContentItem, linkedItems: ContentItem[]): Promise<void> => {
  await publishLinkedItemsOfItem(item, linkedItems);
  await publishDefaultLanguageVariant(item);
};

const publishLinkedItemsOfItem = async (item: ContentItem, linkedItems: ContentItem[]): Promise<void> => {
  const linkedItemsCodenames = getLinkedItemsCodenames(item);
  const itemsLinkedItems =
    linkedItems
      .filter((linkedItem: ContentItem) => linkedItemsCodenames.includes(linkedItem.system.codename));

  for (const linkedItem of itemsLinkedItems) {
    if (linkedItem instanceof CodeSamples) {
      await publishCodeSamples(linkedItem, linkedItems);
    } else {
      await cascadePublishItem(linkedItem, linkedItems);
    }
  }
};

const publishCodeSamples = async (codeSamples: CodeSamples, linkedItems: ContentItem[]): Promise<void> => {
  await publishDefaultLanguageVariant(codeSamples);

  for (const codeSampleCodename of codeSamples.elements.code_samples.value) {
    const codeSample = linkedItems.find(
      (linkedItem: ContentItem) => linkedItem.system.codename === codeSampleCodename);
    await publishDefaultLanguageVariant(codeSample);
  }
};
