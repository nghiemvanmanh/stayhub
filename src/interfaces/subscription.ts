import { SubscriptionTier } from "./enums";

export interface SubscriptionPlan {
  id: string | number;
  name: string;
  tier: SubscriptionTier;
  price: number;
  durationDays: number;
  maxListings?: number;
  commissionRate?: number;
  isActive?: boolean;
}

export interface UserSubscription {
  id: string | number;
  userId: string | number;
  planId: string | number;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: string;
  autoRenew?: boolean;
  currentCommissionRate?: number;
}
