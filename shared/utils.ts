import axios, { AxiosResponse } from 'axios';
import { ContentItem } from 'kentico-cloud-delivery';
import {
  EmptyGuid,
  InternalApiBaseAddress,
  InternalDraftApiHeader,
  NotifierEndpoint,
  ProjectId,
  TenMinutes,
  WorkflowArchivedId,
  WorkflowPublishedId,
  WorkflowScheduledId,
} from './constants';
import { contentManagementClient } from './external/kenticoClient';

const parser = require('node-html-parser');

export interface IInnerItemCodenames {
  readonly componentCodenames: string[];
  readonly linkedItemCodenames: string[];
}

export const sendNotification =
  async (codename: string, itemId: string, errorMessage: string): Promise<void> => {
    const errorText = `Publishing of content item **${codename}** has failed.`;
    const errorTextEscaped = errorText.replace(/_/g, '\\\_');

    const body = {
      activityTitle: 'Cascade publish failed.',
      mode: 'error',
      text: `${errorTextEscaped}  ${errorMessage}: ` +
          `[Content item in Kentico Cloud](https://app.kenticocloud.com/` +
          `${ProjectId}/content-inventory/${EmptyGuid}/content/${itemId})`,
    };

    await axios.post(NotifierEndpoint, body);
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

export const isDue = async (itemId: string): Promise<boolean> => {
  const timeToPublish = await getScheduledPublishTime(itemId);
  const scheduledTime = new Date(timeToPublish).getTime();
  const currentTime = Date.now();

  return scheduledTime - currentTime < TenMinutes;
};

const shouldItemBePublished = async (item: ContentItem) => {
  const itemWorkflowStep = await getWorkflowStepOfItem(item.system.codename);
  const isPublished = itemWorkflowStep === WorkflowPublishedId;
  const isArchived = itemWorkflowStep === WorkflowArchivedId;
  const isScheduled = itemWorkflowStep === WorkflowScheduledId;
  const isDueToBePublished = !isScheduled || (isScheduled && await isDue(item.system.id));

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
