import { shouldCreateTransaction } from './processor';
import { expect } from 'chai';
import { BankAccount, TransactionType } from './types';

describe('Processor', () => {
  describe('shouldCreateTransaction', () => {
    const bankAccount : BankAccount = {
      accountName: 'test-only', ynabAccountName: 'test-only'
    };

    const scenarios = [
      {
        account: {
          ...bankAccount,
          transactionType: TransactionType.Credit,
        },
        amount: 0,
        expected: false,
      },
    ];

    scenarios.forEach(({ expected, account, amount }) => {
      it(`should return ${expected} when amount is ${amount} for ${account.transactionType} account type`, () => {
        expect(shouldCreateTransaction(account, amount)).to.equal(expected);
      });
    });
  });
});
