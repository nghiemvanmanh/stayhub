import {
  BookingStatus,
  BookingPaymentOption,
  CancellationPolicy,
} from "../interfaces/enums";
import { Booking, Promotion } from "../interfaces/booking";

export const mockPromotions: Promotion[] = [
  {
    id: 1,
    code: "SUMMER2024",
    description: "Giảm 15% cho kỳ nghỉ hè",
    discountType: "PERCENT",
    discountValue: 15.0,
    startDate: new Date("2024-06-01T00:00:00Z"),
    endDate: new Date("2024-08-31T23:59:59Z"),
    maxUsage: 100,
    usageCount: 25,
    isActive: true,
  },
  {
    id: 2,
    code: "WELCOME500",
    description: "Giảm 500k cho khách mới",
    discountType: "FIXED",
    discountValue: 500000,
    isActive: true,
  },
];

export const mockBookings: Booking[] = [
  {
    id: 1,
    bookingCode: "BKG-A1B2C3D4",
    userId: 1, // Nguyen Van A
    propertyId: 1, // Biệt Thự Đồi Thông Mộng Mơ
    checkInDate: new Date("2024-05-10T00:00:00Z"),
    checkOutDate: new Date("2024-05-12T00:00:00Z"),
    totalNights: 2,
    numAdults: 4,
    numChildren: 2,
    pricePerNight: 2500000,
    totalPrice: 5300000, // (2500k * 2) + 300k cleaning
    cleaningFee: 300000,
    paymentOption: BookingPaymentOption.PAY_IN_FULL,
    depositPercentage: 100,
    depositAmount: 5300000,
    remainingAmount: 0,
    isFullyPaid: true,
    status: BookingStatus.CONFIRMED,
    cancellationPolicy: CancellationPolicy.MODERATE,
    createdAt: new Date("2024-04-15T10:00:00Z"),
  },
  {
    id: 2,
    bookingCode: "BKG-X9Y8Z7",
    userId: 1,
    propertyId: 2, // Căn Hộ Landmark
    checkInDate: new Date("2024-06-20T00:00:00Z"),
    checkOutDate: new Date("2024-06-21T00:00:00Z"),
    totalNights: 1,
    numAdults: 2,
    pricePerNight: 1800000,
    totalPrice: 2000000,
    cleaningFee: 200000,
    paymentOption: BookingPaymentOption.PAY_AT_CHECKIN,
    depositPercentage: 50,
    depositAmount: 1000000,
    remainingAmount: 1000000,
    isFullyPaid: false,
    status: BookingStatus.PENDING,
    cancellationPolicy: CancellationPolicy.STRICT,
    createdAt: new Date("2024-05-01T08:00:00Z"),
  },
];
