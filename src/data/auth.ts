import { VerificationType } from "../interfaces/enums";
import { VerificationToken, RefreshToken, LoginLog } from "../interfaces/auth";

export const mockVerificationTokens: VerificationToken[] = [
  {
    id: 1,
    userId: 1,
    token: "abcd-1234-token",
    type: VerificationType.REGISTER,
    expiryDate: new Date("2026-12-31T23:59:59Z"),
    confirmedAt: new Date("2024-01-01T10:15:00Z"),
    createdAt: new Date("2024-01-01T10:00:00Z"),
  },
];

export const mockRefreshTokens: RefreshToken[] = [
  {
    id: 1,
    userId: 1,
    token: "refresh-token-xyz",
    expiryDate: new Date("2026-12-31T23:59:59Z"),
    deviceInfo: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    ipAddress: "192.168.1.1",
    createdAt: new Date("2024-01-01T10:00:00Z"),
  },
];

export const mockLoginLogs: LoginLog[] = [
  {
    id: 1,
    userId: 1,
    emailAttempt: "nguyenvana@example.com",
    loginTime: new Date("2024-05-01T08:00:00Z"),
    ipAddress: "192.168.1.1",
    userAgent: "Chrome/120.0.0.0 Safari/537.36",
    status: "SUCCESS",
  },
  {
    id: 2,
    userId: 2,
    emailAttempt: "lethib@example.com",
    loginTime: new Date("2024-05-02T09:30:00Z"),
    ipAddress: "192.168.1.5",
    userAgent: "Safari/17.0",
    status: "SUCCESS",
  },
];
