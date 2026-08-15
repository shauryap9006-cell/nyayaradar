import { Navbar } from "@/components/Navbar";
import { ShieldCheck, Database, Lock } from "lucide-react";

export default function MethodologyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      <Navbar asOf="Sample / Seed Baseline" />

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8">
        <div className="space-y-2 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Transparency & Verification</span>
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Data Methodology & Trust Architecture</h1>
          <p className="text-sm text-zinc-400">
            How NyayaRadar collects, validates, and publishes official Indian judicial pendency figures.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-white" />
            <span>1. Official Data Sources</span>
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            NyayaRadar collects data exclusively from public government dashboards:
          </p>
          <ul className="list-disc list-inside text-xs text-zinc-400 space-y-2 pl-2">
            <li><strong>Supreme Court Data Grid (SCDG):</strong> Official institution, pendency, and disposal statistics for the Supreme Court of India.</li>
            <li><strong>National Judicial Data Grid (NJDG HC):</strong> Portal tracking pendency across all 25 High Courts.</li>
            <li><strong>Census of India (2011):</strong> Population baseline used for per-lakh comparative metrics.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>2. The Non-Negotiable Sanity Gate</span>
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            To prevent corrupted or incomplete figures from reaching the public map, every snapshot must pass 5 automated validation rules before being marked as <code>approved</code>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-4 space-y-1.5">
              <div className="font-semibold text-white">Rule 1: Delta Deviation Cap</div>
              <p className="text-zinc-400 leading-relaxed">If any court&apos;s total pendency shifts by &gt; 25% compared to the previous snapshot, the run is quarantined for review.</p>
            </div>
            <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-4 space-y-1.5">
              <div className="font-semibold text-white">Rule 2: Breakdown Sum Consistency</div>
              <p className="text-zinc-400 leading-relaxed">The sum of Civil + Criminal cases must match the reported Total within a 2% margin.</p>
            </div>
            <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-4 space-y-1.5">
              <div className="font-semibold text-white">Rule 3: Court Registry Completeness</div>
              <p className="text-zinc-400 leading-relaxed">All 26 courts (SC + 25 High Courts) must be present in the payload.</p>
            </div>
            <div className="bg-zinc-950/60 border border-white/10 rounded-2xl p-4 space-y-1.5">
              <div className="font-semibold text-white">Rule 4: Zero/Null Total Ban</div>
              <p className="text-zinc-400 leading-relaxed">No court may have a null or zero total pendency value.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-white" />
            <span>3. Polite Scraping & Zero-Cost Architecture</span>
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Crawlers run on GitHub Actions cron with strict polite limits (maximum 1 request/second, exponential backoff, off-peak IST hours). The platform is hosted on free-tier infrastructure (Vercel, Supabase, CARTO Dark Matter basemap) to ensure 100% zero-cost sustainability without advertisements.
          </p>
        </section>
      </main>
    </div>
  );
}
