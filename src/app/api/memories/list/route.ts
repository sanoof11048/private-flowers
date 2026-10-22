import { NextResponse } from "next/server";
import { isGalleryAuthenticated } from "@/lib/memories-auth";
import { getPrivateMediaList } from "@/lib/memories-media";

export const dynamic = "force-dynamic";

export async function GET() {
  const authenticated = await isGalleryAuthenticated();
  if (!authenticated) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: {
          "Cache-Control": "private, no-store, max-age=0, must-revalidate",
        },
      }
    );
  }

  try {
    const items = await getPrivateMediaList();
    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Error retrieving memories list:", err);
    return NextResponse.json(
      { error: "Could not load memories" },
      { status: 500 }
    );
  }
}
