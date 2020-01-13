import { expect } from 'chai';

import { BankAccount } from './types';

import { filterTransactionTypes } from './transactionFilters';

describe('transactionFilters', () => {
  describe('filterTransactionTypes', () => {
    const bankAccount: BankAccount = {
      accountName: 'test-only',
      ynabAccountName: 'test-only',
    };

    const scenarios: any = [
      {
        account: {
          ...bankAccount,
          transactionTypes: 'credit',
        },
        amount: 0,
        expected: false,
      },
      {
        account: {
          ...bankAccount,
          transactionTypes: 'credit',
        },
        amount: -10,
        expected: false,
      },
      {
        account: {
          ...bankAccount,
          transactionTypes: 'credit',
        },
        amount: 10,
        expected: true,
      },
      {
        account: {
          ...bankAccount,
          transactionTypes: 'debit',
        },
        amount: -5,
        expected: true,
      },
      {
        account: {
          ...bankAccount,
          transactionTypes: 'debit',
        },
        amount: 5,
        expected: false,
      },
      {
        account: bankAccount,
        amount: 5,
        expected: true,
      },
      {
        account: bankAccount,
        amount: -5,
        expected: true,
      },
    ];

    scenarios.forEach(({ expected, account, amount }) => {
      it(`should be ${expected} when amount is ${amount} for ${account.transactionTypes} account type`, () => {
        expect(filterTransactionTypes(account, amount)).to.equal(expected);
      });
    });
  });
});
