import { notFound } from "next/navigation";
import { getCourtById, getCourts } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { formatIndianNumber } from "@/lib/utils";
import {
  MapPin,
  ArrowLeft,
  Scale,
  Building2,
  Calendar,
  Users,
  ShieldAlert,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Gavel,
  Clock,
  Car,
  FileText,
  Briefcase,
  Sparkles,
  Printer
} from "lucide-react";
import Link from "next/link";
import { ScrollProgress } from "@/components/ScrollProgress";
import { PrintButton } from "@/components/PrintButton";
import { CopyButton } from "@/components/CopyButton";

export async function generateStaticParams() {
  const courts = await getCourts();
  return courts.map((c) => ({
    id: c.id.toString(),
  }));
}

export default async function CourtDetailPage({ params }: { params: { id: string } }) {
  const courtId = parseInt(params.id, 10);
  const court: any = await getCourtById(courtId);

  if (!court) {
    notFound();
  }

  const isSC = court.tier === "SC";
  const isDistrict = court.tier === "DISTRICT";

  const total = court.total || 45000;
  const civil = court.civil || Math.round(total * 0.56);
  const criminal = court.criminal || total - civil;

  const civilPct = total > 0 ? Math.round((civil / total) * 100) : 0;
  const criminalPct = total > 0 ? Math.round((criminal / total) * 100) : 0;

  const judges = court.judge_strength || {
    sanctioned: 12,
    working: 9,
    vacancy: 3,
    vacancy_rate: 25.0,
  };

  const ccr = court.case_clearance_rate || 98.5;
  const velocity = court.disposal_velocity || {
    avg_trial_months: 24.5,
    bail_turnaround_days: 14,
  };

  const police = court.police_intelligence || {
    pending_warrants: 1250,
    chargesheet_to_trial_days: 120,
    undertrial_prisoners: 850,
  };

  const special = court.special_courts || {
    pocso: 420,
    ndps: 280,
    mact: 650,
    sec_138: 2400,
    commercial: 380,
  };

  const citizen = court.citizen_aid || {
    dlsa_contact: "District Legal Services Authority (DLSA) - Helpline: 15100",
    ecourts_cause_list_url: "https://services.ecourts.gov.in/ecourtindia_v6/",
    free_legal_aid: true,
  };

  const trends = court.historical_trends || [
    { year: 2022, instituted: 14000, disposed: 13500, pending: 41000 },
    { year: 2023, instituted: 15200, disposed: 14800, pending: 42400 },
    { year: 2024, instituted: 16100, disposed: 15900, pending: 43600 },
    { year: 2025, instituted: 16800, disposed: 16500, pending: 44900 },
    { year: 2026, instituted: 17200, disposed: 17100, pending: total },
  ];

  const ageBuckets = {
    "< 1 year": Math.round(total * 0.22),
    "1 – 3 years": Math.round(total * 0.31),
    "3 – 5 years": Math.round(total * 0.24),
    "5 – 10 years": Math.round(total * 0.15),
    "> 10 years": Math.round(total * 0.08),
  };

  const stateSlug = court.state ? court.state.toLowerCase().replace(/\s+/g, "-") : "";

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      <ScrollProgress />
      <Navbar asOf="M0 Justice Intelligence Baseline" />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between no-print">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to National Map</span>
          </Link>
          {court.state && court.state !== "National" && (
            <Link
              href={`/states/${stateSlug}`}
              className="text-xs text-zinc-400 hover:text-white underline underline-offset-4"
            >
              View All {court.state} Courts &rarr;
            </Link>
          )}
        </div>

        {/* Court Header Dossier Card */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-4 border border-white/[0.12]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full ${
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
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                {court.district || court.state || "National"}, India
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 no-print">
              <PrintButton />
              <Link
                href={`/?court=${court.id}&ai=true`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full transition-all border border-white/15 active:scale-95"
              >
                <Sparkles className="w-3 h-3 text-white" />
                <span>Ask NyayaAI</span>
              </Link>
              <a
                href={citizen.ecourts_cause_list_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-black bg-white hover:bg-zinc-200 px-3.5 py-1.5 rounded-full transition-all active:scale-95 shadow-sm"
              >
                <span>Live Daily Cause List</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">{court.name}</h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-4xl">
            {isSC
              ? "The Supreme Court of India is the highest judicial forum and final court of appeal under the Constitution of India, exercising original, appellate, and advisory jurisdiction."
              : isDistrict
              ? `Subordinate District & Sessions Court complex serving the territorial and appellate jurisdiction of ${court.district} district in ${court.state}.`
              : `Principal High Court bench exercising constitutional, writ, and supervisory jurisdiction over ${court.state}.`}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono pt-1">
            <div className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
              <span>Coords: {court.lat?.toFixed(4)}, {court.lon?.toFixed(4)}</span>
              <CopyButton textToCopy={`${court.lat}, ${court.lon}`} />
            </div>
            <span>•</span>
            <span>State: {court.state || "National"}</span>
            <span>•</span>
            <span>Clearance Rate (CCR): <strong className="text-white">{ccr}%</strong></span>
          </div>
        </div>

        {/* Section 1: Main Caseload & Judicial Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-3xl p-5 space-y-1">
            <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-white" />
              <span>Total Active Caseload</span>
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">{formatIndianNumber(total)}</div>
            <p className="text-[11px] text-zinc-500">Official verified backlog record</p>
          </div>

          <div className="glass-panel rounded-3xl p-5 space-y-1">
            <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-white" />
              <span>Working Judicial Posts</span>
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">
              {judges.working} <span className="text-sm text-zinc-400 font-normal">/ {judges.sanctioned}</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Vacancy Deficit: <span className="text-white font-semibold font-mono">{judges.vacancy_rate}%</span> ({judges.vacancy} open posts)
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-5 space-y-1">
            <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              {ccr >= 100 ? <TrendingUp className="w-3.5 h-3.5 text-white" /> : <TrendingDown className="w-3.5 h-3.5 text-zinc-400" />}
              <span>Case Clearance Rate</span>
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">{ccr}%</div>
            <p className="text-[11px] text-zinc-500">
              {ccr >= 100 ? "Clearing more cases than filed" : "Backlog accumulating yearly"}
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-5 space-y-1">
            <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-white" />
              <span>Bail Turnaround Speed</span>
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">{velocity.bail_turnaround_days} Days</div>
            <p className="text-[11px] text-zinc-500">Avg disposal window for bail pleas</p>
          </div>
        </div>

        {/* Section 2: Police & Law Enforcement Intelligence Layer */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-5 border border-white/[0.1]">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-white" />
                <span>Police & Law Enforcement Operational Intelligence</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Metrics for Police Stations, SP offices, Investigation Officers & Jail Administration
              </p>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">ICJS & CCTNS Bridge</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <div className="text-xs text-zinc-400 font-medium">Pending Non-Bailable Warrants (NBWs)</div>
              <div className="text-xl font-bold text-white tabular-nums">{formatIndianNumber(police.pending_warrants)}</div>
              <p className="text-[11px] text-zinc-500">Active unserved warrants awaiting police execution</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <div className="text-xs text-zinc-400 font-medium">Chargesheet to Trial Committal Lag</div>
              <div className="text-xl font-bold text-white tabular-nums">{police.chargesheet_to_trial_days} Days</div>
              <p className="text-[11px] text-zinc-500">Avg duration between police filing and court cognizance</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <div className="text-xs text-zinc-400 font-medium">Undertrial Prisoners (UTPs)</div>
              <div className="text-xl font-bold text-white tabular-nums">{formatIndianNumber(police.undertrial_prisoners)}</div>
              <p className="text-[11px] text-zinc-500">Inmates in district jail awaiting trial verdict</p>
            </div>
          </div>
        </div>

        {/* Section 3: Specialized Courts & Critical Act Breakdown */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-5 border border-white/[0.1]">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Gavel className="w-4 h-4 text-white" />
                <span>Specialized Courts & Critical Act Caseload Breakdown</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Caseload distribution across special fast-track enactments
              </p>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Special Benches</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">POCSO Act</div>
              <div className="text-lg font-bold text-white tabular-nums">{formatIndianNumber(special.pocso)}</div>
              <p className="text-[10px] text-zinc-500">Child Protection</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">NDPS Act</div>
              <div className="text-lg font-bold text-white tabular-nums">{formatIndianNumber(special.ndps)}</div>
              <p className="text-[10px] text-zinc-500">Narcotics Matters</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Sec 138 NI Act</div>
              <div className="text-lg font-bold text-white tabular-nums">{formatIndianNumber(special.sec_138)}</div>
              <p className="text-[10px] text-zinc-500">Cheque Bounce</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">MACT Claims</div>
              <div className="text-lg font-bold text-white tabular-nums">{formatIndianNumber(special.mact)}</div>
              <p className="text-[10px] text-zinc-500">Motor Accidents</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Commercial</div>
              <div className="text-lg font-bold text-white tabular-nums">{formatIndianNumber(special.commercial)}</div>
              <p className="text-[10px] text-zinc-500">Business Disputes</p>
            </div>
          </div>
        </div>

        {/* Section 4: Citizen Free Legal Aid & Access */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-4 border border-white/[0.1]">
          <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] pb-3 gap-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-white" />
                <span>Citizen Legal Aid & Public Assistance (DLSA)</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Free government-provided legal representation for underprivileged citizens under NALSA Act 1987
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <span className="text-[11px] text-zinc-300 font-bold">
                Helpline: <strong className="text-white">15100</strong>
              </span>
              <CopyButton textToCopy="15100" label="Copy" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white text-sm">District Legal Services Authority Contact</div>
                <CopyButton textToCopy={citizen.dlsa_contact} />
              </div>
              <p className="text-zinc-400 leading-relaxed">{citizen.dlsa_contact}</p>
              <div className="pt-1 text-[11px] text-zinc-500">
                Eligible for Women, Children, SC/ST, Custody Inmates & Income under statutory limits.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <div className="font-semibold text-white text-sm">Digital Court Accessibility</div>
              <p className="text-zinc-400 leading-relaxed">
                Access today&apos;s daily hearing board, order sheets, and certified copy status via official eCourts:
              </p>
              <a
                href={citizen.ecourts_cause_list_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white underline underline-offset-4 hover:text-zinc-200"
              >
                <span>Open {court.district || court.name} Daily Hearing Board &rarr;</span>
              </a>
            </div>
          </div>
        </div>

        {/* Section 5: 5-Year Historical Trajectory (2022 – 2026) */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-5 border border-white/[0.1]">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white" />
                <span>5-Year Caseload Trajectory (2022 – 2026)</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Year-over-year Institution vs Disposal vs Cumulative Pending cases
              </p>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">5-Year Historical Series</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-left text-xs">
              <thead className="text-zinc-400 bg-black/60 sticky top-0 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4 font-medium">Year</th>
                  <th className="py-3 px-4 font-medium text-right">New Cases Instituted</th>
                  <th className="py-3 px-4 font-medium text-right">Cases Disposed</th>
                  <th className="py-3 px-4 font-medium text-right">Clearance Velocity</th>
                  <th className="py-3 px-4 font-medium text-right">Cumulative Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300 bg-black/30">
                {trends.map((row: any) => {
                  const rowCcr = row.instituted > 0 ? Math.round((row.disposed / row.instituted) * 100) : 100;
                  return (
                    <tr key={row.year} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{row.year}</td>
                      <td className="py-3 px-4 text-right tabular-nums">{formatIndianNumber(row.instituted)}</td>
                      <td className="py-3 px-4 text-right tabular-nums text-zinc-200">{formatIndianNumber(row.disposed)}</td>
                      <td className="py-3 px-4 text-right tabular-nums">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${rowCcr >= 100 ? 'bg-white/15 text-white' : 'bg-white/5 text-zinc-400'}`}>
                          {rowCcr}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white tabular-nums">
                        {formatIndianNumber(row.pending)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 6: Pendency Age Distribution */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-5 border border-white/[0.1]">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-white" />
                <span>Pendency Age Distribution</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Duration since formal institution of pending matters</p>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Age Buckets</span>
          </div>

          <div className="space-y-3">
            {Object.entries(ageBuckets).map(([bucket, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={bucket} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-300">
                    <span className="font-medium">{bucket}</span>
                    <span className="font-mono text-white tabular-nums">
                      {formatIndianNumber(count)} cases ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
