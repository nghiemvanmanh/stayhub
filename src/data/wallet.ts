import {
  WalletStatus,
  TransactionType,
  PayoutStatus,
} from "../interfaces/enums";
import { Wallet, BankAccount, Transaction, Payout } from "../interfaces/wallet";

export const mockWallets: Wallet[] = [
  {
    id: 1,
    userId: 2, // Host Le Thi B
    availableBalance: 15300000,
    pendingBalance: 5300000, // From upcoming booking 1
    debtBalance: 0,
    currency: "VND",
    status: WalletStatus.ACTIVE,
  },
];

export const mockBankAccounts: BankAccount[] = [
  {
    id: 1,
    userId: 2,
    bankName: "Vietcombank",
    accountNumber: "0123456789",
    accountHolderName: "LE THI B",
    branch: "Chi nhanh HCM",
    isDefault: true,
    isVerified: true,
    createdAt: new Date("2024-01-15T10:00:00Z"),
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 1,
    walletId: 1,
    amount: 5300000,
    balanceAffected: "PENDING",
    type: TransactionType.BOOKING_INCOME,
    status: "SUCCESS",
    description: "Nhận tiền đặt phòng BKG-A1B2C3D4",
    bookingId: 1,
    createdAt: new Date("2024-04-15T10:05:00Z"),
  },
  {
    id: 2,
    walletId: 1,
    amount: -795000, // 15% system fee of 5300000
    balanceAffected: "AVAILABLE",
    type: TransactionType.SYSTEM_FEE,
    status: "SUCCESS",
    description: "Phí hệ thống đơn BKG-A1B2C3D4",
    bookingId: 1,
    createdAt: new Date("2024-04-15T10:05:00Z"),
  },
];

export const mockPayouts: Payout[] = [
  {
    id: 1,
    walletId: 1,
    userId: 2,
    amount: 5000000,
    bankName: "Vietcombank",
    accountNumber: "0123456789",
    accountHolderName: "LE THI B",
    status: PayoutStatus.COMPLETED,
    processedAt: new Date("2024-03-01T14:30:00Z"),
    createdAt: new Date("2024-03-01T10:00:00Z"),
    adminNote: "Transfer done",
  },
];
