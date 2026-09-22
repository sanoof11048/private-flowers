import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsDashboardData } from "@/lib/db";

export const dynamic = "force-dynamic";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "lena2026";

export async function POST(req: NextRequest) {
  try {
    const { password, range, page, pageSize } = await req.json();

    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const selectedRange =
      range === "today" || range === "7d" || range === "30d" || range === "all"
        ? range
        : "all";
    const selectedPage = typeof page === "number" && page > 0 ? page : 1;
    const selectedPageSize = typeof pageSize === "number" && pageSize > 0 && pageSize <= 100 ? pageSize : 25;

    const data = await getAnalyticsDashboardData(selectedRange, selectedPage, selectedPageSize);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Analytics fetch error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
