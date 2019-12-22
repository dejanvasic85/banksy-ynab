import logger from './logger';
import { TransactionsMessage, TransactionType, BankAccount } from './types';
import { getUserConfigSecret } from './secretFetcher';
import { Budget } from './budget';
import * as moment from 'moment';

const AUD_BASE = 1000;

export const shouldCreateTransaction = (account: BankAccount, amount: number): boolean => {
  if (!account.transactionTypes) {
    return true;
  }

  if (amount > 0 && account.transactionTypes === TransactionType.Credit) {
    return true;
  }

  if (amount < 0 && account.transactionTypes === TransactionType.Debit) {
    return true;
  }

  return false;
};

export const parseDate = (text: string) : string => {
  return moment(text).format('YYYY-MM-DD');
}

export const processTransactions = async (data: TransactionsMessage): Promise<void> => {
  logger.info('YNAB Handler: Received message', data);

  const { banks, ynabBudgetId, ynabKey } = await getUserConfigSecret(data.username);
  const bank = banks.find(b => b.bankId === data.bankId);
  const account = bank.accounts.find(a => a.accountName === data.accountName);

  const budget = new Budget(ynabKey);
  await budget.loadBudget(ynabBudgetId);
  const { accountId } = budget.getAccounts().find(ba => ba.accountName === account.ynabAccountName);

  for (const { amount, date, description } of data.transactions) {
    const baseAmount = amount * AUD_BASE;

    if (!shouldCreateTransaction(account, amount)) {
      logger.info(`Account is flagged for ${account.transactionTypes} transactions only. Skipping transaction.`);
      continue;
    }

    await budget.addTransaction({
      date: parseDate(date),
      memo: description,
      amount: baseAmount,
      accountId,
    });
  }
};
