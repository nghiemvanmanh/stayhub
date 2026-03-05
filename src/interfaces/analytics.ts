export interface AnalyticsDailySystem {
  id: string | number;
  date: Date | string;
  totalGmv?: number;
  totalSystemFee?: number;
  newUsers?: number;
  newHosts?: number;
  newBookings?: number;
  activeListings?: number;
  createdAt?: Date | string;
}

export interface AnalyticsDailyHost {
  id: string | number;
  hostId: string | number;
  date: Date | string;
  totalEarnings?: number;
  totalBookings?: number;
  cancelledBookings?: number;
  averageRatingDaily?: number;
  createdAt?: Date | string;
}

export interface AnalyticsProperty {
  id: string | number;
  propertyId: string | number;
  date: Date | string;
  pageViews?: number;
  isBooked?: boolean;
  revenueDaily?: number;
  createdAt?: Date | string;
}
