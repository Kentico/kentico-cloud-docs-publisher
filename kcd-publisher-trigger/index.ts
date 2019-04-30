import {
  AzureFunction,
  Context,
  HttpRequest,
} from '@azure/functions';
import { cascadePublish } from '../shared/cascadePublish';

const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest): Promise<void> => {
  try {
    await cascadePublish();
  } catch (error) {
    /** This try-catch is required for correct logging of exceptions in Azure */
    throw `Message: ${error.message} \nStack Trace: ${error.stack}`;
  }
};

export default httpTrigger;
