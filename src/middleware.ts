import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "__lena_gallery_session";

function getSecretKey(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.GALLERY_SESSION_SECRET ||
    "sanoof-loves-lena-forever-secret-key-salt-2026"
  );
}

/**
 * Web Crypto Edge-compatible HMAC-SHA256 session token verification
 */
async function verifySessionTokenEdge(token: string | undefined | null, secret: string): Promise<boolean> {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [dataB64, signatureB64] = parts;

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Convert base64url to Uint8Array
    const binarySig = atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/"));
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(dataB64));
    if (!isValid) return false;

    // Check expiration
    const payloadJson = atob(dataB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);
    if (!payload.exp || Date.now() > payload.exp) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isValid = await verifySessionTokenEdge(token, getSecretKey());

  if (!isValid) {
    return new NextResponse(
      JSON.stringify({
        error: "Unauthorized access to private memories",
        message: "Please unlock our memories gallery at /our-memories ♡",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "private, no-store, max-age=0, must-revalidate",
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/Our Gallery/:path*",
    "/our-gallery/:path*",
    "/_gallery_thumbs/:path*",
    "/api/memories/media/:path*",
    "/api/memories/list",
  ],
};
