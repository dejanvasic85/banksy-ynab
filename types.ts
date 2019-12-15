export interface BankTransaction {
  amount: number;
  description: string;
}

export interface TransactionsMessage {
  username: string;
  bankId: string;
  accountName: string;
  ynabAccountName: string;
  transactions: BankTransaction[];
}

export interface BankAccount {
  accountName: string;
}

export interface Bank {
  bankId: string;
  credentials: string;
  accounts: BankAccount[];
}

export interface UserConfig {
  ynabKey: string;
  banks: Bank[];
}