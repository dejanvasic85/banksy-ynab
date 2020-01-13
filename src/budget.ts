import * as ynab from 'ynab';
import * as moment from 'moment';
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
    return this.budget.accounts.map(({ id, name }) => ({
      accountId: id,
      accountName: name,
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

  async getTransactionsForAccount(accountId: string): Promise<BudgetTransaction[]> {
    const sinceDate = moment()
      .subtract(5, 'days')
      .toISOString();

    const results = await this.api.transactions.getTransactionsByAccount(this.budget.id, accountId, sinceDate);
    const data = results.data.transactions.map(({ date, amount, memo }) => ({
      date,
      amount,
      memo,
      accountId,
    }));

    return data;
  }
}

export { Budget };
