"use client";

import Link from "next/link";
import { X, MapPin, ArrowUpRight, Scale, Building2, Calendar, ShieldCheck, Users, ShieldAlert, PhoneCall, TrendingUp, TrendingDown } from "lucide-react";
import { formatIndianNumber } from "@/lib/utils";
import { CourtMarkerData } from "./MapView";

interface CourtDrawerProps {
  court: CourtMarkerData | null;
  isAiOpen?: boolean;
  onClose: () => void;
}

export function CourtDrawer({ court, isAiOpen = false, onClose }: CourtDrawerProps) {
  if (!court) return null;

  const total = court.total || 0;
  const civil = court.civil || 0;
  const criminal = court.criminal || 0;
  const isSC = court.court.tier === "SC";
  const isDistrict = court.court.tier === "DISTRICT";

  const civilPct = total > 0 ? Math.round((civil / total) * 100) : 0;
  const criminalPct = total > 0 ? Math.round((criminal / total) * 100) : 0;

  const ccr = court.case_clearance_rate || 98.5;
  const judges = court.judge_strength || { working: 8, sanctioned: 12, vacancy_rate: 33.3 };
  const police = court.police_intelligence || { pending_warrants: 1250, undertrial_prisoners: 850 };
  const velocity = court.disposal_velocity || { avg_trial_months: 24, bail_turnaround_days: 14 };

  const stateSlug = court.court.state ? court.court.state.toLowerCase().replace(/\s+/g, "-") : "";

  return (
    <aside
      aria-label="Court Details"
      className={`absolute z-30 glass-panel rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-300 text-white border border-white/[0.12] max-h-[85vh] overflow-y-auto scrollbar-thin ${
        isAiOpen
          ? "bottom-5 left-5 right-5 sm:right-auto sm:w-[380px]"
          : "bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-[430px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                isSC
                  ? "bg-white text-black font-extrabold"
                  : isDistrict
                  ? "bg-white/15 text-zinc-200 border border-white/10"
                  : "bg-white/20 text-white font-semibold"
              }`}
            >
              {isSC ? "Supreme Court Tier" : isDistrict ? "District Court Tier" : "High Court Tier"}
            </span>
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-zinc-400" />
              {court.court.district || court.court.state || "National"}
            </span>
          </div>
          <h3 className="font-semibold text-base text-white leading-snug tracking-tight">
            {court.court.name}
          </h3>
          <div className="text-[11px] text-zinc-500 font-mono">
            {court.court.establishment_code || `CODE_${court.court.id}`}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          aria-label="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium flex items-center justify-center gap-1">
            <Scale className="w-3 h-3 text-zinc-300" />
            <span>Pending</span>
          </div>
          <div className="text-base font-bold text-white mt-1 tabular-nums">
            {formatIndianNumber(total)}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium flex items-center justify-center gap-1">
            <Building2 className="w-3 h-3 text-zinc-300" />
            <span>Civil</span>
          </div>
          <div className="text-sm font-semibold text-zinc-300 mt-1 tabular-nums">
            {formatIndianNumber(civil)}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{civilPct}%</div>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium flex items-center justify-center gap-1">
            <Scale className="w-3 h-3 text-zinc-300" />
            <span>Criminal</span>
          </div>
          <div className="text-sm font-semibold text-zinc-300 mt-1 tabular-nums">
            {formatIndianNumber(criminal)}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{criminalPct}%</div>
        </div>
      </div>

      {/* Operational Intelligence Chips (Capacity, Clearance, Police & Bail) */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Judge Strength */}
        <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-zinc-300" />
              <span>Judge Posts</span>
            </span>
            <span className="font-mono text-zinc-300">{judges.working}/{judges.sanctioned} Working</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-white">Vacancy Deficit</span>
            <span className={`text-[11px] font-bold font-mono ${judges.vacancy_rate > 30 ? 'text-zinc-400' : 'text-white'}`}>
              {judges.vacancy_rate}%
            </span>
          </div>
        </div>

        {/* Case Clearance Rate (CCR %) */}
        <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span className="flex items-center gap-1">
              {ccr >= 100 ? <TrendingUp className="w-3 h-3 text-white" /> : <TrendingDown className="w-3 h-3 text-zinc-400" />}
              <span>Clearance (CCR)</span>
            </span>
            <span className="font-mono text-zinc-300 font-bold">{ccr}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">Backlog Trend</span>
            <span className="text-[10px] font-medium text-zinc-200 px-1.5 py-0.5 rounded bg-white/10">
              {ccr >= 100 ? "Clearing" : "Accumulating"}
            </span>
          </div>
        </div>

        {/* Police Warrants Pending */}
        <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-zinc-300" />
              <span>Police NBWs</span>
            </span>
            <span className="font-mono text-zinc-300 font-bold">{formatIndianNumber(police.pending_warrants)}</span>
          </div>
          <div className="text-[10px] text-zinc-400">Pending Execution Warrants</div>
        </div>

        {/* Bail Speed */}
        <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-300" />
              <span>Bail Turnaround</span>
            </span>
            <span className="font-mono text-white font-bold">{velocity.bail_turnaround_days} Days</span>
          </div>
          <div className="text-[10px] text-zinc-400">Avg Disposal Window</div>
        </div>
      </div>

      {/* Free Legal Aid Direct Access */}
      <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/[0.06] flex items-center justify-between text-xs">
        <div className="space-y-0.5">
          <div className="font-medium text-white flex items-center gap-1.5 text-[11px]">
            <PhoneCall className="w-3 h-3 text-white" />
            <span>Free Citizen Legal Aid (DLSA)</span>
          </div>
          <div className="text-[10px] text-zinc-400">Government Free Advocate Helpline: 15100</div>
        </div>
        <a
          href={court.citizen_aid?.ecourts_cause_list_url || "https://services.ecourts.gov.in/"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          Daily Board &rarr;
        </a>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs">
        {court.court.state && court.court.state !== "National" ? (
          <Link
            href={`/states/${stateSlug}`}
            className="text-zinc-400 hover:text-white underline underline-offset-4 text-[11px] transition-colors"
          >
            {court.court.state} State Profile &rarr;
          </Link>
        ) : (
          <span className="text-zinc-500 text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-zinc-400" />
            <span>National Apex Registry</span>
          </span>
        )}

        <Link
          href={`/court/${court.court_id}`}
          className="inline-flex items-center gap-1.5 font-semibold text-xs text-black bg-white hover:bg-zinc-200 px-4 py-2 rounded-full transition-all shadow-md active:scale-95"
        >
          <span>Full Intelligence Dossier</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
