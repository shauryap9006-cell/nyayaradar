"use client";

import Link from "next/link";
import { Scale, Info, TrendingUp, ShieldCheck } from "lucide-react";

export function Navbar({ asOf = "Sample / Seed Baseline" }: { asOf?: string }) {
  return (
    <header className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-2xl sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
            <Scale className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-white">
                NyayaRadar
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                M0
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">India Judicial Pendency Map</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* As-Of Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium backdrop-blur-md shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>Data as of: <strong className="font-semibold text-white">{asOf}</strong></span>
        </div>

        <nav className="flex items-center gap-1 text-xs font-medium text-zinc-400">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-full text-white hover:bg-white/10 transition-colors"
          >
            Map
          </Link>
          <Link
            href="/trends"
            className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-colors hidden sm:flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Trends
          </Link>
          <Link
            href="/methodology"
            className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-colors hidden md:flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Methodology
          </Link>
          <Link
            href="/about"
            className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5" />
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
