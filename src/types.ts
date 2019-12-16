export interface BankTransaction {
  amount: number;
  description: string;
}

export interface TransactionsMessage {
  username: string;
  bankId: string;
  accountName: string;
  transactions: BankTransaction[];
}

export interface BankAccount {
  accountName: string;
  ynabAccountName: string;
}

export interface Bank {
  bankId: string;
  credentials: string;
  accounts: BankAccount[];
}

export interface UserConfig {
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