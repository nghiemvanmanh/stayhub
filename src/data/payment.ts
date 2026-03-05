import {
  PaymentMethod,
  PaymentStatus,
  PaymentPurpose,
} from "../interfaces/enums";
import { Payment } from "../interfaces/payment";

export const mockPayments: Payment[] = [
  {
    id: 1,
    bookingId: 1, // Booking A1B2C3D4
    userId: 1, // Nguyen Van A
    amount: 5300000,
    paymentMethod: PaymentMethod.VNPAY,
    paymentStatus: PaymentStatus.SUCCESS,
    purpose: PaymentPurpose.FULL_PAYMENT,
    transactionId: "VNPAY-20240415-123456",
    paymentDate: new Date("2024-04-15T10:05:00Z"),
  },
  {
    id: 2,
    bookingId: 2, // Booking X9Y8Z7
    userId: 1,
    amount: 1000000,
    paymentMethod: PaymentMethod.MOMO,
    paymentStatus: PaymentStatus.SUCCESS,
    purpose: PaymentPurpose.DEPOSIT,
    transactionId: "MOMO-20240501-987654",
    paymentDate: new Date("2024-05-01T08:10:00Z"),
  },
];
