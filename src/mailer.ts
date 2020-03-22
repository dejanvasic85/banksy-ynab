import * as sendgrid from '@sendgrid/mail';

import { config } from './config';
import { BankTransaction, TransactionsMessage } from './types';
import logger from './logger';

const toList = (txns: BankTransaction[]): string => {
  return txns.map(t => `<li>$${t.amount.toFixed(2)} <strong>${t.description}</strong></li>`).join('');
};

export const sendEmail = async (
  recipient: string,
  { username, newTxns, duplicateTxns, matchingTxns }: TransactionsMessage,
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

  if (duplicateTxns.length > 0) {
    email += `
      <h4>Possible Duplicates Transactions</h4>
      <p>Looks like these were added already and are being settled by your bank. Have a quick look and if they are new, please add them manually:</p>
      <ul>
    `;

    email += toList(duplicateTxns);
    email += `</ul>`;
  }

  if (matchingTxns.length > 0) {
    email += `
      <h4>Matching Transactions</h4>
      <p>These have been identified as idential and already added to YNAB:</p>
      <ul>
    `;

    email += toList(duplicateTxns);
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
