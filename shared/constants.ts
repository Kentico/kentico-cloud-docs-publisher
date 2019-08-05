export const EmptyGuid = '00000000-0000-0000-0000-000000000000';

export const ProjectId = process.env['KC.ProjectId'] || '';
export const PreviewApiKey = process.env['KC.PreviewApiKey'] || '';
export const ContentManagementApiKey = process.env['KC.ContentManagementApiKey'] || '';

export const NotifierEndpoint = process.env['EventGrid.Notification.Endpoint'] || '';
export const EventGridKey = process.env['EventGrid.Notification.Key'] || '';

export const WorkflowCascadePublishId = process.env['KC.Step.CascadePublishId'] || '';
export const WorkflowScheduledId = process.env['KC.Step.ScheduledPublishId'] || '';
export const WorkflowPublishedId = process.env['KC.Step.PublishId'] || '';
export const WorkflowArchivedId = process.env['KC.Step.ArchivedId'] || '';

export const InternalApiBaseAddress = `https://app.kenticocloud.com/api/project/${ProjectId}`;

export const InternalDraftApiHeader = { Authorization: `Bearer ${process.env['KC.InternalApiToken']}` };
