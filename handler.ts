import { SNSHandler, SNSEvent, Context } from 'aws-lambda';
import 'source-map-support/register';
import { TransactionsMessage, UserConfig } from './types'
import { getSecret } from './secretFetcher';

export const ynab: SNSHandler = async (event: SNSEvent, _context: Context): Promise<void> => {
  console.log('Parsing message');
  const data : TransactionsMessage = JSON.parse(event.Records[0].Sns.Message);
  const userSecret = await getSecret(data.username);
  const cfg : UserConfig = JSON.parse(userSecret);
  console.log('userConfig', cfg);

  for (const txn of data.transactions) {
    console.log('txn', txn);
  }

  console.log('received data', data, 'user config', cfg);
};
