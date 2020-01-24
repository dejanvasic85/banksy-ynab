import { config } from './config';
import { BankTransaction } from './types';
import * as sendgrid from '@sendgrid/mail';
import logger from './logger';

const toList = (txns: BankTransaction[]): string => {
  return txns.map(t => `<li>$${t.amount.toFixed(2)} <strong>${t.description}</strong> ${t.date}</li>`).join('');
};

export const sendEmail = async (
  recipient: string,
  username: string,
  savedTransactions: BankTransaction[],
  possibleDuplicateTransactions: BankTransaction[],
) => {
  sendgrid.setApiKey(config.sendgridKey);

  let email = `
    <h3>Banksy Transactions</h3>
    <p>Hey <strong>${username}</strong>, your bank has reported some new transactions:</p>
  `;

  if (savedTransactions.length > 0) {
    email += `
      <ul>
    `;

    email += toList(savedTransactions);
    email += `</ul>`;
  }

  if (possibleDuplicateTransactions.length > 0) {
    email += `
      <h4>Possible Duplicates</h4>
      <p>Looks like these were added already and are being settled by your bank. Have a quick look and if they are new, please add them manually:</p>
      <ul>
    `;

    email += toList(possibleDuplicateTransactions);
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
