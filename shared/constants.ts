export const EmptyGuid: string = '00000000-0000-0000-0000-000000000000';
export const TwentyMinutes: number = 1200000;

export const ProjectId: string = process.env['KC.ProjectId'] || '';
export const PreviewApiKey: string = process.env['KC.PreviewApiKey'] || '';
export const ContentManagementApiKey: string = process.env['KC.ContentManagementApiKey'] || '';

export const NotifierEndpoint: string = process.env['EventGrid.Notification.Endpoint'] || '';
export const EventGridKey: string = process.env['EventGrid.Notification.Key'] || '';

export const WorkflowCascadePublishId: string = process.env['KC.Step.CascadePublishId'];
export const WorkflowScheduledId: string = process.env['KC.Step.ScheduledPublishId'];
export const WorkflowPublishedId: string = process.env['KC.Step.PublishId'];
export const WorkflowArchivedId: string = process.env['KC.Step.ArchivedId'];

export const InternalApiBaseAddress: string = `https://app.kontent.ai/api/project/${ProjectId}`;

export const InternalDraftApiHeader = { Authorization: `Bearer ${process.env['KC.InternalApiToken']}` };
