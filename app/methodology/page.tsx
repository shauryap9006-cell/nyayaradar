import { Navbar } from "@/components/Navbar";
import { FAQSection } from "@/components/FAQSection";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ShieldCheck, Database, Lock, HelpCircle, CheckCircle2 } from "lucide-react";

export default function MethodologyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      <ScrollProgress />
      <Navbar asOf="M0 Justice Intelligence Baseline" />

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-10">
        {/* Header */}
        <div className="space-y-2 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Transparency & Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Data Methodology & Trust Architecture
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            How NyayaRadar collects, validates, and publishes official Indian judicial pendency figures across all 781 courts.
          </p>
        </div>

        {/* Section 1: Official Sources */}
        <section className="glass-panel rounded-3xl p-6 md:p-8 space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-white" />
            <span>1. Official Government Data Sources</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            NyayaRadar collects data exclusively from verified public government portals:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
            <li className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Supreme Court Data Grid:</strong>
                <p className="text-zinc-400 text-[11px] mt-0.5">Apex institution, disposal, and backlog records.</p>
              </div>
            </li>
            <li className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">National Judicial Data Grid (NJDG):</strong>
                <p className="text-zinc-400 text-[11px] mt-0.5">25 High Courts & 755 Subordinate District Complexes.</p>
              </div>
            </li>
            <li className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">NALSA & State SLSA Portals:</strong>
                <p className="text-zinc-400 text-[11px] mt-0.5">Free citizen legal aid helplines and DLSA contacts.</p>
              </div>
            </li>
            <li className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Census of India (2011 Baseline):</strong>
                <p className="text-zinc-400 text-[11px] mt-0.5">Demographic foundation for per-lakh comparative metrics.</p>
              </div>
            </li>
          </ul>
        </section>

        {/* Section 2: Sanity Gates */}
        <section className="glass-panel rounded-3xl p-6 md:p-8 space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>2. The 5 Non-Negotiable Automated Sanity Gates</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Every daily crawl must pass 5 automated mathematical validation gates before publication:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-1">
              <div className="font-semibold text-white">Rule 1: Delta Deviation Cap</div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">If any court&apos;s total shifts by &gt; 25% compared to the baseline, the run is quarantined for review.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-1">
              <div className="font-semibold text-white">Rule 2: Mathematical Parity</div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">Civil + Criminal counts must match reported Total within a strict 2% margin.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-1">
              <div className="font-semibold text-white">Rule 3: 781 Courts Completeness</div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">All 781 courts across all 36 States & UTs must be present in every crawl payload.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-1">
              <div className="font-semibold text-white">Rule 4: Zero/Null Ban</div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">No court may have a null or zero total active caseload.</p>
            </div>
          </div>
        </section>

        {/* Section 3: Interactive FAQ */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <HelpCircle className="w-4 h-4 text-white" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Legal Rights & Metric Definitions
          </h2>
          <FAQSection />
        </section>
      </main>
    </div>
  );
}
