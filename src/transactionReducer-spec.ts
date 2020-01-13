import { expect } from 'chai';

import { toTransactionMap, initialTransactionMap } from './transactionReducer';
import { TransactionMap, TransactionType } from './types';

describe('toTransactionMap', () => {
  const transactions: any = [
    {
      amount: -100,
      description: 'mcdonalds',
    },
    {
      amount: -900,
      description: 'ebay',
    },
    {
      amount: 200,
      description: 'rental income',
    },
  ];

  describe('when the bank account is debit only', () => {
    it('transactions should be negative only', () => {
      const bankAccount: any = {
        transactionTypes: TransactionType.Debit,
        accountName: 'Transaction Account',
      };

      const budgetTransactions: any[] = [];

      // Action
      const result: TransactionMap = transactions.reduce(toTransactionMap(bankAccount, budgetTransactions), initialTransactionMap);

      // Assert
      expect(result.ignoredDebitTransactions).to.have.lengthOf(0);
      expect(result.ignoredPossibleDuplicates).to.have.lengthOf(0);
      expect(result.transactions).to.eql([
        {
          amount: -100,
          description: 'mcdonalds',
        },
        {
          amount: -900,
          description: 'ebay',
        },
      ]);
      expect(result.ignoredCreditTransactions).to.eql([
        {
          amount: 200,
          description: 'rental income',
        },
      ]);
    });
  });

  describe('when the bank account is credit only', () => {
    it('transactions should be positive only', () => {
      const bankAccount: any = {
        transactionTypes: TransactionType.Credit,
        accountName: 'Transaction Account',
      };

      const budgetTransactions: any[] = [];

      // Action
      const result: TransactionMap = transactions.reduce(toTransactionMap(bankAccount, budgetTransactions), initialTransactionMap);

      // Assert
      expect(result.ignoredPossibleDuplicates).to.have.lengthOf(0);
      expect(result.ignoredCreditTransactions).to.have.lengthOf(0);
      expect(result.ignoredDebitTransactions).to.eql([
        {
          amount: -100,
          description: 'mcdonalds',
        },
        {
          amount: -900,
          description: 'ebay',
        },
      ]);
      expect(result.transactions).to.eql([
        {
          amount: 200,
          description: 'rental income',
        },
      ]);
    });
  });
});
