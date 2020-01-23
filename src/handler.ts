import 'source-map-support/register';
import { Context, SQSEvent, SQSHandler } from 'aws-lambda';
import { TransactionsMessage, SqsMessage } from './types';
import { processBudgetMessage } from './budgetProcessor';
import logger from './logger';

export const ynab: SQSHandler = async (event: SQSEvent, _context: Context): Promise<void> => {
  try {
    const [{ body }] = event.Records;
    const { Message }: SqsMessage = JSON.parse(body);
    const data: TransactionsMessage = JSON.parse(Message);
    await processBudgetMessage(data);
  } catch (err) {
    logger.error('Something bad happened', err);
    throw err;
  }
};
