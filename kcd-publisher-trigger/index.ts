import {
  AzureFunction,
  Context,
  HttpRequest,
} from '@azure/functions';
import { cascadePublish } from '../shared/cascadePublish';

const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest): Promise<void> => {
  await cascadePublish();
};

export default httpTrigger;
