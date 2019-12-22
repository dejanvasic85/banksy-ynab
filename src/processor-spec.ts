import { expect } from 'chai';
import { stub } from 'sinon';
import { shouldCreateTransaction, processTransactions, parseDate } from './processor';
import { BankAccount, TransactionsMessage, BankTransaction } from './types';
import * as secretFetcher from './secretFetcher';
import * as budget from './budget';

describe('processor', () => {
  describe('processTransactions', () => {
    let getUserConfigSecretStub;
    let loadBudgetStub;
    let getAccountsStub;
    let addTransactionStub;

    before(() => {
      getUserConfigSecretStub = stub(secretFetcher, 'getUserConfigSecret');
      loadBudgetStub = stub(budget.Budget.prototype, 'loadBudget');
      getAccountsStub = stub(budget.Budget.prototype, 'getAccounts');
      addTransactionStub = stub(budget.Budget.prototype, 'addTransaction');
    });

    beforeEach(() => {
      getUserConfigSecretStub.resetHistory();
      loadBudgetStub.resetHistory();
      getAccountsStub.resetHistory();
      addTransactionStub.resetHistory();
    });

    after(() => {
      getUserConfigSecretStub.restore();
      loadBudgetStub.restore();
      getAccountsStub.restore();
      addTransactionStub.restore();
    });

    it('should post messages to YNAB', async () => {
      getUserConfigSecretStub.resolves({
        ynabKey: 'key-12',
        ynabBudgetId: 'budget321',
        banks: [
          {
            bankId: 'cba',
            accounts: [
              {
                accountName: 'savings',
                ynabAccountName: 'savings-ynab',
              },
            ],
          },
        ],
      });

      getAccountsStub.returns([
        {
          accountId: 'ynab-account-id-123',
          accountName: 'savings-ynab',
        },
      ]);

      const transactions: BankTransaction[] = [
        {
          amount: -80,
          date: '2019-12-21T13:00:00.000Z',
          description: 'mcdonalds',
        },
      ];

      const data: TransactionsMessage = {
        bankId: 'cba',
        accountName: 'savings',
        username: 'joe',
        transactions,
      };

      await processTransactions(data);

      // Assert
      expect(loadBudgetStub.calledWith('budget321')).to.equal(true);
      expect(addTransactionStub.getCalls().length).to.equal(1);

      expect(addTransactionStub.getCall(0).args[0]).to.contain({
        memo: 'mcdonalds',
        amount: -80000,
        date: '2019-12-22',
        accountId: 'ynab-account-id-123',
      });
    });
  });

  describe('shouldCreateTransaction', () => {
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
        expect(shouldCreateTransaction(account, amount)).to.equal(expected);
      });
    });
  });

  describe('parseDate', () => {
    expect(parseDate('2019-12-21T13:00:00.000Z')).to.equal('2019-12-22');
  });
});
