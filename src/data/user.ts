import {
  HostOnboardingStatus,
  Gender,
  SocialProvider,
  UserStatus,
} from "@/interfaces/enums";
import {
  Profile,
  HostDetail,
  Role,
  UserRole,
  SocialAccount,
} from "@/interfaces/user";
import { User } from "@/interfaces/auth";

export const mockUsers: User[] = [
  {
    id: 1,
    fullName: "Nguyen Van A",
    email: "nguyenvana@example.com",
    status: UserStatus.ACTIVE,
    avatarUrl: "https://i.pravatar.cc/150?u=1",
    createdAt: new Date("2024-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-01T10:00:00Z"),
  },
  {
    id: 2,
    fullName: "Le Thi B",
    email: "lethib@example.com",
    status: UserStatus.ACTIVE,
    avatarUrl: "https://i.pravatar.cc/150?u=2",
    createdAt: new Date("2024-01-05T10:00:00Z"),
    updatedAt: new Date("2024-01-05T10:00:00Z"),
  },
];

export const mockProfiles: Profile[] = [
  {
    userId: 1,
    fullName: "Nguyen Van A",
    phoneNumber: "0901234567",
    gender: Gender.MALE,
    dob: new Date("1990-05-15"),
    addressDetail: "123 Nguyen Hue, Quan 1, TP. HCM",
    bio: "I love traveling and experiencing new cultures.",
  },
  {
    userId: 2,
    fullName: "Le Thi B",
    phoneNumber: "0987654321",
    gender: Gender.FEMALE,
    dob: new Date("1995-10-20"),
    addressDetail: "456 Le Loi, Quan 1, TP. HCM",
    bio: "Host with 5 years of experience in hospitality.",
  },
];

export const mockHostDetails: HostDetail[] = [
  {
    userId: 2,
    brandName: "B Boutique Stays",
    aboutHost: "Providing the best local experiences in HCM.",
    businessPhone: "0987654321",
    supportEmail: "support@bboutique.com",
    identityCardNumber: "079195012345",
    onboardingStatus: HostOnboardingStatus.APPROVED,
    createdAt: new Date("2024-01-10T10:00:00Z"),
  },
];

export const mockRoles: Role[] = [
  {
    id: 1,
    name: "ADMIN",
    description: "System Administrator",
    isSystemRole: true,
  },
  {
    id: 2,
    name: "HOST",
    description: "Property Owner/Manager",
    isSystemRole: true,
  },
  { id: 3, name: "GUEST", description: "Regular User", isSystemRole: true },
];

export const mockUserRoles: UserRole[] = [
  { userId: 1, roleId: 3, assignedAt: new Date() },
  { userId: 2, roleId: 2, assignedAt: new Date() },
  { userId: 2, roleId: 3, assignedAt: new Date() },
];

export const mockSocialAccounts: SocialAccount[] = [
  {
    id: 1,
    userId: 1,
    provider: SocialProvider.GOOGLE,
    providerId: "google-123456789",
    email: "nguyenvana@gmail.com",
    name: "Nguyen Van A",
  },
];
