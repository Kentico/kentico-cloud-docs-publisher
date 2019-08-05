import DeliveryItemListingResponse = ItemResponses.DeliveryItemListingResponse;
import {
    ContentItem,
    ItemResponses,
} from 'kentico-cloud-delivery';
import { IItem } from '../EventGridTrigger';
import { WorkflowCascadePublishId } from './constants';
import { deliveryClient } from './external/kenticoClient';
import { CodeSamples } from './models/code_samples';
import {
    getRichtextChildrenCodenames,
    publishDefaultLanguageVariant,
    scheduleDefaultLanguageVariant,
} from './utils';

export class ItemWorkflowManager {
    private rootItem: ContentItem;
    private linkedItems: ContentItem[];
    private workflowStepId: string;

    public cascadeProcessItem = async ({ item, transition_to }: IItem): Promise<void> =>
      await deliveryClient
        .items()
        .depthParameter(15)
        .equalsFilter('system.id', item.id)
        .getPromise()
        .then(async ({ items, linkedItems }: DeliveryItemListingResponse<ContentItem>) => {
            this.rootItem = items[0];
            this.linkedItems = linkedItems;
            this.workflowStepId = transition_to.id;

            await this.cascadePublishOrScheduleItem();
        });

    private cascadePublishOrScheduleItem = async (): Promise<void> => {
        this.rootItem instanceof CodeSamples
          ? await this.processCodeSamplesItem()
          : await this.processContentItem();
    };

    private processContentItem = async (item: ContentItem = this.rootItem): Promise<void> => {
        await this.processLinkedItems(item);
        await this.publishOrScheduleSingleItem(item);
    };

    private processLinkedItems = async (item: ContentItem): Promise<void> => {
        const { componentCodenames, linkedItemCodenames } = getRichtextChildrenCodenames(item);
        const itemsLinkedItems =
          this.linkedItems
            .filter((linkedItem: ContentItem) => linkedItemCodenames.includes(linkedItem.system.codename));
        const componentItems =
          this.linkedItems
            .filter((linkedItem: ContentItem) => componentCodenames.includes(linkedItem.system.codename));

        for (const linkedItem of itemsLinkedItems) {
            if (linkedItem instanceof CodeSamples) {
                await this.processCodeSamplesItem(linkedItem);
            } else {
                await this.processContentItem(linkedItem);
            }
        }

        for (const componentItem of componentItems) {
            await this.processLinkedItems(componentItem);
        }
    };

    private processCodeSamplesItem = async (item: ContentItem = this.rootItem): Promise<void> => {
        await this.publishOrScheduleSingleItem(item);

        for (const codeSampleCodename of item.elements.code_samples.value) {
            const codeSample = this.linkedItems.find(
              (linkedItem: ContentItem) => linkedItem.system.codename === codeSampleCodename);

            if (codeSample !== undefined) {
                await this.publishOrScheduleSingleItem(codeSample);
            }
        }
    };

    private publishOrScheduleSingleItem = async (item: ContentItem): Promise<void> => {
        this.workflowStepId === WorkflowCascadePublishId
          ? await publishDefaultLanguageVariant(item)
          : await scheduleDefaultLanguageVariant(this.rootItem, item);
    };
}
