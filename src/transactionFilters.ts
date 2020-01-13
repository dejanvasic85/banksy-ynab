import { BankAccount, TransactionType } from './types';

export const filterTransactionTypes = (account: BankAccount, amount: number): boolean => {
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
