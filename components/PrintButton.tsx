"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <button
      onClick={handlePrint}
      title="Print or export official judicial dossier as PDF"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] px-3.5 py-1.5 rounded-full transition-all border border-white/10 active:scale-95 no-print"
    >
      <Printer className="w-3.5 h-3.5 text-zinc-400" />
      <span>Print / PDF</span>
    </button>
  );
}
