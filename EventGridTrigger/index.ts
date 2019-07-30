import {
    AzureFunction,
    Context,
} from '@azure/functions';
import { IEventGridEvent } from 'cloud-docs-shared-code';
import { ItemWorkflowManager } from '../shared/cascadePublish';

interface IIdentifier {
    readonly id: string;
}

export interface IItem {
    readonly item: IIdentifier;
    readonly language: IIdentifier;
    readonly transition_from: IIdentifier;
    readonly transition_to: IIdentifier;
}

const eventGridTrigger: AzureFunction = async (
    context: Context,
    eventGridEvent: IEventGridEvent<any>,
): Promise<void> => {
    try {
        const items: IItem[] = eventGridEvent.data.webhook.items;
        const workflowManager = new ItemWorkflowManager();

        for (const item of items) {
            await workflowManager.cascadeProcessItem(item);
        }
    } catch (error) {
        /** This try-catch is required for correct logging of exceptions in Azure */
        throw `Message: ${error.message} \nStack Trace: ${error.stack}`;
    }
};

export default eventGridTrigger;
