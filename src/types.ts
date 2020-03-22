export interface Config {
  sendgridKey: string;
}

export interface SqsMessage {
  Message: string 
}

export interface BankTransaction {
  amount: number;
  date: string;
  description: string;
}

export interface TransactionsMessage {
  username: string;
  bankId: string;
  accountName: string;
  newTxns: BankTransaction[];
  matchingTxns: BankTransaction[];
  duplicateTxns: BankTransaction[];
}

export enum TransactionType {
  Credit = 'credit',
  Debit = 'debit',
}

export interface BankAccount {
  accountName: string;
  ynabAccountName: string;
  transactionTypes?: TransactionType;
}

export interface Bank {
  bankId: string;
  credentials: string;
  accounts: BankAccount[];
}

export interface UserConfig {
  email: string;
  ynabKey: string;
  ynabBudgetId: string;
  banks: Bank[];
}

export interface BudgetTransaction {
  date: string;
  amount: number;
  memo: string;
  accountId: string;
}

export interface BudgetAccount {
  accountName: string;
  accountId: string;
}
