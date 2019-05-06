import { ContentManagementClient } from 'kentico-cloud-content-management';
import {
  DeliveryClient,
  TypeResolver,
} from 'kentico-cloud-delivery';
import {
  ContentManagementApiKey,
  PreviewApiKey,
  ProjectId,
} from '../constants';
import { CodeSamples } from '../models/code_samples';

require('dotenv').config();

const typeResolvers = [
  new TypeResolver('code_samples', () => new CodeSamples()),
];

export const deliveryClient = new DeliveryClient({
  enablePreviewMode: true,
  previewApiKey: PreviewApiKey,
  projectId: ProjectId,
  typeResolvers,
});

export const contentManagementClient = new ContentManagementClient({
  apiKey: ContentManagementApiKey,
  projectId: ProjectId,
  /* Ensures we don't hit the requests per minute API limit. */
  retryAttempts: 9,
  /* To ensure we retry correct refused requests. */
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
});
