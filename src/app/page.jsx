"use client";

import React, { useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { THEME } from "@/constants/ui";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  FileText, 
  Box, 
  Edit3, 
  ChevronRight, 
  Users,
  Database
} from "lucide-react";
import { useDashboardStats, useRecentQuotations } from "@/features/dashboard/api/useDashboard";

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
function KPICard({ label, value, trend, trendLabel, icon: Icon, loading, accent }) {
  const isPositive = typeof trend === "string" ? !trend.startsWith("-") : trend >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 transition-all duration-300 hover:border-brand-primary/40 hover:shadow-[0_8px_30px_rgba(94,192,194,0.10)]">
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-brand-primary/5 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-bold uppercase tracking-[0.12em] text-zinc-400" style={{ fontSize: '10px' }}>{label}</p>
          {loading ? (
            <Pulse className="mt-3 h-8 w-28" />
          ) : (
            <p className="mt-2 font-extrabold tracking-tight text-zinc-900 leading-none" style={{ fontSize: THEME.FONT_SIZE.XXLARGE }}>{value}</p>
          )}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent || "bg-brand-primary/10"} transition-colors duration-300 group-hover:bg-brand-primary/20`}>
          <Icon className="h-5 w-5 text-brand-primary" />
        </div>
      </div>

      {loading ? (
        <Pulse className="mt-4 h-4 w-20" />
      ) : (
        <div className={`mt-4 flex items-center gap-1.5 font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`} style={{ fontSize: THEME.FONT_SIZE.TINY }}>
          <TrendIcon className="h-3.5 w-3.5" />
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

export default function Home() {
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recent, isLoading: recentLoading } = useRecentQuotations(6);
  const loading = statsLoading || recentLoading;

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/quotations-draft');
    }
  }, [authLoading, isAdmin, router]);

  const trendDelta = stats
    ? stats.trends.quotationsThisMonth - stats.trends.quotationsLastMonth
    : 0;
  const trendPct = stats && stats.trends.quotationsLastMonth > 0
    ? (((stats.trends.quotationsThisMonth - stats.trends.quotationsLastMonth) / stats.trends.quotationsLastMonth) * 100).toFixed(1)
    : stats?.trends.quotationsThisMonth > 0 ? "100" : "0";

  if (authLoading || !isAdmin) return null;

  return (
    <DashboardLayout
      title="Command Center"
      primaryAction={
        <button
          onClick={() => router.push('/quotations-draft/new')}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 text-white shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-95 border border-brand-primary/20"
          style={{ fontSize: THEME.FONT_SIZE.BASE, fontWeight: 'bold' }}
        >
          <Plus className="h-4 w-4" />
          New Quotation
        </button>
      }
    >
      <div className="flex flex-col h-[calc(100vh-128px)] gap-6 overflow-hidden">
        <div className="shrink-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
            Industrial Precision <span className="text-brand-primary">Dashboard</span>
          </h1>
          <p className="mt-1 font-medium text-zinc-400" style={{ fontSize: THEME.FONT_SIZE.SMALL }}>
            Real-time overview of your quotations, materials, and engineering data.
          </p>
        </div>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 shrink-0">
          <KPICard
            label="Total Revenue"
            value={stats ? formatCurrency(stats.totalRevenue) : "—"}
            trend={stats ? stats.trends.revenue : 0}
            icon={TrendingUp}
            loading={loading}
          />
          <KPICard
            label="Active Quotations"
            value={stats ? stats.totalQuotations.toLocaleString() : "—"}
            trend={trendPct}
            trendLabel={`${trendDelta >= 0 ? "+" : ""}${trendDelta} this month`}
            icon={FileText}
            loading={loading}
          />
          <KPICard
            label="Materials Indexed"
            value={stats ? stats.totalMaterials.toLocaleString() : "—"}
            trend={stats ? "0" : 0}
            trendLabel="stable"
            icon={Box}
            loading={loading}
          />
          <KPICard
            label="Drafts"
            value={stats ? stats.draftCount.toLocaleString() : "—"}
            trend={stats ? "0" : 0}
            trendLabel="in progress"
            icon={Edit3}
            loading={loading}
          />
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 flex-1 min-h-0">
          <section className="xl:col-span-2 rounded-2xl border border-zinc-200/80 bg-white shadow-sm flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 shrink-0">
              <div>
                <h2 className="font-bold text-zinc-900" style={{ fontSize: '15px' }}>Recent Quotations</h2>
                <p className="mt-0.5 text-zinc-400" style={{ fontSize: '11px' }}>Latest project valuations from the registry</p>
              </div>
              <button
                onClick={() => router.push("/quotations-draft")}
                className="font-bold text-brand-primary hover:underline transition-colors"
                style={{ fontSize: THEME.FONT_SIZE.TINY }}
              >
                View All →
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50/80">
                  <tr style={{ fontSize: '10px' }}>
                    <th className="px-6 py-3 font-bold text-zinc-400 uppercase tracking-widest">Quote ID</th>
                    <th className="px-6 py-3 font-bold text-zinc-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-3 font-bold text-zinc-400 uppercase tracking-widest text-center">Date</th>
                    <th className="px-6 py-3 font-bold text-zinc-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-3 font-bold text-zinc-400 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="5" className="px-6 py-4"><Pulse className="h-4 w-full" /></td>
                      </tr>
                    ))
                  ) : !recent || recent.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-zinc-400">
                          <FileText className="h-10 w-10 text-zinc-300" />
                          <p className="text-sm font-medium">No quotations yet</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recent.map((row) => (
                      <tr
                        key={row.$id}
                        onClick={() => router.push(`/quotations-draft/edit?id=${row.$id}`)}
                        className="group cursor-pointer transition-all duration-200 hover:bg-brand-primary/[0.04] even:bg-[#F8FBFC]"
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-brand-primary" style={{ fontSize: THEME.FONT_SIZE.SMALL }}>{row.quotation_no || row.$id.substring(0, 8)}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-600 font-medium">
                          <span className="truncate inline-block max-w-[180px]" style={{ fontSize: THEME.FONT_SIZE.SMALL }}>{row.supplier_name || "N/A"}</span>
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-zinc-500" style={{ fontSize: '11px' }}>
                          {timeAgo(row.$createdAt)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 font-bold uppercase tracking-widest ${statusColor(row.status)}`} style={{ fontSize: '10px' }}>
                            {row.status === "Completed" ? "Review" : (row.status || "Draft")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-zinc-900" style={{ fontSize: THEME.FONT_SIZE.BASE }}>
                          {formatCurrency(row.total_amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-2">
            <div className="shrink-0 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-zinc-900" style={{ fontSize: '13px' }}>Status Distribution</h3>
              <p className="mt-0.5 text-zinc-400 mb-5" style={{ fontSize: '11px' }}>Breakdown across all quotations</p>

              <StatusDistributionBar
                draft={stats?.draftCount || 0}
                completed={stats?.completedCount || 0}
                approved={stats?.approvedCount || 0}
                rejected={stats?.rejectedCount || 0}
                total={stats?.totalQuotations || 0}
                loading={loading}
              />

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2" style={{ fontSize: '11px' }}>
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

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-zinc-50 p-3 text-center">
                  <p className="font-bold uppercase tracking-wider text-zinc-400" style={{ fontSize: '10px' }}>Customers</p>
                  <p className="mt-1 font-extrabold text-zinc-900" style={{ fontSize: THEME.FONT_SIZE.XLARGE }}>{loading ? "—" : stats?.totalCustomers}</p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3 text-center">
                  <p className="font-bold uppercase tracking-wider text-zinc-400" style={{ fontSize: '10px' }}>Approved</p>
                  <p className="mt-1 font-extrabold text-emerald-600" style={{ fontSize: THEME.FONT_SIZE.XLARGE }}>{loading ? "—" : stats?.approvedCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
