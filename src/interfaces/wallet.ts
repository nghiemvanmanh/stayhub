import { PayoutStatus, TransactionType, WalletStatus } from "./enums";

export interface Wallet {
  id: string | number;
  userId: string | number;
  availableBalance: number;
  pendingBalance: number;
  debtBalance: number;
  currency?: string;
  status?: WalletStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface BankAccount {
  id: string | number;
  userId: string | number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branch?: string;
  isDefault?: boolean;
  isVerified?: boolean;
  createdAt?: Date | string;
}

export interface Transaction {
  id: string | number;
  walletId: string | number;
  amount: number;
  balanceAffected?: string;
  type: TransactionType;
  status?: string;
  description?: string;
  bookingId?: string | number;
  payoutId?: string | number;
  createdAt?: Date | string;
}

export interface Payout {
  id: string | number;
  walletId: string | number;
  userId: string | number;
  amount: number;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  status?: PayoutStatus;
  proofImageUrl?: string;
  adminNote?: string;
  processedAt?: Date | string;
  createdAt?: Date | string;
}
