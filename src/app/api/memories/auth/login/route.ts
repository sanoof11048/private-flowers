import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
  verifyGalleryPassword,
  setGallerySessionCookie,
} from "@/lib/memories-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many attempts. Please wait ${rateCheck.waitSeconds || 60} seconds ♡`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { password } = body;

    if (!password || typeof password !== "string") {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        { error: "Not quite, love. Try again ♡" },
        { status: 401 }
      );
    }

    const isValid = verifyGalleryPassword(password);
    if (!isValid) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        { error: "Not quite, love. Try again ♡" },
        { status: 401 }
      );
    }

    // Success: clear rate limit and issue secure session cookie
    clearRateLimit(clientIp);
    await setGallerySessionCookie();

    return NextResponse.json(
      { success: true, message: "Welcome to our private world ♡" },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Gallery auth error:", err);
    return NextResponse.json(
      { error: "Authentication failed. Try again ♡" },
      { status: 500 }
    );
  }
}
