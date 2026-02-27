import { NextRequest, NextResponse } from "next/server";

// Các route cần đăng nhập mới vào được
const PROTECTED_ROUTES = ["/profile", "/bookings", "/host"];

// Các route chỉ dành cho chưa đăng nhập (đã login không vào được)
const AUTH_ONLY_ROUTES = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Đọc accessToken từ cookie (server-side)
  const accessToken = request.cookies.get("stayhub_access_token")?.value;
  const refreshToken = request.cookies.get("stayhub_refresh_token")?.value;

  const isLoggedIn = !!accessToken;

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
      response.cookies.delete("stayhub_access_token");
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
