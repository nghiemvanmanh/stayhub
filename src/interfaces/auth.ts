import { VerificationType } from "./enums";

export interface User {
  fullName: string;
  email: string;
  avatarUrl?: string;
  // add fields mapped from users table:
  id?: string | number; // BIGINT mapping
  password?: string;
  status?: string;
  employerId?: string | number;
  lastLoginAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface VerificationToken {
  id: string | number;
  userId: string | number;
  token: string;
  type: VerificationType;
  expiryDate: Date | string;
  confirmedAt?: Date | string;
  createdAt?: Date | string;
}

export interface RefreshToken {
  id: string | number;
  userId: string | number;
  token: string;
  expiryDate: Date | string;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt?: Date | string;
}

export interface LoginLog {
  id: string | number;
  userId?: string | number;
  emailAttempt?: string;
  loginTime?: Date | string;
  ipAddress?: string;
  userAgent?: string;
  status?: string;
  failureReason?: string;
}
