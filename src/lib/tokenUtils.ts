/**
 * Decode JWT access token and extract roles.
 * Uses base64 payload parsing — no external library needed.
 */

interface JwtPayload {
  roles?: string[];
  role?: string;
  authorities?: string[];
  exp?: number;
  [key: string]: unknown;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Handle base64url → base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonStr) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Extract roles array from a JWT access token.
 * Supports common JWT role claim formats:
 *   - roles: ["ROLE_HOST", "ROLE_USER"]
 *   - role: "ROLE_HOST"
 *   - authorities: ["ROLE_HOST"]
 */
export function getRolesFromToken(token: string): string[] {
  const payload = decodeToken(token);
  if (!payload) return [];

  if (Array.isArray(payload.roles)) return payload.roles;
  if (typeof payload.role === "string") return [payload.role];
  if (Array.isArray(payload.authorities)) return payload.authorities;

  return [];
}

/**
 * Return true when JWT is expired (or invalid).
 * `leewaySeconds` helps avoid edge cases near expiry.
 */
export function isTokenExpired(token: string, leewaySeconds = 10): boolean {
  const payload = decodeToken(token);
  if (!payload || typeof payload.exp !== "number") return true;

  const now = Math.floor(Date.now() / 1000);
  return now >= payload.exp - leewaySeconds;
}
