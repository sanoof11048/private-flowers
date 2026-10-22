import { NextResponse } from "next/server";
import { isGalleryAuthenticated } from "@/lib/memories-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const authenticated = await isGalleryAuthenticated();
  return NextResponse.json(
    { authenticated },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      },
    }
  );
}
