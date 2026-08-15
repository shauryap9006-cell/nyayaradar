import { Navbar } from "@/components/Navbar";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      <Navbar asOf="Sample / Seed Baseline" />

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8">
        <div className="space-y-2 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-semibold text-white tracking-tight">About NyayaRadar</h1>
          <p className="text-sm text-zinc-400">
            A public-interest civic tech initiative bringing geographic clarity to judicial pendency in India.
          </p>
        </div>

        <section className="space-y-3 text-sm text-zinc-300 leading-relaxed">
          <h2 className="text-lg font-semibold text-white">Our Mission</h2>
          <p>
            With over 56 million cases pending across the Indian judiciary, timely access to justice remains one of the largest systemic challenges of our time. While government portals like NJDG publish tabular figures, understanding where justice is delayed requires spatial, comparative, and longitudinal analysis.
          </p>
          <p>
            <strong>NyayaRadar</strong> transforms public judicial records into intuitive, interactive maps and trend charts accessible to every citizen, journalist, researcher, and lawyer.
          </p>
        </section>

        <section className="bg-zinc-950/60 border border-white/10 rounded-3xl p-6 space-y-3">
          <h2 className="text-base font-semibold text-white">Legal & Ethical Commitment</h2>
          <ul className="text-xs text-zinc-400 space-y-2 leading-relaxed">
            <li><strong>Official Portals:</strong> We visualize government records without tampering or alteration.</li>
            <li><strong>Privacy First:</strong> No personal litigant addresses or confidential identities are published.</li>
            <li><strong>Attribution:</strong> All underlying judicial statistics are copyrighted by the respective High Courts and the Supreme Court of India.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
