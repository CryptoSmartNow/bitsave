import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET_VALUE = process.env.JWT_SECRET;

// Fail fast in production if JWT_SECRET is not configured
if (!JWT_SECRET_VALUE && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: JWT_SECRET environment variable is required in production');
}

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_VALUE || 'dev-only-unsafe-secret');

/**
 * Verifies the admin JWT token from the `admin-token` cookie.
 * Returns true if the request is from an authenticated admin, false otherwise.
 * 
 * This is the single source of truth for admin authentication across
 * all dev-admin API routes. Do NOT duplicate this logic.
 */
export async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;
    if (!token) return false;

    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper that returns the JWT secret for signing tokens.
 * Used by the auth route for token creation.
 */
export function getJwtSecret() {
  return JWT_SECRET;
}
