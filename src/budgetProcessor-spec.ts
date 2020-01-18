import { expect } from 'chai';
import { stub } from 'sinon';
import { processBudgetMessage } from './budgetProcessor';
import { TransactionsMessage, BankTransaction } from './types';
import logger from './logger';
import * as secretFetcher from './secretFetcher';
import * as budget from './budget';

describe('budgetProcessor', () => {
  describe('processBudgetMessage', () => {
    let getUserConfigSecretStub;
    let loadBudgetStub;
    let getAccountsStub;
    let addTransactionStub;
    let loggerInfoStub;
    let getTransactionsForAccountStub;

    const transactions: BankTransaction[] = [
      {
        amount: -80,
        date: '2020-01-13T20:41:09.685Z',
        description: 'mcdonalds',
      },
    ];

    const data: TransactionsMessage = {
      bankId: 'cba',
      accountName: 'savings',
      username: 'joe',
      transactions,
    };

    before(() => {
      getUserConfigSecretStub = stub(secretFetcher, 'getUserConfigSecret');
      loadBudgetStub = stub(budget.Budget.prototype, 'loadBudget');
      getAccountsStub = stub(budget.Budget.prototype, 'getAccounts');
      addTransactionStub = stub(budget.Budget.prototype, 'addTransaction');
      getTransactionsForAccountStub = stub(budget.Budget.prototype, 'getTransactionsForAccount');
      loggerInfoStub = stub(logger, 'info');
    });

    beforeEach(() => {
      getUserConfigSecretStub.resetHistory();
      loadBudgetStub.resetHistory();
      getAccountsStub.resetHistory();
      addTransactionStub.resetHistory();
      loggerInfoStub.resetHistory();
      getTransactionsForAccountStub.resetHistory();
    });

    after(() => {
      getUserConfigSecretStub.restore();
      loadBudgetStub.restore();
      getAccountsStub.restore();
      addTransactionStub.restore();
      loggerInfoStub.restore();
      getTransactionsForAccountStub.restore();
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

      getTransactionsForAccountStub.resolves([])

      await processBudgetMessage(data);

      // Assert
      expect(loadBudgetStub.calledWith('budget321')).to.equal(true);
      expect(addTransactionStub.getCalls().length).to.equal(1);
      expect(addTransactionStub.getCall(0).args).to.eql([
        {
          memo: 'mcdonalds',
          amount: -80000,
          accountId: 'ynab-account-id-123',
          date: '2020-01-13T20:41:09.685Z',
        },
      ]);
    });
  });
});
