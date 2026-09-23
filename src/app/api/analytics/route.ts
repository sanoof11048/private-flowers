import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsDashboardData, getDatabaseDiagnostics } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error("ADMIN_PASSWORD environment variable is not configured on server.");
      return NextResponse.json(
        { error: "ADMIN_PASSWORD environment variable is not configured in Vercel Production Settings." },
        { status: 500 }
      );
    }

    const { password, range, page, pageSize } = await req.json();

    if (!password || password !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const selectedRange =
      range === "today" || range === "7d" || range === "30d" || range === "all"
        ? range
        : "all";
    const selectedPage = typeof page === "number" && page > 0 ? page : 1;
    const selectedPageSize = typeof pageSize === "number" && pageSize > 0 && pageSize <= 100 ? pageSize : 25;

    const { summary, dbConnected, errorNotice } = await getAnalyticsDashboardData(
      selectedRange,
      selectedPage,
      selectedPageSize
    );
    const diagnostics = getDatabaseDiagnostics();

    return NextResponse.json({
      success: true,
      data: summary,
      dbStatus: {
        configured: diagnostics.configured,
        connected: dbConnected,
        host: diagnostics.host,
        database: diagnostics.database,
        errorNotice,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Analytics fetch error:", error.message);
    const safeError = error.message.includes("DATABASE_URL")
      ? "MonsterASP PostgreSQL DATABASE_URL is not configured in Vercel Production Environment Variables."
      : "Failed to connect to MonsterASP PostgreSQL database. Please verify connection.";
    return NextResponse.json({ error: safeError }, { status: 500 });
  }
}
