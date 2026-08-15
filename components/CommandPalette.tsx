"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, MapPin, Sparkles, TrendingUp, ShieldCheck, ArrowRight, CornerDownLeft, X, Scale } from "lucide-react";
import courtsSeed from "@/data/seeds/courts.json";
import districtCourtsSeed from "@/data/seeds/district_courts.json";
import { STATES_REGISTRY } from "@/lib/states";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCourt?: (courtId: number) => void;
  onOpenAi?: () => void;
}

export function CommandPalette({ isOpen, onClose, onSelectCourt, onOpenAi }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-load searchable records
  const allCourts = useMemo(() => {
    return [...(courtsSeed as any[]), ...(districtCourtsSeed as any[])];
  }, []);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    // Default suggestions if query is empty
    if (!q) {
      return [
        {
          id: "action-ai",
          type: "action",
          title: "Ask NyayaAI Judicial Copilot",
          subtitle: "Natural language court timelines, bail velocity & judge vacancies",
          icon: Sparkles,
          action: () => {
            onClose();
            if (onOpenAi) onOpenAi();
            else router.push("/?ai=true");
          },
        },
        {
          id: "action-trends",
          type: "action",
          title: "5-Year Judicial Pendency Trends",
          subtitle: "National backlog trajectory & state CCR leaderboards",
          icon: TrendingUp,
          action: () => {
            onClose();
            router.push("/trends");
          },
        },
        {
          id: "action-sc",
          type: "court",
          courtId: 1,
          title: "Supreme Court of India",
          subtitle: "National Apex Judicial Forum • New Delhi",
          icon: Scale,
          action: () => {
            onClose();
            if (onSelectCourt) onSelectCourt(1);
            else router.push("/court/1");
          },
        },
        {
          id: "action-methodology",
          type: "action",
          title: "Data Methodology & Sanity Gates",
          subtitle: "Official NJDG source verification & 5-rule automated gate",
          icon: ShieldCheck,
          action: () => {
            onClose();
            router.push("/methodology");
          },
        },
      ];
    }

    // Filter courts & states by query
    const matchedCourts = allCourts
      .filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.district?.toLowerCase().includes(q) ||
          c.state?.toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map((c) => ({
        id: `court-${c.id}`,
        type: "court",
        courtId: c.id,
        title: c.name,
        subtitle: `${c.tier} Tier • ${c.district || c.state || "National"} • ${(c.total || 0).toLocaleString("en-IN")} pending matters`,
        icon: Building2,
        action: () => {
          onClose();
          if (onSelectCourt) onSelectCourt(c.id);
          else router.push(`/court/${c.id}`);
        },
      }));

    const matchedStates = Object.values(STATES_REGISTRY)
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((s) => ({
        id: `state-${s.slug}`,
        type: "state",
        title: `${s.name} Judicial Profile`,
        subtitle: `${s.highCourtName} Jurisdiction • ${(s.population2011 / 10000000).toFixed(1)}Cr population`,
        icon: MapPin,
        action: () => {
          onClose();
          router.push(`/states/${s.slug}`);
        },
      }));

    return [...matchedCourts, ...matchedStates];
  }, [query, allCourts, onClose, onOpenAi, onSelectCourt, router]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        results[selectedIndex].action();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-200">
      {/* Backdrop Blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xl transition-opacity"
      />

      {/* Command Palette Card */}
      <div className="relative w-full max-w-2xl bg-[#09090b]/95 border border-white/[0.15] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden text-white flex flex-col backdrop-blur-3xl animate-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-white/[0.08] bg-black/40">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search all 781 courts, states, cities, or actions..."
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white/10 text-zinc-400 border border-white/10">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 sm:p-3 space-y-1 scrollbar-thin">
          {results.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-zinc-400">
              <Building2 className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="text-sm">No courts or states matching &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-zinc-500">Try searching for &ldquo;Allahabad&rdquo;, &ldquo;Pune&rdquo;, &ldquo;Saket&rdquo;, or &ldquo;Maharashtra&rdquo;</p>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white text-black font-semibold shadow-md"
                      : "text-zinc-300 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-black text-white" : "bg-white/[0.06] text-zinc-300 border border-white/[0.08]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs sm:text-sm font-semibold truncate ${isSelected ? "text-black" : "text-white"}`}>
                        {item.title}
                      </div>
                      <div className={`text-[11px] truncate ${isSelected ? "text-zinc-700 font-normal" : "text-zinc-400"}`}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-black/10 text-black">
                        <span>Select</span>
                        <CornerDownLeft className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <ArrowRight className={`w-4 h-4 ${isSelected ? "text-black" : "text-zinc-500"}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Command Palette Footer */}
        <div className="p-3 border-t border-white/[0.08] bg-black/60 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">↵</kbd> Open
            </span>
          </div>
          <span>781 Courts Indexed</span>
        </div>
      </div>
    </div>
  );
}
