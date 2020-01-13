import logger from './logger';
import { TransactionsMessage, TransactionMap } from './types';
import { getUserConfigSecret } from './secretFetcher';
import { Budget } from './budget';
import { toTransactionMap, initialTransactionMap } from './transactionReducer';

const AUD_BASE = 1000;

export const processBudgetMessage = async (data: TransactionsMessage): Promise<void> => {
  logger.info('YNAB Handler: Received message', data);

  const { banks, ynabBudgetId, ynabKey } = await getUserConfigSecret(data.username);
  const bank = banks.find(b => b.bankId === data.bankId);
  const account = bank.accounts.find(a => a.accountName === data.accountName);

  const budget = new Budget(ynabKey);
  await budget.loadBudget(ynabBudgetId);
  const { accountId } = budget.getAccounts().find(ba => ba.accountName === account.ynabAccountName);

  const transactionMap: TransactionMap = data.transactions.reduce(toTransactionMap(account, []), initialTransactionMap);

  for (const { amount, date, description } of transactionMap.transactions) {
    const baseAmount = amount * AUD_BASE;

    await budget.addTransaction({
      date,
      memo: description,
      amount: baseAmount,
      accountId,
    });
  }
};
