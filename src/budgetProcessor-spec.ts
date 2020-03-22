import { expect } from 'chai';
import { stub } from 'sinon';
import { processBudgetMessage } from './budgetProcessor';
import { BankTransaction } from './types';
import logger from './logger';
import * as secretFetcher from './secretFetcher';
import * as budget from './budget';
import * as mailer from './mailer';

describe('budgetProcessor', () => {
  describe('processBudgetMessage', () => {
    let getUserConfigSecretStub;
    let loadBudgetStub;
    let getAccountsStub;
    let addTransactionStub;
    let loggerInfoStub;
    let sendEmailStub;

    const newTxns: BankTransaction[] = [
      {
        amount: -80,
        date: '2020-01-13T20:41:09.685Z',
        description: 'mcdonalds',
      },
    ];

    const data: any = {
      bankId: 'cba',
      accountName: 'savings',
      username: 'john',
      newTxns,
    };

    before(() => {
      getUserConfigSecretStub = stub(secretFetcher, 'getUserConfigSecret');
      loadBudgetStub = stub(budget.Budget.prototype, 'loadBudget');
      getAccountsStub = stub(budget.Budget.prototype, 'getAccounts');
      addTransactionStub = stub(budget.Budget.prototype, 'addTransaction');
      loggerInfoStub = stub(logger, 'info');
      sendEmailStub = stub(mailer, 'sendEmail');
    });

    beforeEach(() => {
      getUserConfigSecretStub.resetHistory();
      loadBudgetStub.resetHistory();
      getAccountsStub.resetHistory();
      addTransactionStub.resetHistory();
      loggerInfoStub.resetHistory();
      sendEmailStub.resetHistory();
    });

    after(() => {
      getUserConfigSecretStub.restore();
      loadBudgetStub.restore();
      getAccountsStub.restore();
      addTransactionStub.restore();
      loggerInfoStub.restore();
      sendEmailStub.restore();
    });

    it('should post messages to YNAB', async () => {
      getUserConfigSecretStub.resolves({
        email: 'john@email.com',
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

      await processBudgetMessage(data);

      // Assert
      expect(sendEmailStub.getCall(0).args).to.eql(['john@email.com', data]);
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
