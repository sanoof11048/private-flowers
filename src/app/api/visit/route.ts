import { NextRequest, NextResponse } from "next/server";
import { recordVisit } from "@/lib/db";

export const dynamic = "force-dynamic";

// In-memory sliding window rate limiter (prevents API abuse / spamming)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15;

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count++;
  return false;
}

// Cleanup stale rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown_client";

    let body: { visitId?: string; path?: string; referrer?: string } = {};

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json") || contentType.includes("text/plain")) {
      try {
        const text = await req.text();
        if (text && text.trim().length > 0) {
          body = JSON.parse(text);
        }
      } catch {
        // Safe fallback for empty/plain beacons
      }
    }

    const visitId =
      typeof body.visitId === "string" && body.visitId.length < 100
        ? body.visitId
        : crypto.randomUUID();

    // Check rate limit per client/visitId to prevent abuse
    const rateLimitKey = `${ip}:${visitId.substring(0, 8)}`;
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json({ ok: true, note: "rate_limited" }, { status: 200 });
    }

    const userAgent = req.headers.get("user-agent") || "Unknown";
    const path = typeof body.path === "string" && body.path.length < 500 ? body.path : "/";
    const referrer =
      typeof body.referrer === "string" && body.referrer.length < 1000
        ? body.referrer
        : req.headers.get("referer") || "Direct";

    // Asynchronously record visit
    await recordVisit({
      visitId,
      path,
      referrer,
      userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Visit API error:", error.message);
    // Fail-safe: Always return 200 so visitor's page is never affected
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "active", database: "MonsterASP PostgreSQL" });
}
