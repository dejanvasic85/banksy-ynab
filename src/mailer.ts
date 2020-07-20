import * as sendgrid from '@sendgrid/mail';

import { config } from './config';
import { BankTransaction, TransactionsMessage } from './types';
import logger from './logger';

const toList = (txns: BankTransaction[]): string => {
  return txns.map(t => `<li>$${t.amount.toFixed(2)} <strong>${t.description}</strong></li>`).join('');
};

export const sendEmail = async (
  recipient: string,
  { username, newTxns }: TransactionsMessage,
) => {
  sendgrid.setApiKey(config.sendgridKey);

  let email = `
    <h3>Banksy Transactions</h3>
    <p>Hey <strong>${username}</strong>, your bank has reported some new transactions:</p>
  `;

  if (newTxns.length > 0) {
    email += `
      <ul>
    `;

    email += toList(newTxns);
    email += `</ul>`;
  }

  logger.log('Sending email to ', recipient, 'Email:', email);

  await sendgrid.send({
    to: recipient,
    from: 'ynab@banksy.com',
    subject: 'YNAB Transactions',
    html: email,
  });

  logger.log('Email sent');
};
