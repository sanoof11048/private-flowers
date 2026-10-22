import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "__lena_gallery_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecretKey(): string {
  return (
    process.env.SESSION_SECRET ||
    "lena_fallback_secret_key_84920384759283749283749"
  );
}

function getExpectedPassword(): string {
  return process.env.GALLERY_PASSWORD || "lena2026";
}

// In-memory rate limiting to prevent brute-force attempts
interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blockedUntil: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up stale rate limit entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now - entry.firstAttempt > 60000 && now > entry.blockedUntil) {
        rateLimitMap.delete(key);
      }
    }
  }, 10 * 60 * 1000).unref();
}

export function checkRateLimit(clientIp: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);

  if (!entry) {
    return { allowed: true };
  }

  if (entry.blockedUntil > now) {
    const waitSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  if (now - entry.firstAttempt > 60000) {
    // Reset window
    rateLimitMap.delete(clientIp);
    return { allowed: true };
  }

  if (entry.count >= 5) {
    entry.blockedUntil = now + 60000; // Block for 60 seconds
    return { allowed: false, waitSeconds: 60 };
  }

  return { allowed: true };
}

export function recordFailedAttempt(clientIp: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);

  if (!entry || now - entry.firstAttempt > 60000) {
    rateLimitMap.set(clientIp, {
      count: 1,
      firstAttempt: now,
      blockedUntil: 0,
    });
  } else {
    entry.count += 1;
    if (entry.count >= 5) {
      entry.blockedUntil = now + 60000;
    }
  }
}

export function clearRateLimit(clientIp: string): void {
  rateLimitMap.delete(clientIp);
}

/**
 * Constant-time password validation using SHA-256 hashes
 * Prevents length leaks and timing attacks.
 */
export function verifyGalleryPassword(candidate: string): boolean {
  if (typeof candidate !== "string" || !candidate.trim()) {
    return false;
  }

  const expected = getExpectedPassword();

  const hashExpected = crypto
    .createHash("sha256")
    .update(expected.trim())
    .digest();
  const hashCandidate = crypto
    .createHash("sha256")
    .update(candidate.trim())
    .digest();

  return crypto.timingSafeEqual(hashExpected, hashCandidate);
}

/**
 * Create a cryptographically signed session token
 */
export function createSessionToken(): string {
  const payload = JSON.stringify({
    authenticated: true,
    iat: Date.now(),
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  });

  const payloadB64 = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecretKey())
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verify signed session token in constant-time
 */
export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== "string") {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [payloadB64, signature] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", getSecretKey())
    .update(payloadB64)
    .digest("base64url");

  // Constant-time signature comparison
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expectedBuf.length) {
    return false;
  }

  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  try {
    const payloadStr = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadStr);

    if (!payload.authenticated || typeof payload.exp !== "number") {
      return false;
    }

    if (Date.now() > payload.exp) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Server-side check for authenticated gallery session
 */
export async function isGalleryAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return false;
    }
    return verifySessionToken(sessionCookie.value);
  } catch {
    return false;
  }
}

/**
 * Set signed session cookie on response
 */
export async function setGallerySessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const token = createSessionToken();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Invalidate session cookie on logout
 */
export async function clearGallerySessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
