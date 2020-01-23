import { Budget } from '../src/budget';
import { expect } from 'chai';

const { YNAB_KEY, YNAB_BUDGET_ID, YNAB_ACCOUNT_ID } = process.env;

describe('Budget Integration tests', () => {
  it('can fetch the transactions', async () => {
    const budget = new Budget(YNAB_KEY);
    await budget.loadBudget(YNAB_BUDGET_ID);

    const txns = await budget.getTransactionsForAccount(YNAB_ACCOUNT_ID);
    expect(txns).to.be.an('array');
  });
});
