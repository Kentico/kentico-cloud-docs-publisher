import axios from 'axios';
import { EventGridClient } from 'azure-eventgrid';
import { ContentItem } from 'kentico-cloud-delivery';
import { TopicCredentials } from 'ms-rest-azure';
import {
    EmptyGuid,
    EventGridKey,
    InternalApiBaseAddress,
    InternalDraftApiHeader,
    NotifierEndpoint,
    ProjectId,
    WorkflowArchivedId,
    WorkflowPublishedId,
    WorkflowScheduledId,
} from './constants';
import {
    eventComposer,
    publishEventsCreator,
} from './external/eventGridClient';
import { contentManagementClient } from './external/kenticoClient';

const parser = require('node-html-parser');

export interface IInnerItemCodenames {
    readonly componentCodenames: string[];
    readonly linkedItemCodenames: string[];
}

interface IPublishData {
    readonly scheduled_to: string;
}

export const sendNotification =
  async (codename: string, itemId: string, errorMessage: string): Promise<void> => {
      const errorText = `Publishing of content item **${codename}** has failed.`;
      const errorTextEscaped = errorText.replace(/_/g, '\\\_');

      const text = `${errorTextEscaped}  ${errorMessage}: ` +
        `[Content item in Kentico Cloud](https://app.kenticocloud.com/` +
        `${ProjectId}/content-inventory/${EmptyGuid}/content/${itemId})`;

      if (!EventGridKey || !NotifierEndpoint) {
          throw new Error('Undefined env property provided');
      }

      const topicCredentials = new TopicCredentials(EventGridKey);
      const eventGridClient = new EventGridClient(topicCredentials);
      const publishEvents = publishEventsCreator({
          eventGridClient,
          host: NotifierEndpoint,
      });

      const event = eventComposer('Cascade publish failed.', text);
      await publishEvents([event]);
  };

export const getWorkflowStepOfItem = async (codename: string): Promise<string> => {
    const response =
      await contentManagementClient
        .viewLanguageVariant()
        .byItemCodename(codename)
        .byLanguageId(EmptyGuid)
        .toPromise();

    return response.data.workflowStep.id || EmptyGuid;
};

export const getScheduledPublishTime = async (itemId: string): Promise<string> => {
    const response = await axios({
        headers: InternalDraftApiHeader,
        method: 'get',
        url: `${InternalApiBaseAddress}/item/${itemId}/variant/${EmptyGuid}`,
    });

    return response.data.variant.assignment.publishScheduleTime;
};

export const publishDefaultLanguageVariant = async (item: ContentItem): Promise<void> => {
    await publishOrScheduleWithData(item, undefined as any);
};

export const scheduleDefaultLanguageVariant =
  async (rootItem: ContentItem, itemToPublish: ContentItem): Promise<void> => {
      const publishData = {
          scheduled_to: await getScheduledPublishTime(rootItem.system.id),
      };

      await publishOrScheduleWithData(itemToPublish, publishData);
  };

const publishOrScheduleWithData = async (item: ContentItem, publishData: IPublishData): Promise<void> => {
    try {
        if (await shouldItemBePublishedOrScheduled(item)) {
            await contentManagementClient
              .publishOrScheduleLanguageVariant()
              .byItemId(item.system.id)
              .byLanguageId(EmptyGuid)
              .withData(publishData)
              .toPromise();
        }
    } catch (error) {
        await sendNotification(
          item.system.codename,
          item.system.id,
          error.message,
        );

        throw error;
    }
};

const shouldItemBePublishedOrScheduled = async (item: ContentItem) => {
    const itemWorkflowStep = await getWorkflowStepOfItem(item.system.codename);

    const isPublished = itemWorkflowStep === WorkflowPublishedId;
    const isArchived = itemWorkflowStep === WorkflowArchivedId;
    const isScheduled = itemWorkflowStep === WorkflowScheduledId;

    return !isPublished && !isArchived && !isScheduled;
};

export const getRichtextChildrenCodenames = (item: ContentItem): IInnerItemCodenames => {
    let contentOfRichtextElements = '';

    for (const elementCodename of Object.keys(item.elements)) {
        const element = item.elements[elementCodename];

        if (element.type === 'rich_text') {
            contentOfRichtextElements = contentOfRichtextElements.concat(element.value);
        }
    }

    return parseRichtextContent(contentOfRichtextElements);
};

const parseRichtextContent = (content: string): IInnerItemCodenames => {
    const root = parser.parse(content);
    const objectElements = root.querySelectorAll('object');

    const linkedItemCodenames = getInnerItemCodenames(objectElements, 'link');
    const componentCodenames = getInnerItemCodenames(objectElements, 'component');

    return {
        componentCodenames,
        linkedItemCodenames,
    };
};

const getInnerItemCodenames = (elements: HTMLElement[], type: string): string[] =>
  elements
    .filter((objectElement: any) =>
      objectElement.rawAttributes.type === 'application/kenticocloud' &&
      objectElement.rawAttributes['data-type'] === 'item' &&
      objectElement.rawAttributes['data-rel'] === type)
    .map((objectElement: any) => objectElement.rawAttributes['data-codename']);
