"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Lock,
  RefreshCw,
  Eye,
  Calendar,
  Clock,
  Globe,
  Laptop,
  Smartphone,
  Tablet,
  ShieldCheck,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { AnalyticsSummary, parseDeviceFromUA } from "@/types/analytics";

// Helper to format ISO UTC timestamps into exact India Standard Time (IST)
function formatIST(isoString: string | null | undefined): { dateStr: string; timeStr: string; fullStr: string } {
  if (!isoString) {
    return { dateStr: "Not available", timeStr: "", fullStr: "Not available" };
  }

  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      return { dateStr: "Not available", timeStr: "", fullStr: "Not available" };
    }

    const dateFormatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const timeFormatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const dateStr = dateFormatter.format(d);
    const timeStr = timeFormatter.format(d).toUpperCase() + " IST";
    const fullStr = `${dateStr} · ${timeStr}`;

    return { dateStr, timeStr, fullStr };
  } catch {
    return { dateStr: "Not available", timeStr: "", fullStr: "Not available" };
  }
}

export default function PrivateAnalyticsDashboard() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [range, setRange] = useState<"today" | "7d" | "30d" | "all">("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const [dbStatus, setDbStatus] = useState<{
    configured: boolean;
    connected: boolean;
    host?: string;
    database?: string;
    errorNotice?: string;
  } | null>(null);

  const fetchAnalytics = useCallback(async (pass: string, selectedRange = range, selectedPage = page) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: pass,
          range: selectedRange,
          page: selectedPage,
          pageSize: 25,
        }),
      });

      if (res.status === 401) {
        setErrorMsg("Incorrect admin passcode.");
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data);
        if (result.dbStatus) {
          setDbStatus(result.dbStatus);
        }
        setAuthenticated(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("__adm_key", pass);
        }

        const now = new Date();
        const timeFmt = new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        setLastUpdated(timeFmt.format(now).toUpperCase() + " IST");
      } else {
        setErrorMsg("Unable to load analytics data.");
      }
    } catch {
      setErrorMsg("Network error connecting to analytics server.");
    } finally {
      setLoading(false);
    }
  }, [range, page]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPass = sessionStorage.getItem("__adm_key");
      if (savedPass) {
        setPassword(savedPass);
        fetchAnalytics(savedPass);
      }
    }
  }, [fetchAnalytics]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      fetchAnalytics(password.trim());
    }
  };

  const handleRangeChange = (newRange: "today" | "7d" | "30d" | "all") => {
    setRange(newRange);
    setPage(1);
    if (password) {
      fetchAnalytics(password, newRange, 1);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (password) {
      fetchAnalytics(password, range, newPage);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("__adm_key");
    }
    setAuthenticated(false);
    setPassword("");
    setData(null);
  };

  // 1. Password Protection Screen
  if (!authenticated) {
    return (
      <div className="min-h-screen w-full bg-[#070709] text-[#ECE6E2] flex items-center justify-center p-4 selection:bg-rose-900 selection:text-white">
        <div className="w-full max-w-md bg-[#121217] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-center mb-6">
            <div className="h-14 w-14 rounded-2xl bg-rose-950/50 border border-rose-500/30 flex items-center justify-center text-rose-300">
              <Lock className="w-7 h-7" />
            </div>
          </div>

          <h1 className="text-2xl font-serif text-center font-semibold tracking-wide text-white mb-2">
            Private Visit Analytics
          </h1>
          <p className="text-sm text-center text-white/50 mb-6">
            Enter admin passcode to view MonsterASP PostgreSQL visit telemetry.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="passcode" className="block text-xs uppercase tracking-wider text-white/60 mb-2 font-medium">
                Admin Passcode
              </label>
              <input
                id="passcode"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passcode..."
                className="w-full px-4 py-3 bg-[#1A1A22] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-rose-400/60 focus:ring-1 focus:ring-rose-400/60 transition"
                autoFocus
              />
            </div>

            {errorMsg && (
              <p className="text-rose-400 text-xs text-center font-medium bg-rose-950/40 py-2.5 rounded-lg border border-rose-800/40">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-medium rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Unlock Dashboard"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate max daily count for real chart scaling
  const maxTrendCount = data?.dailyTrends && data.dailyTrends.length > 0
    ? Math.max(...data.dailyTrends.map((d) => d.count), 1)
    : 1;

  // 2. Authenticated Dashboard Screen (Full Vertical Document Scrolling)
  return (
    <div className="min-h-screen w-full bg-[#070709] text-[#ECE6E2] p-4 sm:p-8 selection:bg-rose-900 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* Top Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${dbStatus?.connected ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
                Private Visit Analytics
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-white/50 mt-1">
              Database:{" "}
              <span className={`font-mono font-medium ${dbStatus?.connected ? "text-emerald-400" : "text-amber-300"}`}>
                {dbStatus?.connected
                  ? "MonsterASP PostgreSQL (Connected)"
                  : dbStatus?.configured
                  ? "MonsterASP PostgreSQL (Connecting...)"
                  : "Local Mode (Set DATABASE_URL in Vercel)"}
              </span>{" "}
              • Timezone: <span className="text-rose-300 font-medium">Asia/Kolkata (IST)</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {lastUpdated && (
              <span className="text-[11px] text-white/40 font-mono hidden sm:inline">
                Last updated: {lastUpdated}
              </span>
            )}
            <button
              onClick={() => fetchAnalytics(password)}
              disabled={loading}
              className="px-3.5 py-2 bg-[#171720] hover:bg-[#20202C] border border-white/10 rounded-xl text-xs sm:text-sm text-white/90 flex items-center gap-2 transition cursor-pointer"
              title="Refresh telemetry from PostgreSQL"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-xl text-xs sm:text-sm text-rose-200 transition cursor-pointer"
            >
              Lock
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-rose-950/50 border border-rose-500/40 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm text-rose-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => fetchAnalytics(password)}
              className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 rounded-lg text-xs font-medium cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Date Range Filter Controls */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121217]/70 border border-white/10 rounded-2xl p-3 sm:px-5">
          <span className="text-xs uppercase font-medium tracking-wider text-white/50">
            Time Range:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(["today", "7d", "30d", "all"] as const).map((r) => (
              <button
                key={r}
                onClick={() => handleRangeChange(r)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  range === r
                    ? "bg-rose-900/60 text-rose-200 border border-rose-500/40 shadow-sm"
                    : "bg-[#181822] text-white/60 hover:text-white border border-transparent hover:border-white/10"
                }`}
              >
                {r === "today" ? "Today" : r === "7d" ? "Last 7 Days" : r === "30d" ? "Last 30 Days" : "All Time"}
              </button>
            ))}
          </div>
        </section>

        {/* Real Summary KPI Cards */}
        {data && (
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-[#121217] border border-white/10 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-white/50 mb-2">
                <span className="text-[11px] uppercase font-medium tracking-wider">Total</span>
                <Eye className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {data.totalVisits.toLocaleString()}
              </div>
              <p className="text-[10px] text-white/40 mt-1">All recorded visits</p>
            </div>

            <div className="bg-[#121217] border border-white/10 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-white/50 mb-2">
                <span className="text-[11px] uppercase font-medium tracking-wider">Today</span>
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-300">
                {data.todayVisits.toLocaleString()}
              </div>
              <p className="text-[10px] text-white/40 mt-1">Since 12:00 AM IST</p>
            </div>

            <div className="bg-[#121217] border border-white/10 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-white/50 mb-2">
                <span className="text-[11px] uppercase font-medium tracking-wider">Yesterday</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-200">
                {data.yesterdayVisits.toLocaleString()}
              </div>
              <p className="text-[10px] text-white/40 mt-1">Previous IST day</p>
            </div>

            <div className="bg-[#121217] border border-white/10 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-white/50 mb-2">
                <span className="text-[11px] uppercase font-medium tracking-wider">This Week</span>
                <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-sky-200">
                {data.thisWeekVisits.toLocaleString()}
              </div>
              <p className="text-[10px] text-white/40 mt-1">Mon to Sun</p>
            </div>

            <div className="bg-[#121217] border border-white/10 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-white/50 mb-2">
                <span className="text-[11px] uppercase font-medium tracking-wider">This Month</span>
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-violet-200">
                {data.thisMonthVisits.toLocaleString()}
              </div>
              <p className="text-[10px] text-white/40 mt-1">Current calendar month</p>
            </div>

            <div className="bg-[#121217] border border-white/10 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between text-white/50 mb-2">
                <span className="text-[11px] uppercase font-medium tracking-wider">Anonymous</span>
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-teal-200">
                {data.uniqueAnonymousVisitors.toLocaleString()}
              </div>
              <p className="text-[10px] text-white/40 mt-1">Unique device sessions</p>
            </div>
          </section>
        )}

        {/* First & Latest Visit Milestones */}
        {data && (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#121217]/60 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 shrink-0">
                <Calendar className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <span className="text-white/40 block text-[11px] uppercase font-medium tracking-wider">
                  First Recorded Visit
                </span>
                <span className="text-white font-medium text-xs sm:text-sm">
                  {formatIST(data.firstVisitUtc).fullStr}
                </span>
              </div>
            </div>

            <div className="bg-[#121217]/60 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 shrink-0">
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-white/40 block text-[11px] uppercase font-medium tracking-wider">
                  Latest Visit
                </span>
                <span className="text-white font-medium text-xs sm:text-sm">
                  {formatIST(data.latestVisitUtc).fullStr}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Real Visits Over Time Chart */}
        <section className="bg-[#121217] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-serif font-semibold text-white">
                Visits Over Time
              </h2>
              <p className="text-xs text-white/40">Aggregated daily in Asia/Kolkata (IST)</p>
            </div>
          </div>

          {data?.dailyTrends && data.dailyTrends.length > 0 ? (
            <div className="h-48 sm:h-56 w-full flex items-end gap-2 sm:gap-4 pt-6 pb-2 px-2 overflow-x-auto">
              {data.dailyTrends.map((trend) => {
                const heightPercent = Math.max(8, (trend.count / maxTrendCount) * 100);
                return (
                  <div
                    key={trend.dateKey}
                    className="flex-1 min-w-[36px] max-w-[64px] flex flex-col items-center gap-2 h-full justify-end group"
                  >
                    <span className="text-[11px] font-mono text-rose-300 font-medium opacity-80 group-hover:opacity-100 transition">
                      {trend.count}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-rose-950 via-rose-700 to-rose-400 group-hover:from-rose-900 group-hover:to-rose-300 transition-all duration-300 shadow-md"
                      title={`${trend.displayDate}: ${trend.count} visit(s)`}
                    />
                    <span className="text-[10px] text-white/50 whitespace-nowrap font-medium">
                      {trend.displayDate}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-xs text-white/40">
              No visit activity in the selected date range.
            </div>
          )}
        </section>

        {/* Traffic Sources & Device Analytics Grid */}
        {data && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Sources */}
            <div className="bg-[#121217] border border-white/10 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-serif font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-rose-400" />
                Traffic Sources
              </h3>

              {data.trafficSources.length === 0 ? (
                <p className="text-xs text-white/40 py-6 text-center">No referrer data recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.trafficSources.map((ts) => (
                    <div key={ts.source} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/80 font-mono truncate max-w-[200px]" title={ts.source}>
                          {ts.source}
                        </span>
                        <span className="text-white/50">
                          {ts.count} ({ts.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(4, ts.percentage))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Device & Browser Breakdown */}
            <div className="bg-[#121217] border border-white/10 rounded-2xl p-5 shadow-xl space-y-5">
              <h3 className="text-sm font-serif font-semibold text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-sky-400" />
                Device & Browser Breakdown
              </h3>

              {/* Device Types */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#181822] rounded-xl p-3 text-center border border-white/5">
                  <Laptop className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                  <div className="text-base font-bold text-white">{data.devices.desktop}</div>
                  <div className="text-[10px] text-white/40 uppercase">Desktop</div>
                </div>

                <div className="bg-[#181822] rounded-xl p-3 text-center border border-white/5">
                  <Smartphone className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                  <div className="text-base font-bold text-white">{data.devices.mobile}</div>
                  <div className="text-[10px] text-white/40 uppercase">Mobile</div>
                </div>

                <div className="bg-[#181822] rounded-xl p-3 text-center border border-white/5">
                  <Tablet className="w-4 h-4 text-violet-400 mx-auto mb-1" />
                  <div className="text-base font-bold text-white">{data.devices.tablet}</div>
                  <div className="text-[10px] text-white/40 uppercase">Tablet</div>
                </div>
              </div>

              {/* Browsers List */}
              <div className="border-t border-white/5 pt-3">
                <span className="text-[11px] text-white/40 uppercase font-medium block mb-2">
                  Top Browsers:
                </span>
                <div className="flex flex-wrap gap-2">
                  {data.devices.browsers.length === 0 ? (
                    <span className="text-xs text-white/40">No browser data.</span>
                  ) : (
                    data.devices.browsers.map((b) => (
                      <span
                        key={b.name}
                        className="px-2.5 py-1 bg-[#181822] border border-white/5 rounded-lg text-xs text-white/70"
                      >
                        {b.name}: <strong className="text-white">{b.count}</strong>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Paginated Recent Visits Table */}
        <section className="bg-[#121217] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-serif font-semibold text-white">
                Recent Visits Log
              </h2>
              <p className="text-xs text-white/40">Real database records (25 per page)</p>
            </div>

            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-2.5 py-1 bg-[#181822] hover:bg-[#20202C] border border-white/10 rounded-lg text-white/80 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <span className="text-white/50 px-1 font-mono">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(Math.min(data.pagination.totalPages, page + 1))}
                  disabled={page >= data.pagination.totalPages}
                  className="px-2.5 py-1 bg-[#181822] hover:bg-[#20202C] border border-white/10 rounded-lg text-white/80 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#181822] text-white/50 uppercase text-[11px] font-medium tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Exact IST Time</th>
                  <th className="py-3.5 px-4">Path</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Device & Browser</th>
                  <th className="py-3.5 px-4 text-right">Anonymous ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!data || data.recentVisits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-white/40">
                      No visits recorded yet.
                    </td>
                  </tr>
                ) : (
                  data.recentVisits.map((v) => {
                    const ist = formatIST(v.visited_at_utc);
                    const parsedUA = parseDeviceFromUA(v.user_agent);

                    return (
                      <tr key={v.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                          <div className="font-medium text-white">{ist.dateStr}</div>
                          <div className="text-xs text-rose-300/80 font-mono mt-0.5">{ist.timeStr}</div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap font-mono text-white/80">
                          {v.path || "/"}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-white/70">
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-white/40 shrink-0" />
                            <span className="truncate max-w-[150px]" title={v.referrer || "Direct"}>
                              {v.referrer || "Direct"}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-white/80">
                          <div className="flex items-center gap-2">
                            {parsedUA.type === "Mobile" ? (
                              <Smartphone className="w-3.5 h-3.5 text-rose-400" />
                            ) : parsedUA.type === "Tablet" ? (
                              <Tablet className="w-3.5 h-3.5 text-violet-400" />
                            ) : (
                              <Laptop className="w-3.5 h-3.5 text-sky-400" />
                            )}
                            <span>{parsedUA.type}</span>
                            <span className="text-white/30">•</span>
                            <span className="text-white/60">{parsedUA.browser}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap font-mono text-white/40 text-xs">
                          <span title={v.visit_id}>
                            {v.visit_id ? `${v.visit_id.substring(0, 8)}...` : "Not available"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {data && data.pagination.totalPages > 1 && (
            <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
              <span>
                Showing {(data.pagination.page - 1) * data.pagination.pageSize + 1}–
                {Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.totalVisits)} of{" "}
                {data.pagination.totalVisits} visits
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 bg-[#181822] hover:bg-[#20202C] border border-white/10 rounded-lg text-white/80 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(data.pagination.totalPages, page + 1))}
                  disabled={page >= data.pagination.totalPages}
                  className="px-3 py-1 bg-[#181822] hover:bg-[#20202C] border border-white/10 rounded-lg text-white/80 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-white/40 pt-4 pb-8 space-y-1">
          <p>
            Private Analytics Dashboard • Powered by MonsterASP PostgreSQL
          </p>
          <p>
            Authoritative UTC Database Timestamps Rendered in Asia/Kolkata (IST)
          </p>
        </footer>
      </div>
    </div>
  );
}
