"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { dashboardService } from "@/services/dashboard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// ── Helpers ──────────────────────────────────────────────
function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function formatCurrency(num) {
  return "₹" + parseFloat(num || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const statusColor = (s) => {
  if (s === "Approved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "Completed") return "bg-amber-50 text-amber-700 border-amber-200";
  if (s === "Rejected") return "bg-red-50 text-red-700 border-red-200";
  return "bg-zinc-100 text-zinc-600 border-zinc-200";
};

// ── Skeleton primitives ──────────────────────────────────
const Pulse = ({ className }) => (
  <div className={`animate-pulse rounded bg-zinc-200/70 ${className}`} />
);

// ── KPI Card ─────────────────────────────────────────────
function KPICard({ label, value, trend, trendLabel, icon, loading, accent }) {
  const isPositive = typeof trend === "string" ? !trend.startsWith("-") : trend >= 0;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 transition-all duration-300 hover:border-brand-primary/40 hover:shadow-[0_8px_30px_rgba(94,192,194,0.10)]">
      {/* Decorative gradient glow on hover */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-brand-primary/5 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">{label}</p>
          {loading ? (
            <Pulse className="mt-3 h-8 w-28" />
          ) : (
            <p className="mt-2 text-[28px] font-extrabold tracking-tight text-zinc-900 leading-none">{value}</p>
          )}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent || "bg-brand-primary/10"} transition-colors duration-300 group-hover:bg-brand-primary/20`}>
          <svg className="h-5 w-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
          </svg>
        </div>
      </div>

      {loading ? (
        <Pulse className="mt-4 h-4 w-20" />
      ) : (
        <div className={`mt-4 flex items-center gap-1.5 text-xs font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d={isPositive ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"} />
          </svg>
          {trend}% {trendLabel || "from last month"}
        </div>
      )}
    </div>
  );
}

// ── Status Bar ───────────────────────────────────────────
function StatusDistributionBar({ draft, completed, approved, rejected, total, loading }) {
  if (loading) return <Pulse className="h-4 w-full rounded-full" />;
  if (total === 0) return <div className="h-4 w-full rounded-full bg-zinc-100" />;

  const draftPct = (draft / total) * 100;
  const completedPct = (completed / total) * 100;
  const approvedPct = (approved / total) * 100;
  const rejectedPct = (rejected / total) * 100;

  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-100">
      <div className="bg-zinc-400 transition-all duration-700 ease-out" style={{ width: `${draftPct}%` }} title={`Draft: ${draft}`} />
      <div className="bg-amber-400 transition-all duration-700 ease-out" style={{ width: `${completedPct}%` }} title={`Review: ${completed}`} />
      <div className="bg-emerald-500 transition-all duration-700 ease-out" style={{ width: `${approvedPct}%` }} title={`Approved: ${approved}`} />
      <div className="bg-red-500 transition-all duration-700 ease-out" style={{ width: `${rejectedPct}%` }} title={`Rejected: ${rejected}`} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ■  MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════
export default function Home() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();

  // Redirect non-admin users to quotations
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/quotations');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [statsData, recentData] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getRecentQuotations(6),
        ]);
        setStats(statsData);
        setRecent(recentData);
      } catch (err) {
        console.error("Dashboard load failed:", err);
        setError("Unable to sync dashboard. Verify connection to central repository.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const trendDelta = stats
    ? stats.trends.quotationsThisMonth - stats.trends.quotationsLastMonth
    : 0;
  const trendPct = stats && stats.trends.quotationsLastMonth > 0
    ? (((stats.trends.quotationsThisMonth - stats.trends.quotationsLastMonth) / stats.trends.quotationsLastMonth) * 100).toFixed(1)
    : stats?.trends.quotationsThisMonth > 0 ? "100" : "0";

  return (
    <DashboardLayout
      title="Command Center"
      primaryAction={
        <button
          onClick={() => (window.location.href = "/quotations/new")}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 text-[13px] font-bold text-white shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-95 border border-brand-primary/20"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Quotation
        </button>
      }
    >
      <div className="flex flex-col h-[calc(100vh-128px)] gap-6 overflow-hidden">
        {/* ── Error Banner ──────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        )}

        {/* ── Page Header ──────────────────────────────── */}
        <div className="shrink-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
            Industrial Precision <span className="text-brand-primary">Dashboard</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400 font-medium">
            Real-time overview of your quotations, materials, and engineering data.
          </p>
        </div>

        {/* ── KPI Cards ────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 shrink-0">
          <KPICard
            label="Total Revenue"
            value={stats ? formatCurrency(stats.totalRevenue) : "—"}
            trend={stats ? stats.trends.revenue : 0}
            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            loading={loading}
          />
          <KPICard
            label="Active Quotations"
            value={stats ? stats.totalQuotations.toLocaleString() : "—"}
            trend={trendPct}
            trendLabel={`${trendDelta >= 0 ? "+" : ""}${trendDelta} this month`}
            icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            loading={loading}
          />
          <KPICard
            label="Materials Indexed"
            value={stats ? stats.totalMaterials.toLocaleString() : "—"}
            trend={stats ? "0" : 0}
            trendLabel="stable"
            icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            loading={loading}
          />
          <KPICard
            label="Drafts"
            value={stats ? stats.draftCount.toLocaleString() : "—"}
            trend={stats ? "0" : 0}
            trendLabel="in progress"
            icon="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            loading={loading}
          />
        </section>

        {/* ── Main Content Grid ────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 flex-1 min-h-0">
          {/* ── Recent Quotations Table (spans 2 cols) ── */}
          <section className="xl:col-span-2 rounded-2xl border border-zinc-200/80 bg-white shadow-sm flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 shrink-0">
              <div>
                <h2 className="text-[15px] font-bold text-zinc-900">Recent Quotations</h2>
                <p className="mt-0.5 text-[11px] text-zinc-400">Latest project valuations from the registry</p>
              </div>
              <button
                onClick={() => router.push("/quotations")}
                className="text-xs font-bold text-brand-primary hover:underline transition-colors"
              >
                View All →
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50/80">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Quote ID</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Date</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><Pulse className="h-4 w-24" /></td>
                        <td className="px-6 py-4"><Pulse className="h-4 w-32" /></td>
                        <td className="px-6 py-4 text-center"><Pulse className="mx-auto h-4 w-16" /></td>
                        <td className="px-6 py-4 text-center"><Pulse className="mx-auto h-5 w-16 rounded-full" /></td>
                        <td className="px-6 py-4 text-right"><Pulse className="ml-auto h-4 w-20" /></td>
                      </tr>
                    ))
                  ) : recent.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-zinc-400">
                          <svg className="h-10 w-10 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm font-medium">No quotations yet</p>
                          <p className="text-xs">Create your first quotation to see it here.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recent.map((row) => (
                      <tr
                        key={row.$id}
                        onClick={() => router.push(`/quotations/edit/${row.$id}`)}
                        className="group cursor-pointer transition-colors hover:bg-zinc-50/80"
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-brand-primary">{row.quotation_no || row.$id.substring(0, 8)}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-600 font-medium">
                          <span className="truncate inline-block max-w-[180px]">{row.supplier_name || "N/A"}</span>
                        </td>
                        <td className="px-6 py-4 text-center text-[11px] font-mono text-zinc-500">
                          {timeAgo(row.$createdAt)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${statusColor(row.status)}`}>
                            {row.status === "Completed" ? "Review" : (row.status || "Draft")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-zinc-900">
                          {formatCurrency(row.total_amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Right Sidebar Column ─────────────────── */}
          <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-2">
            {/* Status Distribution */}
            <div className="shrink-0 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
              <h3 className="text-[13px] font-bold text-zinc-900">Status Distribution</h3>
              <p className="mt-0.5 text-[11px] text-zinc-400 mb-5">Breakdown across all quotations</p>

              <StatusDistributionBar
                draft={stats?.draftCount || 0}
                completed={stats?.completedCount || 0}
                approved={stats?.approvedCount || 0}
                rejected={stats?.rejectedCount || 0}
                total={stats?.totalQuotations || 0}
                loading={loading}
              />

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
                <div className="flex items-center gap-1.5 min-w-[60px]">
                  <span className="h-2 w-2 rounded-full bg-zinc-400" />
                  <span className="text-zinc-500 font-medium tracking-wide">Draft</span>
                  <span className="font-bold text-zinc-900 ml-auto">{loading ? "—" : stats?.draftCount}</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-[70px]">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-zinc-500 font-medium tracking-wide">Review</span>
                  <span className="font-bold text-zinc-900 ml-auto">{loading ? "—" : stats?.completedCount}</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-[70px]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-zinc-500 font-medium tracking-wide">Approved</span>
                  <span className="font-bold text-zinc-900 ml-auto">{loading ? "—" : stats?.approvedCount}</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-[70px]">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-zinc-500 font-medium tracking-wide">Rejected</span>
                  <span className="font-bold text-zinc-900 ml-auto">{loading ? "—" : stats?.rejectedCount}</span>
                </div>
              </div>

              {/* Customer / Quotation summary */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-zinc-50 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Customers</p>
                  <p className="mt-1 text-xl font-extrabold text-zinc-900">{loading ? "—" : stats?.totalCustomers}</p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Approved</p>
                  <p className="mt-1 text-xl font-extrabold text-emerald-600">{loading ? "—" : stats?.approvedCount}</p>
                </div>
              </div>
            </div>


          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
