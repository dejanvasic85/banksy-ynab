import { expect } from 'chai';
import { createSandbox, stub } from 'sinon';
import * as sendGrid from '@sendgrid/mail';
import { sendEmail } from './mailer';
import { config } from './config';

describe('mailer', () => {
  let setApiKeyStub;
  let sendStub;
  let sandbox;

  before(() => {
    setApiKeyStub = stub(sendGrid, 'setApiKey');
    sendStub = stub(sendGrid, 'send');

    sandbox = createSandbox();
    sandbox.stub(config, 'sendgridKey').value('sendgrid-1234');
  });

  beforeEach(() => {
    setApiKeyStub.resetHistory();
    sendStub.resetHistory();
  });

  after(() => {
    setApiKeyStub.restore();
    sendStub.restore();
    sandbox.restore();
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
        html: `\n    <h3>Banksy Transactions</h3>\n    <p>Hey: cool person, your bank has reported some new transactions:</p>\n  \n      <h4>Saved Transactions</h4>\n      <ul>\n    20 KFC 20/02/2020</ul>\n      <h4>Possible Duplicates</h4>\n      <ul>\n    10 McDonalds 10/02/2019</ul>`,
      },
      false,
    ]);
  });
});
