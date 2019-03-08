require('dotenv').config();

export const EmptyGuid = '00000000-0000-0000-0000-000000000000';
export const FiveMinutes = 300000;

export const WorkflowCascadePublishId = process.env.CASCADE_PUBLISH_ID;
export const WorkflowScheduledId = process.env.SCHEDULED_ID;
export const WorkflowPublishedId = process.env.PUBLISHED_ID;
export const WorkflowArchivedId = process.env.ARCHIVED_ID;

export const InternalApiBaseAddress = `https://app.kenticocloud.com/api/project/${process.env.PROJECT_ID}`;

export const PreviewApiKey = process.env.PREVIEW_API_KEY;
export const ContentManagementApiKey = process.env.CM_API_KEY || '';

export const InternalDraftApiHeader = { Authorization: `Bearer ${process.env.DRAFT_API_TOKEN}` };
