import * as AWS from 'aws-sdk';

const snsTopicArn = 'arn:aws:sns:ap-southeast-2:020250243072:banksy-transactions-dev';
const snsClient = new AWS.SNS();

describe('end 2 end test', () => {
  const now = new Date().toISOString();
  const testTransactions = [
    {
      date: now,
      amount: -5,
      description: `Test Transaction ${now}`,
    },
  ];

  const snsMessage = {
    username: 'spec',
    accountName: 'Complete Freedom Offset',
    transactions: testTransactions,
  };

  before(async () => {
    const result = await snsClient
      .publish({
        Message: JSON.stringify(snsMessage),
        TopicArn: snsTopicArn,
      })
      .promise();

    console.log('result', result.MessageId);
  });

  it('should publish a new transaction to YNAB', () => {
    console.log('todo - poll and check ynab');
  });
});
