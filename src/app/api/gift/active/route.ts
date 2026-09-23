import { NextResponse } from "next/server";
import { getActiveGiftRecord } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const active = await getActiveGiftRecord();

    const responseData = {
      success: true,
      activeGift: active
        ? {
            id: active.id,
            type: active.type,
            title: active.title,
            subtitle: active.subtitle,
            media_url: active.media_url,
            tenor_post_id: active.tenor_post_id,
            message: active.message,
            punchline: active.punchline,
          }
        : null,
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error in GET /api/gift/active:", error.message);
    return NextResponse.json(
      { success: false, activeGift: null, error: "Failed to fetch active gift" },
      { status: 500 }
    );
  }
}
