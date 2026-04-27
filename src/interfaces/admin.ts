// =============================================
// Admin API Response Interfaces
// =============================================

// Generic paginated response wrapper
export interface PaginatedResponse<T> {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElements: number;
  items: T[];
}

// =============================================
// Host Applications
// =============================================
export interface HostApplicationItem {
  hostId: number;
  hostCode: string;
  fullName: string;
  hostAvatarUrl: string;
  email: string;
  businessPhone: string;
  supportEmail: string;
  identityCardNumber: string;
  identityCardFrontUrl: string;
  identityCardBackUrl: string;
  businessLicenseNumber: string;
  businessLicenseUrl: string;
  onboardingStatus: string;
  reviewNote: string;
  createdAt: string;
}

export interface HostApplicationAmenity {
  id: number;
  name: string;
  iconName: string;
  type: string;
}

export interface HostApplicationHost {
  id: number;
  fullName: string;
  avatarUrl: string;
  joinedAt: string;
}

export interface HostApplicationCancellationPolicy {
  id: number;
  name: string;
  description: string;
  refundPercentage: number;
  daysBeforeCheckin: number;
}

export interface HostApplicationPriceBreakdown {
  date: string;
  price: number;
}

export interface HostApplicationRoom {
  id: number;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  numBeds: number;
  numBathrooms: number;
  amenities: HostApplicationAmenity[];
  thumbnailUrl: string;
  blockedDates: string[];
  calculatedTotalPrice: number;
  priceBreakdown: HostApplicationPriceBreakdown[];
}

export interface HostApplicationPropertyDetail {
  id: number;
  name: string;
  slug: string;
  imageUrls: string[];
  amenities: HostApplicationAmenity[];
  host: HostApplicationHost;
  description: string;
  addressDetail: string;
  ward: string;
  district: string;
  province: string;
  latitude: number;
  longitude: number;
  roomCount: number;
  maxGuests: number;
  numBedrooms: number;
  numBeds: number;
  numBathrooms: number;
  cleaningFee: number;
  weekendSurchargePercentage: number;
  isPayAtCheckinAllowed: boolean;
  depositPercentage: number;
  cancellationPolicyResponse: HostApplicationCancellationPolicy;
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
  rooms: HostApplicationRoom[];
}

export interface HostApplicationDetail extends HostApplicationItem {
  propertyDetailResponse: HostApplicationPropertyDetail;
}

export interface HostApprovalRequest {
  status: "APPROVED" | "REJECTED";
  reviewNote: string;
}

// =============================================
// Admin Properties
// =============================================
export interface AdminPropertyItem {
  id: number;
  thumbnailUrl: string;
  name: string;
  slug: string;
  hostName: string;
  hostAvatarUrl: string;
  hostEmail: string;
  categoryName: string;
  province: string;
  district: string;
  status: string;
  createdAt: string;
  // Additional columns (nullable, for future API extension)
  pricePerNight?: number;
  ratingAvg?: number;
  reviewCount?: number;
  roomCount?: number;
  maxGuests?: number;
}

// =============================================
// Admin Payouts
// =============================================
export interface AdminPayoutItem {
  id: number;
  hostEmail: string;
  hostName: string;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  status: string;
  adminNote: string;
  bankTransactionRef: string;
  createdAt: string;
  processedAt: string;
  // Additional columns (nullable, for future API extension)
  hostAvatarUrl?: string;
  walletId?: number;
  requestedAmount?: number;
}

// =============================================
// Admin Disputes
// =============================================
export interface AdminDisputeItem {
  id: number;
  bookingCode: string;
  creatorId: number;
  creatorEmail: string;
  creatorRole: string;
  creatorName: string;
  reason: string;
  evidenceImageUrls: string;
  status: string;
  createdAt: string;
}

// =============================================
// Admin Subscription Plans
// =============================================
export interface AdminSubscriptionPlan {
  id: number;
  name: string;
  description: string;
  tier: string;
  price: number;
  durationMonths: number;
  maxListings: number;
  commissionRate: number;
  creditLimit: number;
}
