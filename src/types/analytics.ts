export interface VisitRecord {
  id: string;
  visit_id: string;
  visited_at_utc: string; // ISO 8601 UTC timestamp
  path: string;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface DailyTrend {
  dateKey: string;
  displayDate: string;
  count: number;
}

export interface TrafficSource {
  source: string;
  count: number;
  percentage: number;
}

export interface DeviceStats {
  desktop: number;
  mobile: number;
  tablet: number;
  unknown: number;
  browsers: { name: string; count: number }[];
}

export interface AnalyticsSummary {
  totalVisits: number;
  todayVisits: number;
  yesterdayVisits: number;
  thisWeekVisits: number;
  thisMonthVisits: number;
  uniqueAnonymousVisitors: number;
  firstVisitUtc: string | null;
  latestVisitUtc: string | null;
  dailyTrends: DailyTrend[];
  trafficSources: TrafficSource[];
  devices: DeviceStats;
  recentVisits: VisitRecord[];
  pagination: {
    page: number;
    pageSize: number;
    totalVisits: number;
    totalPages: number;
  };
}

// Client-safe user-agent classifier helper
export function parseDeviceFromUA(ua: string | null): {
  type: "Desktop" | "Mobile" | "Tablet" | "Unknown";
  browser: string;
} {
  if (!ua || ua === "Unknown") {
    return { type: "Unknown", browser: "Unknown" };
  }

  let type: "Desktop" | "Mobile" | "Tablet" | "Unknown" = "Desktop";
  if (/iPad|Tablet|PlayBook/i.test(ua)) type = "Tablet";
  else if (/Mobile|Android|iPhone|iPod/i.test(ua)) type = "Mobile";

  let browser = "Other";
  if (/Edg/i.test(ua)) browser = "Edge";
  else if (/Chrome|CriOS/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox|FxiOS/i.test(ua)) browser = "Firefox";

  return { type, browser };
}
