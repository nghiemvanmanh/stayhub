import { BookingStatus } from "./enums";
import { Room } from "./room";

export interface Reserve {
  id: string | number;
  roomId: string | number;
  propertyId: string | number;
  bookingId?: string | number;
  userId: string | number;
  startDate: string | Date;
  endDate: string | Date;
  status: BookingStatus;
  pricePerNight: number;
  totalPrice: number;
  guestCount: number;
  numAdults?: number;
  numChildren?: number;
  numInfants?: number;
  note?: string;
  room?: Room; // Room when populated
  property?: any; // Avoiding circular reference with Property
  booking?: any; // Avoiding circular reference with Booking
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
