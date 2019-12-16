import { SNSHandler, SNSEvent, Context } from 'aws-lambda';
import 'source-map-support/register';
import { TransactionsMessage } from './types';
import { processTransactions } from './processor';

export const ynab: SNSHandler = async (event: SNSEvent, _context: Context): Promise<void> => {
  if (!event.Records) {
    throw new Error(`Event records are empty. Unable to process SNS message. ${event}`);
  }

  const data: TransactionsMessage = JSON.parse(event.Records[0].Sns.Message);
  await processTransactions(data);
};
