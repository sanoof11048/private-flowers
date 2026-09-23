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
import { ActiveGiftRecord, SetGiftInput, GiftType } from "@/types/gift";

export type { VisitRecord, DailyTrend, TrafficSource, DeviceStats, AnalyticsSummary, ActiveGiftRecord, SetGiftInput, GiftType };
export { parseDeviceFromUA };

// Global declaration to maintain single pool across Next.js hot reloads & serverless container reuse
declare global {
  // eslint-disable-next-line no-var
  var __postgresPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __dbInitPromise: Promise<void> | undefined;
}

// Clean and sanitize DATABASE_URL (strip accidental wrapping quotes/whitespace)
function getSanitizedDbUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  const trimmed = raw.trim().replace(/^["']|["']$/g, "");
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getDatabaseDiagnostics(): {
  configured: boolean;
  host: string;
  database: string;
} {
  const url = getSanitizedDbUrl();
  if (!url) {
    return { configured: false, host: "Not Set", database: "None" };
  }
  try {
    const parsed = new URL(url);
    return {
      configured: true,
      host: parsed.hostname || "db69616.public.databaseasp.net",
      database: parsed.pathname ? parsed.pathname.replace(/^\//, "") : "db69616",
    };
  } catch {
    return { configured: true, host: "MonsterASP PostgreSQL", database: "db69616" };
  }
}

function getPool(): Pool | null {
  const rawUrl = getSanitizedDbUrl();
  if (!rawUrl) {
    return null;
  }

  if (global.__postgresPool) {
    return global.__postgresPool;
  }

  try {
    // Strip sslmode from query parameters so it does not conflict with ssl options in node-postgres
    let cleanUrl = rawUrl;
    if (cleanUrl.includes("sslmode=")) {
      cleanUrl = cleanUrl.replace(/([?&])sslmode=[^&]+(&|$)/, "$1").replace(/[?&]$/, "");
    }

    // MonsterASP cloud PostgreSQL requires SSL (rejectUnauthorized: false for self-signed/cloud certs)
    const pool = new Pool({
      connectionString: cleanUrl,
      ssl: { rejectUnauthorized: false },
      max: 4, // Optimal for Vercel Serverless container concurrency
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });

    pool.on("error", (err) => {
      console.error("Unexpected error on idle MonsterASP PostgreSQL client:", err.message);
    });

    global.__postgresPool = pool;
    return pool;
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Failed to construct PostgreSQL Pool:", error.message);
    return null;
  }
}

// Authoritative historical records recorded locally to be migrated on initial PostgreSQL connect
const INITIAL_SEED_VISITS: VisitRecord[] = [
  {
    id: "d4795e55-c698-467f-972a-ac03a82177e7",
    visit_id: "fee78de5-8562-42eb-bdf8-1a17e75cecb6",
    visited_at_utc: "2026-09-22T16:44:41.223Z",
    path: "/",
    referrer: "Direct",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
    created_at: "2026-09-22T16:44:41.223Z",
  },
  {
    id: "3be99f30-bac7-4038-8af1-f0ea7684f4f4",
    visit_id: "84ce81a6-bd29-4999-9b7f-f3d15b263546",
    visited_at_utc: "2026-09-22T15:59:05.439Z",
    path: "/",
    referrer: "Direct",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
    created_at: "2026-09-22T15:59:05.439Z",
  },
  {
    id: "5ac158bf-ae70-4a97-88f9-a47c4b6953d1",
    visit_id: "951271fb-7900-4d9a-9ca6-946457284889",
    visited_at_utc: "2026-09-22T15:58:24.197Z",
    path: "/",
    referrer: "Direct",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
    created_at: "2026-09-22T15:58:24.197Z",
  },
  {
    id: "67296e58-778f-4299-afab-8b4c5303d140",
    visit_id: "951271fb-7900-4d9a-9ca6-946457284889",
    visited_at_utc: "2026-09-22T15:45:50.618Z",
    path: "/",
    referrer: "Direct",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
    created_at: "2026-09-22T15:45:50.618Z",
  },
  {
    id: "27ff89c4-d647-41c0-b214-f60728d058ba",
    visit_id: "951271fb-7900-4d9a-9ca6-946457284889",
    visited_at_utc: "2026-09-22T15:45:35.057Z",
    path: "/",
    referrer: "Direct",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
    created_at: "2026-09-22T15:45:35.057Z",
  },
  {
    id: "6e8d8b41-2f42-4a0d-ac60-26104150ec57",
    visit_id: "84ce81a6-bd29-4999-9b7f-f3d15b263546",
    visited_at_utc: "2026-09-22T15:31:27.341Z",
    path: "/",
    referrer: "Direct",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
    created_at: "2026-09-22T15:31:27.341Z",
  },
  {
    id: "ba0ef1c5-c84d-45a5-b17b-b16be1a017bf",
    visit_id: "84ce81a6-bd29-4999-9b7f-f3d15b263546",
    visited_at_utc: "2026-09-22T15:29:48.644Z",
    path: "/",
    referrer: "Direct",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
    created_at: "2026-09-22T15:29:48.644Z",
  },
  {
    id: "cdae2217-083b-4512-b2c9-640225805b38",
    visit_id: "951271fb-7900-4d9a-9ca6-946457284889",
    visited_at_utc: "2026-09-22T15:29:48.597Z",
    path: "/",
    referrer: "Direct",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
    created_at: "2026-09-22T15:29:48.597Z",
  },
];

// Automatic lazy table & index initialization and data migration on first database access
async function ensureDatabaseSchema(pool: Pool): Promise<void> {
  if (global.__dbInitPromise) {
    return global.__dbInitPromise;
  }

  global.__dbInitPromise = (async () => {
    try {
      const initSql = `
        CREATE TABLE IF NOT EXISTS visits (
          id VARCHAR(36) PRIMARY KEY,
          visit_id VARCHAR(100) NOT NULL,
          visited_at_utc TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
          path VARCHAR(500) NOT NULL DEFAULT '/',
          referrer TEXT DEFAULT 'Direct',
          user_agent TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
        );
        CREATE INDEX IF NOT EXISTS idx_visits_visited_at_utc ON visits (visited_at_utc DESC);
        CREATE INDEX IF NOT EXISTS idx_visits_visit_id ON visits (visit_id);

        CREATE TABLE IF NOT EXISTS gift_settings (
          id VARCHAR(36) PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255),
          media_url TEXT,
          tenor_post_id VARCHAR(100),
          message TEXT,
          punchline TEXT,
          is_active BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
        );
        CREATE INDEX IF NOT EXISTS idx_gift_settings_is_active ON gift_settings (is_active);
      `;
      await pool.query(initSql);

      // Preserve existing records: if PostgreSQL table is empty, migrate existing records
      try {
        const countRes = await pool.query("SELECT COUNT(*)::int AS count FROM visits");
        const currentCount = Number(countRes.rows[0]?.count || 0);
        if (currentCount === 0) {
          const recordsToMigrate = readLocalVisits();
          const items = recordsToMigrate.length > 0 ? recordsToMigrate : INITIAL_SEED_VISITS;
          for (const v of items) {
            await pool.query(
              `INSERT INTO visits (id, visit_id, visited_at_utc, path, referrer, user_agent, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (id) DO NOTHING`,
              [v.id, v.visit_id, v.visited_at_utc, v.path, v.referrer, v.user_agent, v.created_at]
            );
          }
        }
      } catch {
        // Non-blocking sync check
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.warn("Schema initialization notice:", error.message);
    }
  })();

  return global.__dbInitPromise;
}

// Local fallback storage (used when DATABASE_URL is not yet configured in local environment)
const LOCAL_STORAGE_DIR = path.join(process.cwd(), ".data");
const LOCAL_STORAGE_FILE = path.join(LOCAL_STORAGE_DIR, "visits.json");

function ensureLocalStorage(): void {
  try {
    if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
      fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_STORAGE_FILE)) {
      fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(INITIAL_SEED_VISITS, null, 2), "utf-8");
    }
  } catch {
    // Non-blocking filesystem safeguard for read-only environments
  }
}

function readLocalVisits(): VisitRecord[] {
  try {
    ensureLocalStorage();
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const data = fs.readFileSync(LOCAL_STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(data) as VisitRecord[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Graceful fallback
  }
  return INITIAL_SEED_VISITS;
}

function writeLocalVisit(record: VisitRecord): void {
  try {
    ensureLocalStorage();
    const existing = readLocalVisits();
    existing.unshift(record);
    const trimmed = existing.slice(0, 5000);
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(trimmed, null, 2), "utf-8");
  } catch (err) {
    console.warn("Local storage fallback notice:", err);
  }
}

/**
 * Inserts a new visit record into MonsterASP PostgreSQL.
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
      await ensureDatabaseSchema(pool);

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
): Promise<{ summary: AnalyticsSummary; dbConnected: boolean; errorNotice?: string }> {
  const pool = getPool();

  if (pool) {
    try {
      await ensureDatabaseSchema(pool);

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

      const summary: AnalyticsSummary = {
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

      return { summary, dbConnected: true };
    } catch (err: unknown) {
      const error = err as Error;
      console.error("MonsterASP PostgreSQL query exception:", error.message);
      if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
        throw new Error(`MonsterASP PostgreSQL query failed: ${error.message}`);
      }
    }
  }

  // If in production environment and pool is null/failed, do not fake zero counts
  if ((process.env.NODE_ENV === "production" || process.env.VERCEL) && !getSanitizedDbUrl()) {
    throw new Error("DATABASE_URL environment variable is not configured in Vercel Production Settings.");
  }

  // Fallback calculation for local file storage in development
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

  const summary: AnalyticsSummary = {
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

  const isConfigured = Boolean(getSanitizedDbUrl());
  return {
    summary,
    dbConnected: false,
    errorNotice: isConfigured
      ? "Unable to connect to MonsterASP PostgreSQL. Retrying..."
      : "DATABASE_URL environment variable is not configured on Vercel.",
  };
}

// =========================================================================
// GIFT SETTINGS (POSTGRESQL + LOCAL PERSISTENCE FALLBACK)
// =========================================================================

const LOCAL_GIFT_STORAGE_FILE = path.join(LOCAL_STORAGE_DIR, "gift_settings.json");

function readLocalGifts(): ActiveGiftRecord[] {
  try {
    ensureLocalStorage();
    if (fs.existsSync(LOCAL_GIFT_STORAGE_FILE)) {
      const raw = fs.readFileSync(LOCAL_GIFT_STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(raw) as ActiveGiftRecord[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Non-blocking fallback
  }
  return [];
}

function writeLocalGifts(gifts: ActiveGiftRecord[]): void {
  try {
    ensureLocalStorage();
    fs.writeFileSync(LOCAL_GIFT_STORAGE_FILE, JSON.stringify(gifts, null, 2), "utf-8");
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Fetch the currently active gift record from PostgreSQL or fallback
 */
export async function getActiveGiftRecord(): Promise<ActiveGiftRecord | null> {
  const pool = getPool();
  if (pool) {
    try {
      await ensureDatabaseSchema(pool);
      const res = await pool.query(
        `SELECT id, type, title, subtitle, media_url, tenor_post_id, message, punchline, is_active, created_at, updated_at
         FROM gift_settings
         WHERE is_active = true
         ORDER BY updated_at DESC
         LIMIT 1`
      );
      if (res.rows.length > 0) {
        return res.rows[0] as ActiveGiftRecord;
      }
      return null;
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error querying active gift from PostgreSQL:", error.message);
    }
  }

  // Fallback to local storage
  const localGifts = readLocalGifts();
  const active = localGifts.find((g) => g.is_active);
  return active || null;
}

/**
 * Set a new active gift in PostgreSQL, ensuring strictly ONE active gift
 */
export async function setActiveGiftRecord(input: SetGiftInput): Promise<ActiveGiftRecord> {
  const id = crypto.randomUUID();
  const nowUtc = new Date().toISOString();

  const newRecord: ActiveGiftRecord = {
    id,
    type: input.type,
    title: input.title.trim(),
    subtitle: input.subtitle ? input.subtitle.trim() : null,
    media_url: input.media_url ? input.media_url.trim() : null,
    tenor_post_id: input.tenor_post_id ? input.tenor_post_id.trim() : null,
    message: input.message ? input.message.trim() : null,
    punchline: input.punchline ? input.punchline.trim() : null,
    is_active: true,
    created_at: nowUtc,
    updated_at: nowUtc,
  };

  const pool = getPool();
  if (pool) {
    try {
      await ensureDatabaseSchema(pool);
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        // Deactivate all previous gifts
        await client.query("UPDATE gift_settings SET is_active = false, updated_at = now() WHERE is_active = true");
        // Insert new active gift
        const insertRes = await client.query(
          `INSERT INTO gift_settings (
            id, type, title, subtitle, media_url, tenor_post_id, message, punchline, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10)
          RETURNING id, type, title, subtitle, media_url, tenor_post_id, message, punchline, is_active, created_at, updated_at`,
          [
            newRecord.id,
            newRecord.type,
            newRecord.title,
            newRecord.subtitle,
            newRecord.media_url,
            newRecord.tenor_post_id,
            newRecord.message,
            newRecord.punchline,
            newRecord.created_at,
            newRecord.updated_at,
          ]
        );
        await client.query("COMMIT");
        if (insertRes.rows.length > 0) {
          return insertRes.rows[0] as ActiveGiftRecord;
        }
      } catch (txnErr) {
        await client.query("ROLLBACK");
        throw txnErr;
      } finally {
        client.release();
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error setting active gift in PostgreSQL:", error.message);
    }
  }

  // Fallback to local storage
  const localGifts = readLocalGifts();
  const updatedList = localGifts.map((g) => ({ ...g, is_active: false }));
  updatedList.unshift(newRecord);
  writeLocalGifts(updatedList);
  return newRecord;
}

/**
 * Clear/deactivate all active gifts
 */
export async function clearActiveGiftRecord(): Promise<void> {
  const pool = getPool();
  if (pool) {
    try {
      await ensureDatabaseSchema(pool);
      await pool.query("UPDATE gift_settings SET is_active = false, updated_at = now() WHERE is_active = true");
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error clearing active gift in PostgreSQL:", error.message);
    }
  }

  // Update local storage
  const localGifts = readLocalGifts();
  const cleared = localGifts.map((g) => ({ ...g, is_active: false }));
  writeLocalGifts(cleared);
}

/**
 * Get all historical configured gifts for the admin dashboard
 */
export async function getAllGiftRecords(): Promise<ActiveGiftRecord[]> {
  const pool = getPool();
  if (pool) {
    try {
      await ensureDatabaseSchema(pool);
      const res = await pool.query(
        `SELECT id, type, title, subtitle, media_url, tenor_post_id, message, punchline, is_active, created_at, updated_at
         FROM gift_settings
         ORDER BY updated_at DESC
         LIMIT 25`
      );
      return res.rows as ActiveGiftRecord[];
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error fetching all gifts from PostgreSQL:", error.message);
    }
  }

  return readLocalGifts();
}

