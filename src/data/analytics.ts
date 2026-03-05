import {
  AnalyticsDailySystem,
  AnalyticsDailyHost,
  AnalyticsProperty,
} from "../interfaces/analytics";

export const mockAnalyticsDailySystem: AnalyticsDailySystem[] = [
  {
    id: 1,
    date: new Date("2024-05-01"),
    totalGmv: 45000000,
    totalSystemFee: 4500000,
    newUsers: 15,
    newHosts: 2,
    newBookings: 8,
    activeListings: 125,
  },
];

export const mockAnalyticsDailyHost: AnalyticsDailyHost[] = [
  {
    id: 1,
    hostId: 2, // Le Thi B
    date: new Date("2024-05-01"),
    totalEarnings: 8500000,
    totalBookings: 3,
    cancelledBookings: 0,
    averageRatingDaily: 4.8,
  },
];

export const mockAnalyticsProperty: AnalyticsProperty[] = [
  {
    id: 1,
    propertyId: 1, // Biệt thự
    date: new Date("2024-05-01"),
    pageViews: 120,
    isBooked: true,
    revenueDaily: 5300000,
  },
];
