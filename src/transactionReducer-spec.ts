import { expect } from 'chai';
import * as moment from 'moment';

import { toTransactionMap, initialTransactionMap } from './transactionReducer';
import { TransactionMap, TransactionType } from './types';

describe('toTransactionMap', () => {
  const today = moment()
    .startOf('day')
    .toISOString();
  const yesterday = moment()
    .subtract(1, 'days')
    .toISOString();
  const twoDaysAgo = moment()
    .subtract(2, 'days')
    .toISOString();

  const transactions: any = [
    {
      amount: -100,
      description: 'mcdonalds',
      date: today,
    },
    {
      amount: -900,
      description: 'ebay',
      date: yesterday,
    },
    {
      amount: 6,
      description: 'PENDING - BARRY PLANT RENT INCOME',
      date: twoDaysAgo,
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
      const result: TransactionMap = transactions.reduce(
        toTransactionMap(bankAccount, budgetTransactions),
        initialTransactionMap,
      );

      // Assert
      expect(result.ignoredDebitTransactions).to.have.lengthOf(0);
      expect(result.ignoredPossibleDuplicates).to.have.lengthOf(0);
      expect(result.transactions).to.eql([
        {
          amount: -100,
          description: 'mcdonalds',
          date: today,
        },
        {
          amount: -900,
          description: 'ebay',
          date: yesterday,
        },
      ]);
      expect(result.ignoredCreditTransactions).to.eql([
        {
          amount: 6,
          description: 'PENDING - BARRY PLANT RENT INCOME',
          date: twoDaysAgo,
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
      const result: TransactionMap = transactions.reduce(
        toTransactionMap(bankAccount, budgetTransactions),
        initialTransactionMap,
      );

      // Assert
      expect(result.ignoredPossibleDuplicates).to.have.lengthOf(0);
      expect(result.ignoredCreditTransactions).to.have.lengthOf(0);
      expect(result.ignoredDebitTransactions).to.eql([
        {
          amount: -100,
          description: 'mcdonalds',
          date: today,
        },
        {
          amount: -900,
          description: 'ebay',
          date: yesterday,
        },
      ]);
      expect(result.transactions).to.eql([
        {
          amount: 6,
          description: 'PENDING - BARRY PLANT RENT INCOME',
          date: twoDaysAgo,
        },
      ]);
    });
  });

  describe('when the budget transactions match on the amount and description', () => {
    it('should ignore possible duplicates', () => {
      const bankAccount: any = {
        accountName: 'Transaction Account',
      };

      const budgetTransactions: any[] = [
        {
          amount: 6000, // Transactions from YNAB come as base Value
          memo: 'Barry Plant Rent Income',
          date: today,
        },
        {
          amount: -9000,
          memo: 'AMZNPRIMEAU MEMBERSHIP+611800064122 AU',
          date: yesterday,
        },
        {
          amount: -8000,
          memo: 'Shorty',
          date: yesterday,
        },
      ];

      const newTransactions = [
        {
          amount: -9,
          description: 'Amznprimeau Membership Sydney South Au',
          date: today,
        },
        {
          amount: -8,
          description: '   shoRTY  ',
          date: today,
        },
      ];

      const bankTransactions = [...transactions, ...newTransactions];

      // Action
      const result: TransactionMap = bankTransactions.reduce(
        toTransactionMap(bankAccount, budgetTransactions),
        initialTransactionMap,
      );

      // Assert
      expect(result.ignoredDebitTransactions).to.have.lengthOf(0);
      expect(result.ignoredCreditTransactions).to.have.lengthOf(0);
      expect(result.ignoredPossibleDuplicates).to.eql([
        {
          amount: 6,
          description: 'PENDING - BARRY PLANT RENT INCOME',
          date: twoDaysAgo,
        },
        {
          amount: -9,
          description: 'Amznprimeau Membership Sydney South Au',
          date: today,
        },
        {
          amount: -8,
          description: '   shoRTY  ',
          date: today,
        },
      ]);
      expect(result.transactions).to.eql([
        {
          amount: -100,
          description: 'mcdonalds',
          date: today,
        },
        {
          amount: -900,
          description: 'ebay',
          date: yesterday,
        },
      ]);
    });
  });
});
