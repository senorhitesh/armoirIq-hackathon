"use client";

import { useState } from "react";
import Button from "@/components/_ui/button";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";
import { 
  TrendingUp, 
  Eye, 
  MousePointerClick, 
  DollarSign, 
  Wallet, 
  Filter, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  ChevronDown
} from "lucide-react";

interface RecentPostItem {
  id: string;
  title: string;
  platform: "Meta" | "Instagram" | "LinkedIn" | "YouTube";
  status: "Live Published" | "Pending Approval" | "Scheduled" | "Draft";
  statusColor: string;
  views: string;
  ctr: string;
  spend: string;
  date: string;
}

const RECENT_POSTS: RecentPostItem[] = [
  {
    id: "post-1",
    title: "ScaleFlow Q4 Contrarian Growth Ad",
    platform: "LinkedIn",
    status: "Live Published",
    statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    views: "428,900",
    ctr: "5.12%",
    spend: "$3,240",
    date: "Sep 28, 2026",
  },
  {
    id: "post-2",
    title: "Meta 3-Second Urgency Hook Script",
    platform: "Meta",
    status: "Pending Approval",
    statusColor: "text-amber-700 bg-amber-50 border-amber-200",
    views: "312,400",
    ctr: "4.88%",
    spend: "$2,650",
    date: "Sep 25, 2026",
  },
  {
    id: "post-3",
    title: "YouTube Shorts: AI Rogue Agent Leaks",
    platform: "YouTube",
    status: "Scheduled",
    statusColor: "text-blue-700 bg-blue-50 border-blue-200",
    views: "184,200",
    ctr: "3.92%",
    spend: "$1,800",
    date: "Sep 22, 2026",
  },
  {
    id: "post-4",
    title: "CAC Mythbuster 2026 Carousel",
    platform: "Instagram",
    status: "Live Published",
    statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    views: "542,100",
    ctr: "4.65%",
    spend: "$4,120",
    date: "Sep 19, 2026",
  },
  {
    id: "post-5",
    title: "Zero-Trust Attribution Explainer",
    platform: "LinkedIn",
    status: "Live Published",
    statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    views: "294,000",
    ctr: "4.21%",
    spend: "$2,210",
    date: "Sep 15, 2026",
  },
  {
    id: "post-6",
    title: "Autonomous Ad Scaling Deep-Dive",
    platform: "Meta",
    status: "Draft",
    statusColor: "text-slate-600 bg-slate-100 border-slate-200",
    views: "81,200",
    ctr: "3.10%",
    spend: "$800",
    date: "Sep 11, 2026",
  },
];

const MONTHLY_BARS = [
  { month: "Apr", value: 45, label: "45k" },
  { month: "May", value: 30, label: "30k" },
  { month: "Jun", value: 65, label: "65k" },
  { month: "Jul", value: 58, label: "58k" },
  { month: "Aug", value: 120, label: "120k pcs", active: true },
  { month: "Sep", value: 92, label: "92k" },
  { month: "Oct", value: 84, label: "84k" },
  { month: "Nov", value: 105, label: "105k" },
];

const UPCOMING_DELIVERIES = [
  { id: "ORD-2341", item: "Meta Contrarian Lead Magnets", qty: "600 pcs", date: "Sep 29, 2026", status: "Scheduled", statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { id: "ORD-2342", item: "LinkedIn Video Ad Series #3", qty: "400 pcs", date: "Sep 23, 2026", status: "On The Way", statusColor: "text-blue-700 bg-blue-50 border-blue-200" },
  { id: "ORD-2343", item: "YouTube Shorts Script Batch", qty: "300 pcs", date: "Sep 21, 2026", status: "Scheduled", statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { id: "ORD-2344", item: "Retargeting Dynamic Creative", qty: "850 pcs", date: "Sep 18, 2026", status: "Completed", statusColor: "text-slate-600 bg-slate-100 border-slate-200" },
];

export default function Overview() {
  const setNav = useUiStore((state) => state.setNav);
  const setTab = useUiStore((state) => state.setTab);
  const openDialog = useUiStore((state) => state.openDialog);
  const toast = useUiStore((state) => state.toast);
  const [selectedMonth, setSelectedMonth] = useState("Last Month");
  const [hoveredBar, setHoveredBar] = useState<number | null>(4); // August by default
  const [checkedOrders, setCheckedOrders] = useState<Record<string, boolean>>({ "ORD-2341": true });

  const toggleCheck = (id: string) => {
    setCheckedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="scroll-thin min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-4 lg:p-6">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">

        {/* Top Header / Welcome Banner matching Image 2 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <span>Welcome, Campaign Commander</span>
                <span className="text-xl">👋</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage ad campaigns, track CTR delivery, and govern multi-agent spend — all in one place.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setNav("workspace");
                setTab("issues");
              }}
              className="gap-1.5 font-medium text-xs shadow-2xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            >
              <span>Open Kanban</span>
              <ArrowUpRight className="size-3.5" />
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => openDialog({ type: "new-task" })}
              className="gap-1.5 font-medium text-xs shadow-2xs bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              <Sparkles className="size-3.5" />
              <span>New Ad Task</span>
            </Button>
          </div>
        </div>

        {/* 
          PRIMARY WIREFRAME METRIC CARDS (Image 1):
          Row 1: CTR (highlighted blue) | TOTAL VIEWS (wide) | CONVERSION RATE
          Row 2: MONEY SPENT IN 30 DAYS | BUDGET REMAINING
          Right Column: RECENT POST (spans both rows)
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column: 5 Metrics Cards & Detailed Charts (lg:col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            
            {/* ROW 1: CTR, TOTAL VIEWS, CONVERSION RATE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* 1. CTR Card - Explicitly highlighted with blue border in wireframe */}
              <div className="group relative rounded-2xl bg-white p-5 border-2 border-blue-500 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    CTR
                  </span>
                  <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <MousePointerClick className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    4.82%
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <TrendingUp className="size-3.5" />
                  <span>+1.35% vs Last Month</span>
                </div>
                {/* Mini sparkline curve indicator */}
                <div className="mt-3 h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[78%]" />
                </div>
              </div>

              {/* 2. TOTAL VIEWS Card - Wide in wireframe */}
              <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-xs transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    TOTAL VIEWS
                  </span>
                  <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Eye className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    1,842,500
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <TrendingUp className="size-3.5" />
                  <span>+24.8% vs Last Month</span>
                </div>
                <div className="mt-3 h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
                </div>
              </div>

              {/* 3. CONVERSION RATE Card */}
              <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-xs transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    CONVERSION RATE
                  </span>
                  <div className="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <TrendingUp className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    3.65%
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <TrendingUp className="size-3.5" />
                  <span>+0.85% vs Target</span>
                </div>
                <div className="mt-3 h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-[65%]" />
                </div>
              </div>
            </div>

            {/* ROW 2: MONEY SPENT IN 30 DAYS & BUDGET REMAINING */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 4. MONEY SPENT IN 30 DAYS Card */}
              <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-xs transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      MONEY SPENT IN 30 DAYS
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pacing at 59.3% of $25,000 cap
                    </p>
                  </div>
                  <div className="size-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <DollarSign className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    $14,820
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    / $25,000 cap
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                    <span>Spent: $14,820</span>
                    <span>59.3%</span>
                  </div>
                  <div className="h-2 w-full bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[59.3%]" />
                  </div>
                </div>
              </div>

              {/* 5. BUDGET REMAINING Card */}
              <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-xs transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      BUDGET REMAINING
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Safe allowance for remaining period
                    </p>
                  </div>
                  <div className="size-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                    <Wallet className="size-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    $10,180
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                    $339 / day
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircle2 className="size-3.5" />
                    ArmorIQ Sandbox Limit Enforced
                  </span>
                  <span className="font-semibold text-slate-700">12 Days Left</span>
                </div>
              </div>
            </div>

            {/* OVERVIEW BAR CHART (Image 2 Reference Design) */}
            <div className="rounded-2xl bg-white p-6 border border-slate-200/90 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Overview</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 font-medium">Avg Per month</span>
                    <span className="text-base font-extrabold text-slate-900 tracking-tight">1,860/3K</span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      56.2% ↗
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-8 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-none"
                  >
                    <option value="Last Month">Last Month</option>
                    <option value="Last 3 Months">Last 3 Months</option>
                    <option value="Year to Date">Year to Date</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
                </div>
              </div>

              {/* Monthly Delivery Bar Chart */}
              <div className="mt-6 flex h-48 items-end justify-between gap-3 px-2">
                {MONTHLY_BARS.map((bar, index) => {
                  const isHovered = hoveredBar === index;
                  const heightPercent = Math.round((bar.value / 120) * 100);
                  return (
                    <div
                      key={bar.month}
                      onMouseEnter={() => setHoveredBar(index)}
                      className="group relative flex flex-1 flex-col items-center justify-end h-full cursor-pointer"
                    >
                      {/* Active Tooltip Popover matching Image 2 "August 2026 120 pcs" */}
                      {isHovered && (
                        <div className="absolute -top-10 z-20 flex flex-col items-center">
                          <div className="rounded-lg bg-blue-600 px-2.5 py-1 text-center shadow-lg shadow-blue-600/20">
                            <span className="block text-[10px] font-semibold text-blue-100 uppercase tracking-wider">
                              {bar.month} 2026
                            </span>
                            <span className="block text-xs font-bold text-white">
                              {bar.label}
                            </span>
                          </div>
                          <div className="h-1.5 w-1.5 rotate-45 bg-blue-600 -mt-1" />
                        </div>
                      )}

                      {/* Bar Column */}
                      <div className="relative w-full max-w-[42px] h-full flex items-end">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-xl transition-all duration-300 ${
                            isHovered
                              ? "bg-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20"
                              : "bg-slate-100 hover:bg-slate-200"
                          }`}
                        >
                          {/* Diagonal pattern stripes matching wireframe */}
                          <div className={`h-full w-full rounded-t-xl opacity-20 ${
                            isHovered
                              ? "bg-[repeating-linear-gradient(45deg,#fff,#fff_2px,transparent_2px,transparent_6px)]"
                              : "bg-[repeating-linear-gradient(45deg,#64748b,#64748b_2px,transparent_2px,transparent_6px)]"
                          }`} />
                        </div>
                      </div>

                      {/* Month label */}
                      <span className={`mt-2 text-xs font-semibold transition-colors ${
                        isHovered ? "text-slate-900 font-bold" : "text-slate-500"
                      }`}>
                        {bar.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* UPCOMING DELIVERIES TABLE (Image 2 Reference Design) */}
            <div className="rounded-2xl bg-white p-6 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Upcoming Deliveries & Scheduled Ads</h2>
                  <p className="text-xs text-slate-500">Governed ad releases awaiting schedule timestamp</p>
                </div>
                <button
                  type="button"
                  onClick={() => toast("Applied delivery status filter")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                >
                  <Filter className="size-3" />
                  <span>Filter</span>
                </button>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-2.5 px-3 w-8">#</th>
                      <th className="py-2.5 px-3">ID Order</th>
                      <th className="py-2.5 px-3">Item / Ad Creative</th>
                      <th className="py-2.5 px-3">Qty / Reach</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {UPCOMING_DELIVERIES.map((delivery) => {
                      const isChecked = Boolean(checkedOrders[delivery.id]);
                      return (
                        <tr key={delivery.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCheck(delivery.id)}
                              className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            {delivery.id}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {delivery.item}
                          </td>
                          <td className="py-3 px-3 text-slate-500 font-medium">
                            {delivery.qty}
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {delivery.date}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${delivery.statusColor}`}>
                              {delivery.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* 
            Right Column: RECENT POST (Image 1 Wireframe & Image 2 Buying History)
            Dedicated vertical card container with post entries
          */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                    <span>RECENT POST</span>
                    <span className="text-xs font-normal text-slate-400 font-mono">
                      ({RECENT_POSTS.length})
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Multi-platform ad delivery status
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNav("workspace");
                    setTab("issues");
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto font-semibold"
                >
                  View All
                </Button>
              </div>

              {/* Vertical Stack of Posts matching Wireframe image */}
              <div className="mt-4 flex flex-col gap-3">
                {RECENT_POSTS.map((post) => (
                  <div
                    key={post.id}
                    className="group relative flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-all hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                        {post.platform}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${post.statusColor}`}>
                        {post.status}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      {post.title}
                    </h3>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/70">
                      <span className="font-semibold text-slate-700">
                        {post.views} views
                      </span>
                      <span className="font-bold text-blue-600">
                        CTR: {post.ctr}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {post.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toast("Syncing live Meta Ads API data...")}
                  className="w-full justify-center text-xs font-semibold gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs"
                >
                  <ExternalLink className="size-3" />
                  <span>Sync Meta Graph API</span>
                </Button>
              </div>
            </div>

            {/* Quick ArmorIQ Sandbox Security Card */}
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-cyan-50/60 p-4 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Zero-Trust Sandbox Protected</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    All scheduled ad actions are tokenized via ArmorIQ Merkle proofs before Meta API dispatch. No budget overruns or unauthorized publishes permitted.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
