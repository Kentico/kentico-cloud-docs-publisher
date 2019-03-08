import axios, { AxiosResponse } from 'axios';
import { ContentItem } from 'kentico-cloud-delivery';
import {
  EmptyGuid,
  FiveMinutes,
  InternalApiBaseAddress,
  InternalDraftApiHeader,
  WorkflowArchivedId,
  WorkflowPublishedId,
} from './constants';
import { contentManagementClient } from './external/kenticoClient';

require('dotenv').config();
const parser = require('node-html-parser');

export const getWorkflowStepOfItem = async (codename: string): Promise<string> => {
  const response =
    await contentManagementClient
      .viewLanguageVariant()
      .byItemCodename(codename)
      .byLanguageId(EmptyGuid)
      .toPromise();

  return response.data.workflowStep.id || EmptyGuid;
};

export const publishDefaultLanguageVariant = async (item: ContentItem | undefined): Promise<AxiosResponse | void> => {
  if (item === undefined) {
    return;
  }

  const itemWorkflowStep = await getWorkflowStepOfItem(item.system.codename);
  const isPublished = itemWorkflowStep === WorkflowPublishedId;
  const isArchived = itemWorkflowStep === WorkflowArchivedId;

  if (!isPublished && !isArchived) {
    await contentManagementClient
      .publishOrScheduleLanguageVariant()
      .byItemId(item.system.id)
      .byLanguageId(EmptyGuid)
      .toPromise();
  }
};

export const getLinkedItemsCodenames = (item: ContentItem): string[] => {
  let contentOfRichtextElements = '';

  for (const elementCodename of Object.keys(item.elements)) {
    const element = item.elements[elementCodename];

    if (element.type === 'rich_text') {
      contentOfRichtextElements = contentOfRichtextElements.concat(element.value);
    }
  }

  return parseRichtextContent(contentOfRichtextElements);
};

const parseRichtextContent = (content: string): string[] => {
  const linkedItemsCodenames: string[] = [];
  const root = parser.parse(content);
  const objectElements = root.querySelectorAll('object');

  for (const objectElement of objectElements) {
    const isKenticoCloudType = objectElement.rawAttributes.type === 'application/kenticocloud';
    const isLink = objectElement.rawAttributes['data-rel'] === 'link';

    if (isKenticoCloudType && isLink) {
      linkedItemsCodenames.push(objectElement.rawAttributes['data-codename']);
    }
  }

  return linkedItemsCodenames;
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

  return scheduledTime - currentTime < FiveMinutes;
};
