"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Scale, Info, TrendingUp, ShieldCheck, Search, Menu, X, Sparkles } from "lucide-react";
import { CommandPalette } from "./CommandPalette";

interface NavbarProps {
  asOf?: string;
  onOpenAi?: () => void;
  onSelectCourt?: (courtId: number) => void;
}

export function Navbar({ asOf = "M0 Justice Intelligence Baseline", onOpenAi, onSelectCourt }: NavbarProps) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger Command Palette with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      // Slash shortcut when not focused on an input
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-2xl sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shrink-0 font-sans">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3 sm:gap-6">
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

          {/* Global Command Palette Trigger Button */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-zinc-300 hover:text-white text-xs transition-all active:scale-95 group"
            title="Press Ctrl+K or ⌘K to search all courts"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
            <span className="hidden sm:inline font-medium">Search 781 courts...</span>
            <span className="inline sm:hidden font-medium">Search</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-400 group-hover:text-white border border-white/10">
              <span>{isMac ? "⌘" : "Ctrl+"}</span>
              <span>K</span>
            </kbd>
          </button>
        </div>

        {/* Right Navigation & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* As-Of Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium backdrop-blur-md shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Data as of: <strong className="font-semibold text-white">{asOf}</strong></span>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-zinc-400">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-full text-white hover:bg-white/10 transition-colors"
            >
              Map
            </Link>
            <Link
              href="/trends"
              className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trends</span>
            </Link>
            <Link
              href="/methodology"
              className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Methodology</span>
            </Link>
            <Link
              href="/about"
              className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </Link>
          </nav>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-in fade-in duration-200">
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <div className="fixed top-16 left-0 right-0 bg-[#09090b] border-b border-white/10 p-6 space-y-4 shadow-2xl animate-in slide-in-from-top-5 duration-200 text-sm">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 text-white font-medium hover:bg-white/10"
            >
              <Scale className="w-4 h-4 text-white" />
              <span>National Map Dashboard</span>
            </Link>

            <Link
              href="/trends"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 text-white font-medium hover:bg-white/10"
            >
              <TrendingUp className="w-4 h-4 text-white" />
              <span>5-Year Judicial Trends</span>
            </Link>

            <Link
              href="/methodology"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 text-white font-medium hover:bg-white/10"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Data Methodology & FAQ</span>
            </Link>

            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 text-white font-medium hover:bg-white/10"
            >
              <Info className="w-4 h-4 text-white" />
              <span>About NyayaRadar</span>
            </Link>
          </div>
        </div>
      )}

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectCourt={onSelectCourt}
        onOpenAi={onOpenAi}
      />
    </>
  );
}
