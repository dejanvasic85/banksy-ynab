import * as ynab from 'ynab';
import { BudgetAccount, BudgetTransaction } from './types';

class Budget {
  api: ynab.api;
  budget: ynab.BudgetDetail;

  constructor(apiKey: string) {
    this.api = new ynab.API(apiKey);
  }

  async loadBudget(ynabBudgetId: string): Promise<void> {
    const budgetResponse = await this.api.budgets.getBudgetById(ynabBudgetId);
    this.budget = budgetResponse.data.budget;
  }

  getAccounts(): BudgetAccount[] {
    return this.budget.accounts.map(a => ({
      accountId: a.id,
      accountName: a.name,
    }));
  }

  async addTransaction({ accountId, date, amount, memo }: BudgetTransaction): Promise<void> {
    const transaction: ynab.SaveTransaction = {
      account_id: accountId,
      cleared: ynab.SaveTransaction.ClearedEnum.Cleared,
      date,
      amount,
      memo,

      // Todo - this should be automatically figured out based on past transactions also
      payee_id: null,
      category_id: null,
    };

    await this.api.transactions.createTransaction(this.budget.id, { transaction });
  }
}

export { Budget };
