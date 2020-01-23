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

  it('sends structured html mail with new and duplicated transactions', async () => {
    const recipient = 'test@email.com';
    const username = 'cool person';
    const saved = [
      {
        amount: 20,
        date: '20/02/2020',
        description: 'KFC',
      },
    ];
    const possibleDuplicates = [
      {
        amount: 10,
        date: '10/02/2019',
        description: 'McDonalds',
      },
    ];

    await sendEmail(recipient, username, saved, possibleDuplicates);

    expect(sendStub.getCall(0).args).to.eql([
      {
        to: 'test@email.com',
        from: 'ynab@banksy.com',
        subject: 'YNAB Transactions',
        html: `\n    <h3>Banksy Transactions</h3>\n    <p>Hey <strong>cool person</strong>, your bank has reported some new transactions:</p>\n  \n      <ul>\n    $20.00 <strong>KFC</strong> 20/02/2020</ul>\n      <h4>Possible Duplicates</h4>\n      <p>Looks like these were added already and are being settled by your bank. Have a quick look and if they are new, please add them manually:</p>\n      <ul>\n    $10.00 <strong>McDonalds</strong> 10/02/2019</ul>`,
      },
    ]);
  });
});
