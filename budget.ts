import * as ynab from 'ynab';
import { IBudget } from './types';

class Budget implements IBudget {
  api: ynab.api;
  
  constructor(apiKey: string) {
    this.api = new ynab.API(apiKey);
  }

  async getBudgets() {
    this.api.budgets.getBudgets()
  }

  async getAccounts() {
    throw new Error("Method not implemented.");
  }
}

export {
  Budget
};