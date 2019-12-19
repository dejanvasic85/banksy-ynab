import { TransactionsMessage, UserConfig, TransactionType, BankAccount } from './types';
import { getSecret } from './secretFetcher';
import { Budget } from './budget';

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

export const processTransactions = async (data: TransactionsMessage): Promise<void> => {
  console.log('YNAB Handler: Received message', data);

  const userSecret = await getSecret(data.username);
  const cfg: UserConfig = JSON.parse(userSecret);
  const bank = cfg.banks.find(b => b.bankId === data.bankId);
  const account = bank.accounts.find(a => a.accountName === data.accountName);

  const budget = new Budget(cfg.ynabKey);
  await budget.loadBudget(cfg.ynabBudgetId);
  const { accountId } = budget.getAccounts().find(ba => ba.accountName === account.ynabAccountName);

  for (const { amount, description } of data.transactions) {
    const today = new Date().toISOString();
    const baseAmount = amount * AUD_BASE;

    if (!shouldCreateTransaction(account, amount)) {
      continue;
    }

    await budget.addTransaction({
      date: today,
      memo: description,
      amount: baseAmount,
      accountId,
    });
  }
};
