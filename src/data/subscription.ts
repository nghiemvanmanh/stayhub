import { SubscriptionTier } from "../interfaces/enums";
import { SubscriptionPlan, UserSubscription } from "../interfaces/subscription";

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 1,
    name: "Basic Host",
    tier: SubscriptionTier.FREE,
    price: 0,
    durationDays: 30,
    maxListings: 1,
    commissionRate: 15.0,
    isActive: true,
  },
  {
    id: 2,
    name: "Pro Host",
    tier: SubscriptionTier.PREMIUM,
    price: 499000,
    durationDays: 30,
    maxListings: 10,
    commissionRate: 10.0,
    isActive: true,
  },
  {
    id: 3,
    name: "Business Enterprise",
    tier: SubscriptionTier.BUSINESS,
    price: 1999000,
    durationDays: 30,
    maxListings: 100,
    commissionRate: 8.0,
    isActive: true,
  },
];

export const mockUserSubscriptions: UserSubscription[] = [
  {
    id: 1,
    userId: 2, // Host Le Thi B
    planId: 2, // Pro Host
    startDate: new Date("2024-01-15T00:00:00Z"),
    endDate: new Date("2024-02-15T00:00:00Z"),
    status: "ACTIVE",
    autoRenew: true,
    currentCommissionRate: 10.0,
  },
];
