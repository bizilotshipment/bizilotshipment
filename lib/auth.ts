// ============================================================
// Delivery Platform — Authentication Helpers
// ============================================================
// JWT token management with jose, OTP generation,
// and API key utilities (including secure hashing).
// ============================================================

import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';
import type { User, UserRole } from './types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-me'
);

const TOKEN_EXPIRY = '7d'; // 7 days

// --- JWT Payload ---

export interface JWTPayload {
  userId: string;
  mobile: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// --- JWT Operations ---

export async function createToken(user: User): Promise<string> {
  return new SignJWT({
    userId: user.id,
    mobile: user.mobile,
    role: user.role,
  } satisfies JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .setJti(nanoid())
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// --- OTP Operations ---

export function generateOTP(): string {
  // Generate a 4-digit OTP
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function isOTPExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

// OTP is valid for 5 minutes
export function getOTPExpiry(): string {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 5);
  return expiry.toISOString();
}

// --- API Key Operations ---

export function generateApiKey(): string {
  // Format: dk_live_ + 32 char random string
  return `dk_live_${nanoid(32)}`;
}

export async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Auth Extraction from Request ---

export async function getUserFromRequest(
  request: Request
): Promise<JWTPayload | null> {
  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    return verifyToken(token);
  }

  // Try cookie (for web UI)
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [key, ...val] = c.trim().split('=');
        return [key, val.join('=')];
      })
    );
    if (cookies['auth-token']) {
      return verifyToken(cookies['auth-token']);
    }
  }

  return null;
}

// --- API Key Extraction from Request ---

export function getApiKeyFromRequest(request: Request): string | null {
  // Check Authorization header: Bearer dk_live_xxx
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const key = authHeader.slice(7);
    if (key.startsWith('dk_live_')) {
      return key;
    }
  }

  // Check X-API-Key header as fallback
  const apiKeyHeader = request.headers.get('X-API-Key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  return null;
}

// --- ID Generators ---

export function generateId(prefix: string): string {
  return `${prefix}_${nanoid(16)}`;
}

export function generateTrackingNumber(): string {
  // Format: TRK-XXXXXXXX (8 random uppercase alphanumeric chars)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TRK-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
