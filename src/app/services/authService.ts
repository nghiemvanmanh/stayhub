import { LoginRequest, RegisterRequest, AuthResponse, AuthTokens } from "@/interfaces/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Helper: đọc cookie theo tên
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

// Helper: lấy access token từ cookie
export function getAccessToken(): string | null {
  return getCookie("stayhub_access_token");
}

// Helper: lấy refresh token từ cookie
export function getRefreshToken(): string | null {
  return getCookie("stayhub_refresh_token");
}

// Helper: tạo headers với Authorization
export function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Đăng nhập
export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  // TODO: Thay bằng API thật
  // const res = await fetch(`${API_BASE_URL}/auth/login`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(data),
  // });
  // if (!res.ok) throw new Error((await res.json()).message || "Đăng nhập thất bại");
  // return res.json();

  // Mock response tạm thời
  await new Promise((r) => setTimeout(r, 800));
  if (data.email === "test@stayhub.vn" && data.password === "123456") {
    return {
      user: {
        id: "user_001",
        name: "Nguyễn Văn Mạnh",
        email: data.email,
        avatar: undefined,
      },
      tokens: {
        accessToken: "mock_access_token_" + Date.now(),
        refreshToken: "mock_refresh_token_" + Date.now(),
      },
    };
  }
  throw new Error("Email hoặc mật khẩu không đúng");
}

// Đăng ký
export async function registerApi(data: RegisterRequest): Promise<AuthResponse> {
  // TODO: Thay bằng API thật
  // const res = await fetch(`${API_BASE_URL}/auth/register`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(data),
  // });
  // if (!res.ok) throw new Error((await res.json()).message || "Đăng ký thất bại");
  // return res.json();

  // Mock response tạm thời
  await new Promise((r) => setTimeout(r, 1000));
  return {
    user: {
      id: "user_" + Date.now(),
      name: data.name,
      email: data.email,
      avatar: undefined,
    },
    tokens: {
      accessToken: "mock_access_token_" + Date.now(),
      refreshToken: "mock_refresh_token_" + Date.now(),
    },
  };
}

// Refresh access token
export async function refreshTokenApi(refreshToken: string): Promise<AuthTokens> {
  // TODO: Thay bằng API thật
  // const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ refreshToken }),
  // });
  // if (!res.ok) throw new Error("Phiên đăng nhập hết hạn");
  // return res.json();

  // Mock
  await new Promise((r) => setTimeout(r, 300));
  return {
    accessToken: "mock_access_token_refreshed_" + Date.now(),
    refreshToken: "mock_refresh_token_refreshed_" + Date.now(),
  };
}

// Đăng xuất (gọi API nếu cần)
export async function logoutApi(): Promise<void> {
  // TODO: Thay bằng API thật nếu server cần invalidate token
  // const token = getAccessToken();
  // await fetch(`${API_BASE_URL}/auth/logout`, {
  //   method: "POST",
  //   headers: authHeaders(),
  // });
  await new Promise((r) => setTimeout(r, 100));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _apiBaseUrl = API_BASE_URL; // tránh warning unused
