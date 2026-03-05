import { CancellationPolicy, PropertyStatus, RentalType } from "./enums";

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
  iconUrl?: string;
  type?: string;
}

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
  isInstantBook?: boolean;
  isSmokingAllowed?: boolean;
  isPetsAllowed?: boolean;
  isPartyAllowed?: boolean;
  status: PropertyStatus;
  ratingAvg?: number;
  reviewCount?: number;
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
