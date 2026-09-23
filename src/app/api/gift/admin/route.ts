import { NextRequest, NextResponse } from "next/server";
import {
  getActiveGiftRecord,
  setActiveGiftRecord,
  clearActiveGiftRecord,
  getAllGiftRecords,
  getDatabaseDiagnostics,
} from "@/lib/db";
import { GiftType } from "@/types/gift";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_GIFT_TYPES: GiftType[] = ["image", "gif", "video", "tenor", "message"];

export async function POST(req: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error("ADMIN_PASSWORD is not configured in server environment.");
      return NextResponse.json(
        { error: "ADMIN_PASSWORD environment variable is not configured." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { password, action, giftData } = body;

    if (!password || password !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const diagnostics = getDatabaseDiagnostics();

    if (action === "get") {
      const active = await getActiveGiftRecord();
      const all = await getAllGiftRecords();
      return NextResponse.json({
        success: true,
        activeGift: active,
        allGifts: all,
        dbStatus: diagnostics,
      });
    }

    if (action === "clear") {
      await clearActiveGiftRecord();
      return NextResponse.json({
        success: true,
        activeGift: null,
        message: "Active gift removed successfully",
      });
    }

    if (action === "set") {
      if (!giftData || typeof giftData !== "object") {
        return NextResponse.json({ error: "Invalid gift data provided" }, { status: 400 });
      }

      const { type, title, subtitle, media_url, tenor_post_id, message, punchline } = giftData;

      if (!type || !VALID_GIFT_TYPES.includes(type)) {
        return NextResponse.json(
          { error: `Invalid gift type. Must be one of: ${VALID_GIFT_TYPES.join(", ")}` },
          { status: 400 }
        );
      }

      if (!title || typeof title !== "string" || !title.trim()) {
        return NextResponse.json({ error: "Gift title is required" }, { status: 400 });
      }

      // Security sanitation for URLs
      let sanitizedMediaUrl = media_url ? String(media_url).trim() : undefined;
      if (sanitizedMediaUrl) {
        // Allowed: https:// or local public paths starting with /
        if (
          !sanitizedMediaUrl.startsWith("https://") &&
          !sanitizedMediaUrl.startsWith("http://localhost") &&
          !sanitizedMediaUrl.startsWith("/")
        ) {
          return NextResponse.json(
            { error: "Media URL must start with https:// or be a valid public asset path (e.g. /gifts/kinder-joy.png)" },
            { status: 400 }
          );
        }
      }

      // Sanitation for Tenor Post ID: alphanumeric string only
      let sanitizedTenorId = tenor_post_id ? String(tenor_post_id).trim() : undefined;
      if (type === "tenor") {
        if (!sanitizedTenorId) {
          return NextResponse.json(
            { error: "Tenor Post ID is required for Tenor GIF type" },
            { status: 400 }
          );
        }
        if (!/^[0-9a-zA-Z_-]+$/.test(sanitizedTenorId)) {
          return NextResponse.json(
            { error: "Invalid Tenor Post ID format" },
            { status: 400 }
          );
        }
      }

      const saved = await setActiveGiftRecord({
        type,
        title,
        subtitle,
        media_url: sanitizedMediaUrl,
        tenor_post_id: sanitizedTenorId,
        message: message ? String(message).trim() : undefined,
        punchline: punchline ? String(punchline).trim() : undefined,
      });

      return NextResponse.json({
        success: true,
        activeGift: saved,
        message: "Active gift updated ✓",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Admin gift API error:", error.message);
    return NextResponse.json(
      { error: "Internal server error processing gift update" },
      { status: 500 }
    );
  }
}
