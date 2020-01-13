import { TransactionMap, BankTransaction, BankAccount, BudgetTransaction, TransactionType } from './types';

export const initialTransactionMap: TransactionMap = {
  ignoredCreditTransactions: [],
  ignoredDebitTransactions: [],
  ignoredPossibleDuplicates: [],
  transactions: [],
};

export const toTransactionMap = (account: BankAccount, _: BudgetTransaction[]): any => {
  return (acc: TransactionMap, txn: BankTransaction): TransactionMap => {
    if (account.transactionTypes === TransactionType.Debit && txn.amount > 0) {
      // This bank account only cares for negative transactions, so ignore the positive
      return {
        ...acc,
        ignoredCreditTransactions: [...acc.ignoredCreditTransactions, txn],
      };
    }

    if (account.transactionTypes === TransactionType.Credit && txn.amount < 0) {
      // This bank account only cares for positive transactions, so ignore the negative
      return {
        ...acc,
        ignoredDebitTransactions: [...acc.ignoredDebitTransactions, txn],
      };
    }

    return {
      ...acc,
      transactions: [...acc.transactions, txn],
    };
  };
};
