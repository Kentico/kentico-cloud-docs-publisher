import { ContentManagementClient } from 'kentico-cloud-content-management';
import {
  DeliveryClient,
  TypeResolver,
} from 'kentico-cloud-delivery';
import {
  ContentManagementApiKey,
  PreviewApiKey,
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
  projectId: process.env.PROJECT_ID || '',
  typeResolvers,
});

export const contentManagementClient = new ContentManagementClient({
  apiKey: ContentManagementApiKey,
  projectId: process.env.PROJECT_ID || '',
});
