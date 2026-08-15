"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { LayerToggles } from "@/components/LayerToggles";
import { Legend } from "@/components/Legend";
import { CourtDrawer } from "@/components/CourtDrawer";
import { NyayaCopilot } from "@/components/NyayaCopilot";
import { CourtMarkerData } from "@/components/MapView";
import { formatIndianNumber } from "@/lib/utils";
import { getStateMeta } from "@/lib/states";
import { MapActionPayload } from "@/app/api/ai/chat/route";
import { Scale, Building2, MapPin, ArrowRight, RotateCcw, Users, TrendingUp, Search, X } from "lucide-react";
import Link from "next/link";

const MapView = dynamic(() => import("@/components/MapView").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[600px] bg-black flex items-center justify-center text-zinc-500 font-mono text-xs rounded-3xl border border-white/10">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <span className="tracking-widest uppercase text-[10px]">Loading Map...</span>
      </div>
    </div>
  ),
});

function HomeContent() {
  const searchParams = useSearchParams();
  const [courtsData, setCourtsData] = useState<CourtMarkerData[]>([]);
  const [selectedTier, setSelectedTier] = useState<"ALL" | "SC" | "HC" | "DISTRICT">("ALL");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedCourt, setSelectedCourt] = useState<CourtMarkerData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [targetFlight, setTargetFlight] = useState<{ lat: number; lon: number; zoom?: number; pitch?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/pendency");
        const json = await res.json();
        if (json.data) {
          setCourtsData(json.data);

          // Handle URL query parameters (e.g. ?court=2 or ?state=maharashtra)
          const courtParam = searchParams.get("court");
          const stateParam = searchParams.get("state");
          const aiParam = searchParams.get("ai");

          if (courtParam) {
            const matched = json.data.find((c: CourtMarkerData) => c.court_id.toString() === courtParam);
            if (matched) {
              setSelectedCourt(matched);
              setTargetFlight({ lat: matched.court.lat, lon: matched.court.lon, zoom: 11, pitch: 36 });
            }
          } else if (stateParam) {
            setSelectedState(stateParam.toLowerCase().replace(/\s+/g, "-"));
          }

          if (aiParam === "true" || aiParam === "1") {
            setIsAiOpen(true);
          }
        }
      } catch (err) {
        console.error("Failed to load courts pendency data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [searchParams]);

  const stateMeta = useMemo(() => {
    return selectedState !== "ALL" ? getStateMeta(selectedState) : null;
  }, [selectedState]);

  // Filtered dataset for stats and table
  const visibleCourts = useMemo(() => {
    return courtsData.filter((c) => {
      if (selectedTier !== "ALL" && c.court.tier !== selectedTier) return false;
      if (selectedState !== "ALL") {
        const courtState = c.court.state?.toLowerCase().replace(/\s+/g, "-");
        const match =
          courtState === selectedState.toLowerCase().replace(/\s+/g, "-") ||
          c.court.state?.toLowerCase().includes(selectedState.toLowerCase());
        if (!match && c.court.tier !== "SC") return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.court.name?.toLowerCase().includes(q);
        const matchesDistrict = c.court.district?.toLowerCase().includes(q);
        const matchesState = c.court.state?.toLowerCase().includes(q);
        if (!matchesName && !matchesDistrict && !matchesState) return false;
      }
      return true;
    });
  }, [courtsData, selectedTier, selectedState, searchQuery]);

  const stats = useMemo(() => {
    let totalAll = 0;
    let totalSC = 0;
    let totalHC = 0;
    let totalDistrict = 0;
    let totalWorkingJudges = 0;
    let totalSanctionedJudges = 0;
    let totalCcrSum = 0;

    visibleCourts.forEach((c) => {
      totalAll += c.total || 0;
      if (c.court.tier === "SC") totalSC += c.total || 0;
      if (c.court.tier === "HC") totalHC += c.total || 0;
      if (c.court.tier === "DISTRICT") totalDistrict += c.total || 0;

      if (c.judge_strength) {
        totalWorkingJudges += c.judge_strength.working;
        totalSanctionedJudges += c.judge_strength.sanctioned;
      }
      if (c.case_clearance_rate) {
        totalCcrSum += c.case_clearance_rate;
      }
    });

    const avgVacancyRate =
      totalSanctionedJudges > 0
        ? Math.round(((totalSanctionedJudges - totalWorkingJudges) / totalSanctionedJudges) * 100)
        : 0;

    const avgCcr = visibleCourts.length > 0 ? (totalCcrSum / visibleCourts.length).toFixed(1) : "0";

    return {
      totalAll,
      totalSC,
      totalHC,
      totalDistrict,
      totalWorkingJudges,
      totalSanctionedJudges,
      avgVacancyRate,
      avgCcr,
      count: visibleCourts.length,
    };
  }, [visibleCourts]);

  // AI Map Action Handler (Auto-Zoom, Filter & Focus with Zero Map Obstruction)
  const handleMapAction = (action: MapActionPayload) => {
    // Dismiss any existing drawer overlay so user has 100% full map visibility
    setSelectedCourt(null);

    if (action.state) {
      const slug = action.state.toLowerCase().replace(/\s+/g, "-");
      setSelectedState(slug);
    }
    if (action.tier) {
      setSelectedTier(action.tier);
    }
    if (action.lat && action.lon) {
      setTargetFlight({
        lat: action.lat,
        lon: action.lon,
        zoom: action.zoom || 10,
        pitch: 36,
      });
    }
  };

  return (
    <div className="flex h-screen w-screen bg-black text-white selection:bg-white selection:text-black overflow-hidden font-sans">
      {/* LEFT WINDOW: Full Application with independent scrolling */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden relative min-w-0 transition-all duration-300 ease-out scrollbar-thin">
        <Navbar asOf="M0 Justice Intelligence Baseline" />

        {/* Main Dashboard Container */}
        <main className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full gap-6">
          {/* Apple / Linear Style Hero & Stat Ribbon */}
          <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-white/[0.08]">
            {/* Top Row: Hero Title & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    {stateMeta ? `${stateMeta.name} Judicial Intelligence` : "National Judicial Intelligence Platform"}
                  </h1>
                  {selectedState !== "ALL" && (
                    <button
                      onClick={() => setSelectedState("ALL")}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/10 active:scale-95 shadow-sm"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to All India</span>
                    </button>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {stateMeta
                    ? `Operational intelligence for ${stateMeta.highCourtName} and ${visibleCourts.length} subordinate district complexes in ${stateMeta.name}.`
                    : "Comprehensive public intelligence spanning the Supreme Court of India, 25 High Courts, and 755 subordinate district courts across all 36 States & UTs."}
                </p>
              </div>
            </div>

            {/* Metric Ribbon: 4-Card Responsive Grid with Zero Collision */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-5 border-t border-white/[0.08]">
              <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 transition-all rounded-2xl p-4 flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-white" />
                    <span>Active Caseload</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-white/40 group-hover:bg-white transition-colors" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight tabular-nums mt-2">
                  {loading ? "..." : formatIndianNumber(stats.totalAll)}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Active Pending Matters</div>
              </div>

              <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 transition-all rounded-2xl p-4 flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-white" />
                    <span>Judicial Strength</span>
                  </span>
                  <span className={`w-2 h-2 rounded-full ${stats.avgVacancyRate > 30 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight tabular-nums mt-2">
                  {loading ? "..." : `${stats.totalWorkingJudges} / ${stats.totalSanctionedJudges}`}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{stats.avgVacancyRate}% Vacancy Deficit</div>
              </div>

              <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 transition-all rounded-2xl p-4 flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-white" />
                    <span>Clearance (CCR)</span>
                  </span>
                  <span className={`w-2 h-2 rounded-full ${Number(stats.avgCcr) >= 100 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight tabular-nums mt-2 flex items-center gap-2">
                  <span>{loading ? "..." : `${stats.avgCcr}%`}</span>
                  {!loading && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${Number(stats.avgCcr) >= 100 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      {Number(stats.avgCcr) >= 100 ? 'Clearing' : 'Accumulating'}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">Disposal Velocity Ratio</div>
              </div>

              <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 transition-all rounded-2xl p-4 flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                    <span>Mapped Complexes</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight tabular-nums mt-2">
                  {loading ? "..." : stats.count}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">100% Geocoded Pins</div>
              </div>
            </div>
          </section>

          {/* Map Canvas Container */}
          <div className="relative w-full min-h-[620px] rounded-3xl overflow-hidden shadow-2xl border border-white/[0.08] bg-zinc-950">
            <MapView
              courts={courtsData}
              selectedTier={selectedTier}
              selectedState={selectedState}
              selectedCourtId={selectedCourt?.court_id}
              isAiOpen={isAiOpen}
              targetFlight={targetFlight}
              onSelectCourt={(c) => setSelectedCourt(c)}
              onSelectState={(s) => setSelectedState(s)}
            />

            {/* Floating Controls Overlay */}
            <div className="absolute top-5 left-5 z-20 max-w-[calc(100%-40px)]">
              <LayerToggles
                selectedTier={selectedTier}
                onTierChange={setSelectedTier}
                selectedState={selectedState}
                onStateChange={setSelectedState}
              />
            </div>

            {/* Floating Legend Overlay */}
            <div className="absolute bottom-5 left-5 z-20 hidden sm:block">
              <Legend />
            </div>

            {/* Single Unified Court Detail Drawer (No Duplicate Popups) */}
            <CourtDrawer court={selectedCourt} isAiOpen={isAiOpen} onClose={() => setSelectedCourt(null)} />
          </div>

          {/* Apple Style Fast Registry Table with Instant Search */}
          <section className="glass-panel rounded-3xl p-6 md:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-white" />
                  <span>
                    {stateMeta ? `${stateMeta.name} Court Complexes` : "National Courts Directory"} ({visibleCourts.length} Tracked)
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {stateMeta
                    ? `Subordinate courts and benches in ${stateMeta.name}`
                    : "All Supreme Court, High Courts, and Subordinate District complexes mapped with verified geocoordinates"}
                </p>
              </div>

              {/* Instant Search Bar */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by court, district, city..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-full pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-1 text-zinc-400 hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {stateMeta && (
                  <Link
                    href={`/states/${stateMeta.slug}`}
                    className="text-xs font-semibold text-white hover:text-zinc-300 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 border border-white/15 transition-colors shrink-0"
                  >
                    <span>Full State Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>

            <div className="overflow-x-auto max-h-96 scrollbar-thin rounded-2xl border border-white/[0.06]">
              <table className="w-full text-left text-xs">
                <thead className="text-zinc-400 bg-black/80 sticky top-0 border-b border-white/10 backdrop-blur-md">
                  <tr>
                    <th className="py-3 px-4 font-medium">Court Complex</th>
                    <th className="py-3 px-4 font-medium">Tier</th>
                    <th className="py-3 px-4 font-medium">City / District</th>
                    <th className="py-3 px-4 font-medium text-right">Total Pending</th>
                    <th className="py-3 px-4 font-medium text-right">Judges (Work/Sanc)</th>
                    <th className="py-3 px-4 font-medium text-right">Clearance (CCR)</th>
                    <th className="py-3 px-4 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300 bg-black/30">
                  {visibleCourts.map((c) => (
                    <tr
                      key={c.court_id}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                      onClick={() => {
                        setSelectedCourt(c);
                        setTargetFlight({ lat: c.court.lat, lon: c.court.lon, zoom: 11, pitch: 36 });
                      }}
                    >
                      <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            c.court.tier === "SC"
                              ? "bg-white ring-2 ring-white/40"
                              : c.court.tier === "HC"
                              ? "bg-zinc-200"
                              : "bg-zinc-500"
                          }`}
                        />
                        <span className="group-hover:text-white transition-colors">{c.court.name}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white border border-white/10">
                          {c.court.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400">{c.court.district || c.court.state || "National"}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-white tabular-nums">
                        {formatIndianNumber(c.total)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-zinc-300 tabular-nums font-mono text-[11px]">
                        {c.judge_strength ? `${c.judge_strength.working}/${c.judge_strength.sanctioned}` : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right text-zinc-300 tabular-nums">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${(c.case_clearance_rate || 0) >= 100 ? 'bg-white/15 text-white' : 'bg-white/5 text-zinc-400'}`}>
                          {c.case_clearance_rate || 98.5}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/court/${c.court_id}`}
                          className="inline-flex items-center gap-1 text-white hover:underline underline-offset-4 font-semibold text-[11px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>Dossier</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        {/* Apple Minimal Footer */}
        <footer className="mt-auto border-t border-white/10 bg-black py-8 px-4 md:px-8 text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <p className="font-medium text-zinc-300">
                NyayaRadar — Free & Public India Judicial Pendency Intelligence
              </p>
              <p className="text-[11px] text-zinc-600">
                Data sourced from Supreme Court Data Grid, NJDG, NALSA & eCourts. Unofficial public visualization.
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs font-medium text-zinc-400">
              <Link href="/methodology" className="hover:text-white transition-colors">
                Methodology
              </Link>
              <Link href="/about" className="hover:text-white transition-colors">
                About
              </Link>
              <Link href="/trends" className="hover:text-white transition-colors">
                Trends
              </Link>
            </div>
          </div>
        </footer>

        {/* Floating trigger button inside left window when closed */}
        {!isAiOpen && (
          <NyayaCopilot
            activeCourt={selectedCourt}
            activeState={selectedState}
            isOpen={isAiOpen}
            onToggle={setIsAiOpen}
            onMapAction={handleMapAction}
          />
        )}
      </div>

      {/* RIGHT WINDOW: Dedicated Side-by-Side AI Copilot Sidebar (No Overlap) */}
      {isAiOpen && (
        <aside className="w-full sm:w-[480px] lg:w-[500px] h-full shrink-0 border-l border-white/[0.12] bg-[#09090b] z-40 animate-in slide-in-from-right duration-300 flex flex-col shadow-2xl">
          <NyayaCopilot
            activeCourt={selectedCourt}
            activeState={selectedState}
            isOpen={isAiOpen}
            onToggle={setIsAiOpen}
            onMapAction={handleMapAction}
          />
        </aside>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-black text-white flex items-center justify-center font-mono text-xs">Loading NyayaRadar...</div>}>
      <HomeContent />
    </Suspense>
  );
}
