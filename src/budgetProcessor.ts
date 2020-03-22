import logger from './logger';
import { TransactionsMessage } from './types';
import { getUserConfigSecret } from './secretFetcher';
import { Budget } from './budget';
import { sendEmail } from './mailer';
import { toBaseValue } from './money';

export const processBudgetMessage = async (data: TransactionsMessage): Promise<void> => {
  logger.info('YNAB Handler: Received message', data);

  const { email, banks, ynabBudgetId, ynabKey } = await getUserConfigSecret(data.username);
  const bank = banks.find(b => b.bankId === data.bankId);
  const account = bank.accounts.find(a => a.accountName === data.accountName);

  const budget = new Budget(ynabKey);
  await budget.loadBudget(ynabBudgetId);
  const { accountId } = budget.getAccounts().find(ba => ba.accountName === account.ynabAccountName);

  for (const { amount, date, description } of data.newTxns) {
    await budget.addTransaction({
      date,
      memo: description,
      amount: toBaseValue(amount),
      accountId,
    });
  }

  await sendEmail(email, data);
};
