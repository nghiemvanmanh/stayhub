import { DisputeStatus } from "./enums";

export interface Dispute {
  id: string | number;
  bookingId: string | number;
  creatorId: string | number;
  reason: string;
  description?: string;
  evidenceImageUrls?: string;
  status: DisputeStatus;
  adminNote?: string;
  resolvedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface BookingItem {
  bookingCode: string;
  thumbnailUrl: string;
  propertyName: string;
  propertyAddress: string;
  hostName: string;
  hostPhone: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface BookingsResponse {
  data: {
    pageNo: number;
    pageSize: number;
    totalPage: number;
    totalElements: number;
    items: BookingItem[];
  };
}
