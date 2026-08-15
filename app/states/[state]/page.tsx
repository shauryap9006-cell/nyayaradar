import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { formatIndianNumber } from "@/lib/utils";
import { STATES_REGISTRY, getStateMeta } from "@/lib/states";
import { getCourts } from "@/lib/db";
import { Building2, MapPin, ArrowLeft, Users, TrendingUp, ShieldAlert, ArrowRight, Scale } from "lucide-react";
import Link from "next/link";

export async function generateStaticParams() {
  return Object.keys(STATES_REGISTRY).map((slug) => ({
    state: slug,
  }));
}

export default async function StateDetailPage({ params }: { params: { state: string } }) {
  const meta = getStateMeta(params.state);
  if (!meta) {
    notFound();
  }

  // Fetch state courts (High Court + District Courts)
  const allCourts = await getCourts({ state: meta.name });
  const hcCourt: any = allCourts.find((c) => c.tier === "HC");
  const districtCourts: any[] = allCourts.filter((c) => c.tier === "DISTRICT");

  const totalStatePendency = allCourts.reduce((sum, c: any) => sum + (c.total || 0), 0);
  const totalSubordinate = districtCourts.reduce((sum, c) => sum + (c.total || 0), 0);

  let totalWorkingJudges = 0;
  let totalSanctionedJudges = 0;
  let totalCcrSum = 0;
  let totalUndertrials = 0;
  let totalWarrants = 0;

  allCourts.forEach((c: any) => {
    if (c.judge_strength) {
      totalWorkingJudges += c.judge_strength.working;
      totalSanctionedJudges += c.judge_strength.sanctioned;
    }
    if (c.case_clearance_rate) {
      totalCcrSum += c.case_clearance_rate;
    }
    if (c.police_intelligence) {
      totalUndertrials += c.police_intelligence.undertrial_prisoners;
      totalWarrants += c.police_intelligence.pending_warrants;
    }
  });

  const avgVacancyRate =
    totalSanctionedJudges > 0
      ? Math.round(((totalSanctionedJudges - totalWorkingJudges) / totalSanctionedJudges) * 100)
      : 0;

  const avgStateCcr = allCourts.length > 0 ? (totalCcrSum / allCourts.length).toFixed(1) : "98.5";

  // Calculate per lakh metric
  const popInLakhs = meta.population2011 / 100000;
  const casesPerLakh = popInLakhs > 0 ? Math.round(totalStatePendency / popInLakhs) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      <Navbar asOf="M0 Justice Intelligence Baseline" />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 space-y-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to National Map</span>
        </Link>

        {/* State Header Card */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white/15 text-white border border-white/10">
                State Judicial Intelligence Dossier
              </span>
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {meta.name}, India
              </span>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              Census 2011 Population: {meta.population2011.toLocaleString("en-IN")}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">{meta.name}</h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">
            Judicial overview covering <strong>{meta.highCourtName}</strong> and all {districtCourts.length} subordinate district & sessions court complexes across {meta.name}.
          </p>
        </div>

        {/* Apple Stat Pills (Caseload, Judges, CCR, Police) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-3xl p-5 space-y-1">
            <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-white" />
              <span>Total State Caseload</span>
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">
              {formatIndianNumber(totalStatePendency)}
            </div>
            <p className="text-[11px] text-zinc-500">{casesPerLakh.toLocaleString("en-IN")} per lakh citizens</p>
          </div>

          <div className="glass-panel rounded-3xl p-5 space-y-1">
            <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-white" />
              <span>Judicial Strength</span>
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">
              {totalWorkingJudges} <span className="text-sm text-zinc-400 font-normal">/ {totalSanctionedJudges}</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">{avgVacancyRate}% State Vacancy Deficit</p>
          </div>

          <div className="glass-panel rounded-3xl p-5 space-y-1">
            <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
              <span>State Clearance (CCR)</span>
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">
              {avgStateCcr}%
            </div>
            <p className="text-[11px] text-zinc-500">Average case clearance rate</p>
          </div>

          <div className="glass-panel rounded-3xl p-5 space-y-1">
            <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
              <span>State Undertrial Load</span>
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">
              {formatIndianNumber(totalUndertrials)}
            </div>
            <p className="text-[11px] text-zinc-500">Inmates awaiting trial in state jails</p>
          </div>
        </div>

        {/* District Courts Table */}
        <section className="glass-panel rounded-3xl p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-white" />
                <span>District & Sessions Courts in {meta.name}</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Subordinate court breakdown across all {districtCourts.length} judicial districts
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 scrollbar-thin rounded-2xl border border-white/[0.06]">
            <table className="w-full text-left text-xs">
              <thead className="text-zinc-400 bg-black/80 sticky top-0 border-b border-white/10 backdrop-blur-md">
                <tr>
                  <th className="py-3 px-4 font-medium">Court Complex</th>
                  <th className="py-3 px-4 font-medium">District / City</th>
                  <th className="py-3 px-4 font-medium text-right">Total Pending</th>
                  <th className="py-3 px-4 font-medium text-right">Judges</th>
                  <th className="py-3 px-4 font-medium text-right">Clearance (CCR)</th>
                  <th className="py-3 px-4 font-medium text-right">Warrants</th>
                  <th className="py-3 px-4 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300 bg-black/30">
                {districtCourts.map((c: any) => (
                  <tr key={c.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      {c.name}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">{c.district}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-white tabular-nums">
                      {formatIndianNumber(c.total)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-zinc-300 tabular-nums font-mono">
                      {c.judge_strength ? `${c.judge_strength.working}/${c.judge_strength.sanctioned}` : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right text-zinc-300 tabular-nums">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${(c.case_clearance_rate || 0) >= 100 ? 'bg-white/15 text-white' : 'bg-white/5 text-zinc-400'}`}>
                        {c.case_clearance_rate || 98.5}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-zinc-300 tabular-nums font-mono">
                      {c.police_intelligence ? formatIndianNumber(c.police_intelligence.pending_warrants) : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/court/${c.id}`}
                        className="inline-flex items-center gap-1 text-white hover:underline underline-offset-4 font-semibold text-[11px]"
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
    </div>
  );
}
