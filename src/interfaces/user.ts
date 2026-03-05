import { Gender, HostOnboardingStatus, SocialProvider } from "./enums";

export interface Profile {
  userId: string | number;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  dob?: Date | string;
  gender?: Gender;
  bio?: string;
  addressDetail?: string;
  updatedAt?: Date | string;
}

export interface HostDetail {
  userId: string | number;
  brandName?: string;
  aboutHost?: string;
  businessPhone?: string;
  supportEmail?: string;
  identityCardNumber?: string;
  identityCardFrontUrl?: string;
  identityCardBackUrl?: string;
  businessLicenseNumber?: string;
  businessLicenseUrl?: string;
  onboardingStatus: HostOnboardingStatus;
  reviewNote?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Role {
  id: string | number;
  ownerId?: string | number;
  name: string;
  description?: string;
  isSystemRole?: boolean;
}

export interface UserRole {
  userId: string | number;
  roleId: string | number;
  assignedAt?: Date | string;
}

export interface SocialAccount {
  id: string | number;
  userId: string | number;
  provider: SocialProvider;
  providerId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  createdAt?: Date | string;
}
