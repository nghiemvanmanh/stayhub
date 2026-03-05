import {
  BookingPaymentOption,
  BookingStatus,
  CancellationPolicy,
} from "./enums";

export interface Promotion {
  id: string | number;
  code: string;
  description?: string;
  discountType?: string;
  discountValue: number;
  startDate?: Date | string;
  endDate?: Date | string;
  maxUsage?: number;
  usageCount?: number;
  isActive?: boolean;
}

export interface Booking {
  id: string | number;
  bookingCode: string;
  userId: string | number;
  propertyId: string | number;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  totalNights: number;
  numAdults?: number;
  numChildren?: number;
  numInfants?: number;
  pricePerNight: number;
  totalPrice: number;
  cleaningFee?: number;
  serviceFee?: number;
  discountAmount?: number;
  promotionId?: string | number;
  paymentOption: BookingPaymentOption;
  depositPercentage: number;
  depositAmount: number;
  remainingAmount: number;
  isFullyPaid?: boolean;
  status: BookingStatus;
  note?: string;
  cancellationPolicy: CancellationPolicy;
  cancellationReason?: string;
  cancelledAt?: Date | string;
  cancelledBy?: string | number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
