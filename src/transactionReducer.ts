import { TransactionMap, BankTransaction, BankAccount, BudgetTransaction, TransactionType } from './types';
import { fromBaseValue } from './money';

export const initialTransactionMap: TransactionMap = {
  ignoredCreditTransactions: [],
  ignoredDebitTransactions: [],
  ignoredPossibleDuplicates: [],
  transactions: [],
};

const clean = (val: string): string => {
  return (val || '')
    .toLowerCase()
    .replace(/pending - /, '')
    .substr(0, 10)
    .trim();
};

export const isMemoSimilar = (firstMemo: string, secondMemo: string): boolean => {
  return clean(firstMemo) === clean(secondMemo);
};

export const toTransactionMap = (account: BankAccount, budgetTransactions: BudgetTransaction[]): any => {
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

    if (
      budgetTransactions.some(
        ({ amount, memo }) => fromBaseValue(amount) === txn.amount && isMemoSimilar(memo, txn.description),
      )
    ) {
      return {
        ...acc,
        ignoredPossibleDuplicates: [...acc.ignoredPossibleDuplicates, txn],
      };
    }

    return {
      ...acc,
      transactions: [...acc.transactions, txn],
    };
  };
};
