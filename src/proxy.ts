import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_INFO,
} from "@/constants/cookie";
import { getRolesFromToken } from "@/lib/tokenUtils";
// Các route cần đăng nhập mới vào được
const PROTECTED_ROUTES = ["/become-host", "/host"];

// Các route chỉ dành cho chưa đăng nhập (đã login không vào được)
const AUTH_ONLY_ROUTES = ["/homestay", "search"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Đọc accessToken từ cookie (server-side)
  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

  const isLoggedIn = !!accessToken;

  // Chặn Host vào trang đăng ký Host (become-host)
  if (pathname.startsWith("/become-host") && accessToken) {
    const roles = getRolesFromToken(accessToken);
    if (roles.includes("ROLE_HOST")) {
      return NextResponse.redirect(new URL("/host/dashboard", request.url));
    }
  }

  // Nếu đang ở route auth-only mà đã login → redirect về home
  if (AUTH_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Nếu đang ở route protected mà chưa login → redirect về home (hoặc login)
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Có accessToken nhưng cần kiểm tra refreshToken dự phòng
    if (!refreshToken) {
      // Không có refresh token → clear cookie và redirect
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete(ACCESS_TOKEN_KEY);
      response.cookies.delete(REFRESH_TOKEN_KEY);
      response.cookies.delete(USER_INFO);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match tất cả route ngoại trừ:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
