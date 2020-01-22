import { config } from './config';
import { BankTransaction } from './types';
import { setApiKey, send } from '@sendgrid/mail';

setApiKey(config.sendgridKey);

const toList = (txns: BankTransaction[]): string => {
  return txns.map(t => `${t.amount} ${t.description} ${t.date}`).join('');
};

export const sendEmail = async (
  recipient: string,
  username: string,
  savedTransactions: BankTransaction[],
  possibleDuplicateTransactions: BankTransaction[],
) => {
  let email = `
    <h3>Banksy Transactions</h3>
    <p>Hey: ${username}, your bank has reported some new transactions:</p>
  `;

  if (savedTransactions.length > 0) {
    email += `
      <h4>Saved Transactions</h4>
      <ul>
    `;

    email += toList(savedTransactions);
    email += `</ul>`;
  }

  if (possibleDuplicateTransactions.length > 0) {
    email += `
      <h4>Possible Duplicates</h4>
      <ul>
    `;

    email += toList(possibleDuplicateTransactions);
    email += `</ul>`;
  }

  await send(
    {
      to: recipient,
      from: 'ynab@banksy.com',
      subject: 'YNAB Transactions',
      html: email,
    },
    false,
  );
};
