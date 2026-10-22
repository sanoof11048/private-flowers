import { NextResponse } from "next/server";
import { clearGallerySessionCookie } from "@/lib/memories-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearGallerySessionCookie();
    return NextResponse.json(
      { success: true, message: "Gallery locked." },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Gallery logout error:", err);
    return NextResponse.json(
      { error: "Could not lock gallery." },
      { status: 500 }
    );
  }
}
