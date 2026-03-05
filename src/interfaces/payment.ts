import { PaymentMethod, PaymentPurpose, PaymentStatus } from "./enums";

export interface Payment {
  id: string | number;
  bookingId: string | number;
  userId: string | number;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  purpose: PaymentPurpose;
  transactionId?: string;
  paymentDate?: Date | string;
}
