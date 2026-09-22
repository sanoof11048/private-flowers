import { Pool } from "pg";
import fs from "fs";
import path from "path";
import {
  VisitRecord,
  DailyTrend,
  TrafficSource,
  DeviceStats,
  AnalyticsSummary,
  parseDeviceFromUA,
} from "@/types/analytics";

export type { VisitRecord, DailyTrend, TrafficSource, DeviceStats, AnalyticsSummary };
export { parseDeviceFromUA };

// Global declaration to maintain single pool across Next.js hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __postgresPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

function getPool(): Pool | null {
  if (!connectionString) {
    return null;
  }

  if (global.__postgresPool) {
    return global.__postgresPool;
  }

  // MonsterASP cloud PostgreSQL requires SSL
  const isMonsterAsp =
    connectionString.includes("databaseasp.net") || connectionString.includes("sslmode");

  const pool = new Pool({
    connectionString,
    ssl: isMonsterAsp ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on("error", (err) => {
    console.error("Unexpected error on idle PostgreSQL client:", err.message);
  });

  if (process.env.NODE_ENV !== "production") {
    global.__postgresPool = pool;
  }

  return pool;
}

// Local fallback storage (used when DATABASE_URL is not yet configured)
const LOCAL_STORAGE_DIR = path.join(process.cwd(), ".data");
const LOCAL_STORAGE_FILE = path.join(LOCAL_STORAGE_DIR, "visits.json");

function ensureLocalStorage(): void {
  try {
    if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
      fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_STORAGE_FILE)) {
      fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify([]), "utf-8");
    }
  } catch {
    // Non-blocking filesystem safeguard
  }
}

function readLocalVisits(): VisitRecord[] {
  try {
    ensureLocalStorage();
    const data = fs.readFileSync(LOCAL_STORAGE_FILE, "utf-8");
    return JSON.parse(data) as VisitRecord[];
  } catch {
    return [];
  }
}

function writeLocalVisit(record: VisitRecord): void {
  try {
    ensureLocalStorage();
    const existing = readLocalVisits();
    existing.unshift(record);
    const trimmed = existing.slice(0, 5000);
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(trimmed, null, 2), "utf-8");
  } catch (err) {
    console.error("Local storage error:", err);
  }
}

/**
 * Inserts a new visit record into MonsterASP PostgreSQL (or local fallback).
 * Authoritative UTC timestamp is generated on the server.
 */
export async function recordVisit(data: {
  visitId: string;
  path?: string;
  referrer?: string | null;
  userAgent?: string | null;
}): Promise<{ success: boolean; id: string }> {
  const serverTimestampUtc = new Date().toISOString();
  const id = crypto.randomUUID();

  const record: VisitRecord = {
    id,
    visit_id: data.visitId || crypto.randomUUID(),
    visited_at_utc: serverTimestampUtc,
    path: data.path || "/",
    referrer: data.referrer && data.referrer.trim() !== "" ? data.referrer : "Direct",
    user_agent: data.userAgent || "Unknown",
    created_at: serverTimestampUtc,
  };

  const pool = getPool();

  if (pool) {
    try {
      const queryText = `
        INSERT INTO visits (id, visit_id, visited_at_utc, path, referrer, user_agent, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      const values = [
        record.id,
        record.visit_id,
        record.visited_at_utc,
        record.path,
        record.referrer,
        record.user_agent,
        record.created_at,
      ];

      await pool.query(queryText, values);
      return { success: true, id: record.id };
    } catch (err: unknown) {
      const error = err as Error;
      console.error("MonsterASP PostgreSQL insert error:", error.message);
      writeLocalVisit(record);
      return { success: true, id: record.id };
    }
  }

  writeLocalVisit(record);
  return { success: true, id: record.id };
}

/**
 * Computes analytics from MonsterASP PostgreSQL using server-side SQL aggregation.
 */
export async function getAnalyticsDashboardData(
  range: "today" | "7d" | "30d" | "all" = "all",
  page = 1,
  pageSize = 25
): Promise<AnalyticsSummary> {
  const pool = getPool();

  if (pool) {
    try {
      // 1. Overall Summary & Date Metrics (Computed in Asia/Kolkata)
      const summaryQuery = `
        SELECT
          COUNT(*)::int AS total_visits,
          COUNT(DISTINCT visit_id)::int AS unique_visitors,
          MIN(visited_at_utc) AS first_visit,
          MAX(visited_at_utc) AS latest_visit,
          COUNT(CASE WHEN (visited_at_utc AT TIME ZONE 'Asia/Kolkata')::date = (NOW() AT TIME ZONE 'Asia/Kolkata')::date THEN 1 END)::int AS today_visits,
          COUNT(CASE WHEN (visited_at_utc AT TIME ZONE 'Asia/Kolkata')::date = (NOW() AT TIME ZONE 'Asia/Kolkata')::date - INTERVAL '1 day' THEN 1 END)::int AS yesterday_visits,
          COUNT(CASE WHEN (visited_at_utc AT TIME ZONE 'Asia/Kolkata')::date >= date_trunc('week', NOW() AT TIME ZONE 'Asia/Kolkata')::date THEN 1 END)::int AS this_week_visits,
          COUNT(CASE WHEN (visited_at_utc AT TIME ZONE 'Asia/Kolkata')::date >= date_trunc('month', NOW() AT TIME ZONE 'Asia/Kolkata')::date THEN 1 END)::int AS this_month_visits
        FROM visits
      `;
      const summaryRes = await pool.query(summaryQuery);
      const s = summaryRes.rows[0] || {};

      // 2. Daily Trends with Date Range Filtering
      let dateFilterClause = "";
      if (range === "today") {
        dateFilterClause = "WHERE (visited_at_utc AT TIME ZONE 'Asia/Kolkata')::date = (NOW() AT TIME ZONE 'Asia/Kolkata')::date";
      } else if (range === "7d") {
        dateFilterClause = "WHERE (visited_at_utc AT TIME ZONE 'Asia/Kolkata')::date >= (NOW() AT TIME ZONE 'Asia/Kolkata')::date - INTERVAL '6 days'";
      } else if (range === "30d") {
        dateFilterClause = "WHERE (visited_at_utc AT TIME ZONE 'Asia/Kolkata')::date >= (NOW() AT TIME ZONE 'Asia/Kolkata')::date - INTERVAL '29 days'";
      }

      const trendQuery = `
        SELECT
          to_char((visited_at_utc AT TIME ZONE 'Asia/Kolkata'), 'YYYY-MM-DD') AS date_key,
          to_char((visited_at_utc AT TIME ZONE 'Asia/Kolkata'), 'DD Mon') AS display_date,
          COUNT(*)::int AS count
        FROM visits
        ${dateFilterClause}
        GROUP BY date_key, display_date
        ORDER BY date_key ASC
      `;
      const trendRes = await pool.query(trendQuery);
      const dailyTrends: DailyTrend[] = trendRes.rows.map((r) => ({
        dateKey: r.date_key,
        displayDate: r.display_date,
        count: Number(r.count),
      }));

      // 3. Traffic Sources (Referrers)
      const referrerQuery = `
        SELECT
          COALESCE(NULLIF(referrer, ''), 'Direct') AS source,
          COUNT(*)::int AS count
        FROM visits
        GROUP BY source
        ORDER BY count DESC
        LIMIT 10
      `;
      const refRes = await pool.query(referrerQuery);
      const totalVisitsCount = Number(s.total_visits) || 0;
      const trafficSources: TrafficSource[] = refRes.rows.map((r) => ({
        source: r.source,
        count: Number(r.count),
        percentage: totalVisitsCount > 0 ? Math.round((Number(r.count) / totalVisitsCount) * 100) : 0,
      }));

      // 4. Device and Browser Aggregation from User-Agent
      const uaQuery = `
        SELECT user_agent, COUNT(*)::int AS count
        FROM visits
        GROUP BY user_agent
      `;
      const uaRes = await pool.query(uaQuery);

      const devices: DeviceStats = {
        desktop: 0,
        mobile: 0,
        tablet: 0,
        unknown: 0,
        browsers: [],
      };
      const browserCountMap = new Map<string, number>();

      for (const row of uaRes.rows) {
        const count = Number(row.count);
        const { type, browser } = parseDeviceFromUA(row.user_agent);

        if (type === "Desktop") devices.desktop += count;
        else if (type === "Mobile") devices.mobile += count;
        else if (type === "Tablet") devices.tablet += count;
        else devices.unknown += count;

        browserCountMap.set(browser, (browserCountMap.get(browser) || 0) + count);
      }

      devices.browsers = Array.from(browserCountMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      // 5. Paginated Recent Visits
      const offset = (page - 1) * pageSize;
      const visitsQuery = `
        SELECT id, visit_id, visited_at_utc, path, referrer, user_agent, created_at
        FROM visits
        ORDER BY visited_at_utc DESC
        LIMIT $1 OFFSET $2
      `;
      const visitsRes = await pool.query(visitsQuery, [pageSize, offset]);
      const recentVisits = visitsRes.rows as VisitRecord[];

      const totalPages = Math.max(1, Math.ceil(totalVisitsCount / pageSize));

      return {
        totalVisits: totalVisitsCount,
        todayVisits: Number(s.today_visits) || 0,
        yesterdayVisits: Number(s.yesterday_visits) || 0,
        thisWeekVisits: Number(s.this_week_visits) || 0,
        thisMonthVisits: Number(s.this_month_visits) || 0,
        uniqueAnonymousVisitors: Number(s.unique_visitors) || 0,
        firstVisitUtc: s.first_visit ? new Date(s.first_visit).toISOString() : null,
        latestVisitUtc: s.latest_visit ? new Date(s.latest_visit).toISOString() : null,
        dailyTrends,
        trafficSources,
        devices,
        recentVisits,
        pagination: {
          page,
          pageSize,
          totalVisits: totalVisitsCount,
          totalPages,
        },
      };
    } catch (err: unknown) {
      const error = err as Error;
      console.error("MonsterASP PostgreSQL query exception:", error.message);
    }
  }

  // Fallback calculation for local storage
  const allLocal = readLocalVisits();
  const totalVisitsCount = allLocal.length;

  const formatterIST = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const now = new Date();
  const todayIST = formatterIST.format(now);

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const yesterdayIST = formatterIST.format(yesterdayDate);

  const startOfWeek = new Date(now);
  const dayOfWeek = (now.getDay() + 6) % 7;
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  const startOfWeekIST = formatterIST.format(startOfWeek);

  const startOfMonthIST = todayIST.substring(0, 7) + "-01";

  let todayCount = 0;
  let yesterdayCount = 0;
  let thisWeekCount = 0;
  let thisMonthCount = 0;
  const uniqueVisitorIds = new Set<string>();
  const dateCountMap = new Map<string, number>();
  const referrerMap = new Map<string, number>();
  const browserMap = new Map<string, number>();

  const devices: DeviceStats = {
    desktop: 0,
    mobile: 0,
    tablet: 0,
    unknown: 0,
    browsers: [],
  };

  for (const v of allLocal) {
    const d = new Date(v.visited_at_utc);
    const dateKey = formatterIST.format(d);

    if (v.visit_id) uniqueVisitorIds.add(v.visit_id);

    if (dateKey === todayIST) todayCount++;
    if (dateKey === yesterdayIST) yesterdayCount++;
    if (dateKey >= startOfWeekIST) thisWeekCount++;
    if (dateKey >= startOfMonthIST) thisMonthCount++;

    dateCountMap.set(dateKey, (dateCountMap.get(dateKey) || 0) + 1);

    const ref = v.referrer && v.referrer.trim() !== "" ? v.referrer : "Direct";
    referrerMap.set(ref, (referrerMap.get(ref) || 0) + 1);

    const { type, browser } = parseDeviceFromUA(v.user_agent);
    if (type === "Desktop") devices.desktop++;
    else if (type === "Mobile") devices.mobile++;
    else if (type === "Tablet") devices.tablet++;
    else devices.unknown++;

    browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
  }

  devices.browsers = Array.from(browserMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const dailyTrends: DailyTrend[] = Array.from(dateCountMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([dateKey, count]) => {
      const parts = dateKey.split("-");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const displayDate = `${parts[2]} ${monthNames[parseInt(parts[1], 10) - 1]}`;
      return { dateKey, displayDate, count };
    });

  const trafficSources: TrafficSource[] = Array.from(referrerMap.entries())
    .map(([source, count]) => ({
      source,
      count,
      percentage: totalVisitsCount > 0 ? Math.round((count / totalVisitsCount) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const offset = (page - 1) * pageSize;
  const recentVisits = allLocal.slice(offset, offset + pageSize);
  const totalPages = Math.max(1, Math.ceil(totalVisitsCount / pageSize));

  return {
    totalVisits: totalVisitsCount,
    todayVisits: todayCount,
    yesterdayVisits: yesterdayCount,
    thisWeekVisits: thisWeekCount,
    thisMonthVisits: thisMonthCount,
    uniqueAnonymousVisitors: uniqueVisitorIds.size,
    firstVisitUtc: allLocal.length > 0 ? allLocal[allLocal.length - 1].visited_at_utc : null,
    latestVisitUtc: allLocal.length > 0 ? allLocal[0].visited_at_utc : null,
    dailyTrends,
    trafficSources,
    devices,
    recentVisits,
    pagination: {
      page,
      pageSize,
      totalVisits: totalVisitsCount,
      totalPages,
    },
  };
}
