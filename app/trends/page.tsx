"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { TrendingUp, ArrowLeft, BarChart3, Scale, ShieldCheck, Clock, Users, ArrowUpRight, Filter } from "lucide-react";
import Link from "next/link";

// 5-Year National Judicial Trajectory Aggregate Data (2022 - 2026)
const NATIONAL_HISTORICAL_DATA = [
  { year: 2022, instituted: 21500000, disposed: 20800000, pending: 41200000, ccr: 96.7 },
  { year: 2023, instituted: 22800000, disposed: 22100000, pending: 42800000, ccr: 96.9 },
  { year: 2024, instituted: 23900000, disposed: 23600000, pending: 43900000, ccr: 98.7 },
  { year: 2025, instituted: 24600000, disposed: 24400000, pending: 44300000, ccr: 99.2 },
  { year: 2026, instituted: 25100000, disposed: 25300000, pending: 44800000, ccr: 100.8 },
];

const STATE_PERFORMANCE_DATA = [
  { state: "Maharashtra", ccr: 104.2, pending: 5120000, bailDays: 14, status: "Clearing" },
  { state: "Kerala", ccr: 103.8, pending: 1840000, bailDays: 11, status: "Clearing" },
  { state: "Tamil Nadu", ccr: 102.5, pending: 2200000, bailDays: 13, status: "Clearing" },
  { state: "Karnataka", ccr: 101.1, pending: 2140000, bailDays: 15, status: "Clearing" },
  { state: "Delhi", ccr: 99.4, pending: 1420000, bailDays: 16, status: "Balanced" },
  { state: "Gujarat", ccr: 98.2, pending: 1980000, bailDays: 18, status: "Accumulating" },
  { state: "Bihar", ccr: 95.6, pending: 3450000, bailDays: 24, status: "Accumulating" },
  { state: "Uttar Pradesh", ccr: 94.2, pending: 10540000, bailDays: 26, status: "Accumulating" },
];

export default function TrendsPage() {
  const [activeMetric, setActiveMetric] = useState<"pending" | "ccr" | "instituted">("pending");

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      <Navbar asOf="M0 Justice Intelligence Baseline" />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to National Map</span>
          </Link>

          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400">
              <TrendingUp className="w-4 h-4 text-white" />
              <span>National Longitudinal Trajectory</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              5-Year Judicial Pendency & Clearance Trends
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Longitudinal analysis of institution volume, disposal velocity, and Case Clearance Rates (CCR) across Indian courts from 2022 to 2026.
            </p>
          </div>
        </div>

        {/* 5-Year National Trajectory Visualizer */}
        <section className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-white" />
                <span>National Docket Trajectory (2022 – 2026)</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Annual inflow of fresh filings versus disposed matters in millions
              </p>
            </div>

            {/* Metric Segmented Toggle */}
            <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06] text-xs">
              <button
                onClick={() => setActiveMetric("pending")}
                className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                  activeMetric === "pending" ? "bg-white text-black font-semibold shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                Total Backlog
              </button>
              <button
                onClick={() => setActiveMetric("ccr")}
                className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                  activeMetric === "ccr" ? "bg-white text-black font-semibold shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                Clearance (CCR)
              </button>
              <button
                onClick={() => setActiveMetric("instituted")}
                className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                  activeMetric === "instituted" ? "bg-white text-black font-semibold shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                Instituted vs Disposed
              </button>
            </div>
          </div>

          {/* Chart Grid Visualization */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {NATIONAL_HISTORICAL_DATA.map((item) => {
              const heightPct = Math.round((item.pending / 50000000) * 100);
              const isLatest = item.year === 2026;

              return (
                <div
                  key={item.year}
                  className={`rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-4 ${
                    isLatest
                      ? "bg-white/[0.06] border-white/20 shadow-lg"
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-white">{item.year}</span>
                    {isLatest && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Relative Volume Visual Column */}
                  <div className="w-full bg-white/[0.04] h-28 rounded-xl flex items-end p-1.5 overflow-hidden">
                    <div
                      className={`w-full rounded-lg transition-all duration-700 ease-out flex items-center justify-center text-[10px] font-mono font-bold ${
                        item.ccr >= 100 ? "bg-white text-black" : "bg-zinc-600 text-white"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    >
                      {item.ccr}%
                    </div>
                  </div>

                  <div className="space-y-1 text-xs pt-1 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Pending:</span>
                      <strong className="text-white font-mono">{(item.pending / 1000000).toFixed(1)}M</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Disposed:</span>
                      <span className="text-zinc-300 font-mono">{(item.disposed / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* State Performance & Clearance Speed Leaderboard */}
        <section className="glass-panel rounded-3xl p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-white" />
                <span>State Case Clearance Rate (CCR) Leaderboard</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                CCR &gt; 100% indicates courts are actively reducing older legacy backlogs
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-left text-xs">
              <thead className="text-zinc-400 bg-black/80 sticky top-0 border-b border-white/10 backdrop-blur-md">
                <tr>
                  <th className="py-3 px-4 font-medium">State Jurisdiction</th>
                  <th className="py-3 px-4 font-medium text-right">Active Caseload</th>
                  <th className="py-3 px-4 font-medium text-right">Clearance (CCR)</th>
                  <th className="py-3 px-4 font-medium text-right">Bail Speed</th>
                  <th className="py-3 px-4 font-medium text-center">Trajectory Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300 bg-black/30">
                {STATE_PERFORMANCE_DATA.map((row) => (
                  <tr key={row.state} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white">{row.state}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-zinc-200">
                      {(row.pending / 100000).toFixed(2)} Lakh
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {row.ccr}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-zinc-300">
                      {row.bailDays} Days
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-semibold ${
                          row.status === "Clearing"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : row.status === "Balanced"
                            ? "bg-white/10 text-zinc-300 border border-white/10"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
