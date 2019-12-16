import { TransactionsMessage, UserConfig } from './types';
import { getSecret } from './secretFetcher';
import { Budget } from './budget';

const AUD_BASE = 1000;

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

    await budget.addTransaction({
      date: today,
      memo: description,
      amount: baseAmount,
      accountId,
    });
  }
};
