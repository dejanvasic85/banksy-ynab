import * as AWS from 'aws-sdk';

import { Budget } from '../src/budget';
import { TransactionsMessage } from '../src/types';

AWS.config.update({
  region: 'ap-southeast-2',
});

const snsClient = new AWS.SNS();
const { YNAB_KEY, YNAB_BUDGET_ID, YNAB_ACCOUNT_ID } = process.env;

const config = {
  snsTopicArn: 'arn:aws:sns:ap-southeast-2:020250243072:banksy-transactions-dev',
  ynabKey: YNAB_KEY,
  ynabBudgetId: YNAB_BUDGET_ID,
  ynabAccountId: YNAB_ACCOUNT_ID,
};

const poll = async (fn: any, timeout: number, interval: number) => {
  const endTime = Date.now() + timeout;

  const checkCondition = async (resolve: any, reject: any) => {
    const result = await fn();
    if (result) {
      resolve(result);
    } else if (Date.now() < endTime) {
      setTimeout(checkCondition, interval, resolve, reject);
    } else {
      reject(new Error(`Timed out during polling.`));
    }
  };

  return new Promise(checkCondition);
};

describe('end 2 end test', () => {
  let budget: Budget;

  const now = new Date().toISOString();
  const suffix = `${Math.floor(Math.random() * 10000)}`;
  const description = `txn ${suffix}`;
  const testTransactions = [
    {
      date: now,
      amount: -1,
      description,
    },
  ];

  const snsMessage: TransactionsMessage = {
    username: 'john',
    bankId: 'aaa',
    accountName: 'Savings',
    newTxns: testTransactions,
    duplicateTxns: [],
    matchingTxns: [],
  };

  before(async () => {
    await snsClient
      .publish({
        Message: JSON.stringify(snsMessage),
        TopicArn: config.snsTopicArn,
      })
      .promise();

    budget = new Budget(config.ynabKey);
    await budget.loadBudget(config.ynabBudgetId);
  });

  it('should publish a new transaction to YNAB', async () => {
    await poll(
      async () => {
        // Fetch the ynab transactions
        console.log('Fetching transactions please wait...');

        const days = 1;
        const txns = await budget.getTransactionsForAccount(config.ynabAccountId, days);
        const foundTransaction = txns.find(({ amount, memo }) => amount === -1000 && memo === description);

        console.log('Found ', foundTransaction);
        return foundTransaction;
      },
      20000, // up to 20 seconds
      1000, // every second
    );
  });
});
