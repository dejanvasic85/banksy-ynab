import { expect } from 'chai';
import { stub } from 'sinon';

import { ynab } from './handler';
import logger from './logger';
import * as budgetProcessor from './budgetProcessor';

describe('handler', () => {
  let loggerStub: any;
  let processStub: any;

  before(() => {
    loggerStub = stub(logger, 'error');
    processStub = stub(budgetProcessor, 'processBudgetMessage');
  });

  afterEach(() => {
    loggerStub.resetHistory();
    processStub.resetHistory();
  });

  after(() => {
    loggerStub.restore();
    processStub.restore();
  });

  describe('ynab', () => {
    const handlerContext = {} as any;
    const handlerCallback = () => null;
    const baseEvent: any = {
      Records: [],
    };

    const now = new Date().toISOString();
    const testTransactions = [
      {
        date: now,
        amount: -5,
        description: `Test Transaction ${now}`,
      },
    ];

    const snsMessage = {
      username: 'john',
      bankId: 'aaa',
      accountName: 'Savings',
      transactions: testTransactions,
    };

    it('should parse the message and call the processor', async () => {
      const sqsMessage: any = {
        Message: JSON.stringify(snsMessage),
      };

      const body = JSON.stringify(sqsMessage);

      const event = {
        ...baseEvent,
        Records: [{ body }],
      };

      await ynab(event, handlerContext, handlerCallback);

      expect(processStub.getCall(0).args).to.eql([snsMessage]);
      expect(loggerStub.getCalls()).to.have.lengthOf(0);
    });

    it('should log an error when it cannot parse', async () => {
      const event = {
        ...baseEvent,
        Records: [{ body: 'really bad data' }],
      };

      try {
        await ynab(event, handlerContext, handlerCallback);
      } catch (err) {
        expect(loggerStub.getCalls()).to.have.lengthOf(1);
      }
    });
  });
});
