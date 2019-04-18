import {
  AzureFunction,
  Context,
} from '@azure/functions';
import { cascadePublish } from '../shared/cascadePublish';

const timerTrigger: AzureFunction = async (context: Context, myTimer: any): Promise<void> => {
  await cascadePublish();
};

export default timerTrigger;
