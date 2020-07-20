import { expect } from 'chai';
import { createSandbox, stub } from 'sinon';
import * as sendGrid from '@sendgrid/mail';

import { sendEmail } from './mailer';
import { config } from './config';
import logger from './logger';

describe('mailer', () => {
  let setApiKeyStub;
  let sendStub;
  let sandbox;
  let loggerStub;

  before(() => {
    setApiKeyStub = stub(sendGrid, 'setApiKey');
    sendStub = stub(sendGrid, 'send');
    loggerStub = stub(logger, 'log');

    sandbox = createSandbox();
    sandbox.stub(config, 'sendgridKey').value('sendgrid-1234');
  });

  beforeEach(() => {
    setApiKeyStub.resetHistory();
    sendStub.resetHistory();
    loggerStub.resetHistory();
  });

  after(() => {
    setApiKeyStub.restore();
    sendStub.restore();
    sandbox.restore();
    loggerStub.restore();
  });

  it('sends structured html mail with new transactions', async () => {
    const recipient = 'test@email.com';
    const data: any = {
      username: 'cool-username-bro',
      newTxns: [
        {
          amount: 20,
          date: '20/02/2020',
          description: 'KFC',
        },
      ],
    };

    await sendEmail(recipient, data);

    expect(sendStub.getCalls()).to.have.lengthOf(1);
  });
});
