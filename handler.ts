import { SNSHandler, SNSEvent, Context } from 'aws-lambda';
import 'source-map-support/register';

export const ynab: SNSHandler = async (event: SNSEvent, _context: Context): Promise<void> => {
  console.log('starting to process the message', event.Records);
};
