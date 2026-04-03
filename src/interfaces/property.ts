import {
  CancellationPolicy,
  PropertyPaymentType,
  PropertyStatus,
  RentalType,
} from "./enums";
import { Room } from "./room";
import { Reserve } from "./reserve";

export interface Category {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface Amenity {
  id: string | number;
  name: string;
  iconName?: string;
  iconUrl?: string;
  type?: string;
}

// API response item for /properties list
export interface PropertyListItem {
  id: number;
  name: string;
  slug: string;
  province: string;
  district: string;
  pricePerNight: number;
  thumbnailUrl: string;
  ratingAvg: number;
  maxGuests: number;
  numBedrooms: number;
  numBeds: number;
  numBathrooms: number;
  amenities: string[];
}

// API response for /properties list (paginated)
export interface PropertyListResponse {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElements: number;
  items: PropertyListItem[];
}

// API response for /properties/{slug} detail
export interface PropertyDetailHost {
  id: number;
  hostCode: string;
  fullName: string;
  avatarUrl: string;
  joinedAt: string;
}

export interface CancellationPolicyResponse {
  id: number;
  name: string;
  description: string;
  refundPercentage: number;
  daysBeforeCheckin: number;
}

export interface PropertyDetailRoom {
  id: number;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  numBeds: number;
  numBathrooms: number;
  numBedrooms?: number;
  roomCount?: number;
  amenities: Amenity[];
  thumbnailUrl: string;
  cancellationPolicyResponse: CancellationPolicyResponse;
  blockedDates: string[];
}

export interface PropertyDetail {
  id: number;
  name: string;
  slug: string;
  imageUrls: string[];
  amenities: Amenity[];
  host: PropertyDetailHost;
  description: string;
  addressDetail: string;
  ward: string;
  district: string;
  province: string;
  latitude: number;
  longitude: number;
  maxGuests: number;
  numBedrooms: number;
  numBeds: number;
  numBathrooms: number;
  roomCount?: number;
  cleaningFee: number;
  weekendSurchargePercentage: number;
  depositPercentage: number;
  isPayAtCheckinAllowed: boolean;
  checkInAfter: string;
  checkInBefore: string;
  checkOutAfter: string;
  checkOutBefore: string;
  isInstantBook: boolean;
  isSmokingAllowed: boolean;
  isPetsAllowed: boolean;
  isPartyAllowed: boolean;
  ratingAvg: number;
  reviewCount: number;
  categoryName: string;
  rentalTypeName: string;
  rentalTypeSlug: string;
  rooms: PropertyDetailRoom[];
}

// Legacy interface kept for backward-compatibility (used in some mock data files)
export interface Property {
  id: string | number;
  hostId: string | number;
  categoryId: string | number;
  rentalType: RentalType;
  name: string;
  slug: string;
  description?: string;
  addressDetail?: string;
  ward?: string;
  district?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  maxGuests: number;
  numBedrooms?: number;
  numBeds?: number;
  numBathrooms?: number;
  pricePerNight: number;
  cleaningFee?: number;
  currency?: string;
  checkinAfter?: string;
  checkoutBefore?: string;
  cancellationPolicy: CancellationPolicy;
  allowedPaymentTypes: PropertyPaymentType[];
  depositPercent?: number;
  isInstantBook?: boolean;
  isSmokingAllowed?: boolean;
  isPetsAllowed?: boolean;
  isPartyAllowed?: boolean;
  status: PropertyStatus;
  ratingAvg?: number;
  reviewCount?: number;
  rooms?: Room[]; // Array of Room
  reserves?: Reserve[]; // Array of Reserve
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface PropertyImage {
  id: string | number;
  propertyId: string | number;
  url: string;
  caption?: string;
  isThumbnail?: boolean;
  displayOrder?: number;
}

export interface PropertyAmenity {
  propertyId: string | number;
  amenityId: string | number;
}

export interface PropertyAvailability {
  id: string | number;
  propertyId: string | number;
  date: Date | string;
  isAvailable?: boolean;
  priceModifier?: number;
}
