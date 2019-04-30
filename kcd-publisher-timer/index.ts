import {
  AzureFunction,
  Context,
} from '@azure/functions';
import { cascadePublish } from '../shared/cascadePublish';

const timerTrigger: AzureFunction = async (context: Context, myTimer: any): Promise<void> => {
  try {
    await cascadePublish();
  } catch (error) {
    /** This try-catch is required for correct logging of exceptions in Azure */
    throw `Message: ${error.message} \nStack Trace: ${error.stack}`;
  }
};

export default timerTrigger;
