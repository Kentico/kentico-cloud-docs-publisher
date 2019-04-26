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
import { MultiplatformArticle } from '../models/multiplatform_article';

require('dotenv').config();

const typeResolvers = [
  new TypeResolver('code_samples', () => new CodeSamples()),
  new TypeResolver('multiplatform_article', () => new MultiplatformArticle()),
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
  retryAttempts: 9,
  retryStatusCodes: [429, 500],
});
