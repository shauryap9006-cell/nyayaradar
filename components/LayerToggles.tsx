"use client";

import { Layers, Landmark, Building2, MapPin, ChevronDown } from "lucide-react";
import { STATES_REGISTRY } from "@/lib/states";

interface LayerTogglesProps {
  selectedTier: "ALL" | "SC" | "HC" | "DISTRICT";
  onTierChange: (tier: "ALL" | "SC" | "HC" | "DISTRICT") => void;
  selectedState: string;
  onStateChange: (state: string) => void;
}

export function LayerToggles({
  selectedTier,
  onTierChange,
  selectedState,
  onStateChange,
}: LayerTogglesProps) {
  return (
    <div className="glass-panel rounded-2xl p-1.5 shadow-2xl flex flex-wrap items-center gap-2 text-xs text-white max-w-full backdrop-blur-2xl">
      {/* Tier Switcher Segmented Control */}
      <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06] flex-wrap sm:flex-nowrap">
        <button
          onClick={() => onTierChange("ALL")}
          className={`px-3 py-1.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-1.5 active:scale-95 ${
            selectedTier === "ALL"
              ? "bg-white text-black shadow-md font-semibold"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All</span>
        </button>

        <button
          onClick={() => onTierChange("SC")}
          className={`px-3 py-1.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-1.5 active:scale-95 ${
            selectedTier === "SC"
              ? "bg-white text-black shadow-md font-semibold"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Supreme Court</span>
        </button>

        <button
          onClick={() => onTierChange("HC")}
          className={`px-3 py-1.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-1.5 active:scale-95 ${
            selectedTier === "HC"
              ? "bg-white text-black shadow-md font-semibold"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">High Courts</span>
        </button>

        <button
          onClick={() => onTierChange("DISTRICT")}
          className={`px-3 py-1.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-1.5 active:scale-95 ${
            selectedTier === "DISTRICT"
              ? "bg-white text-black shadow-md font-semibold"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">District Courts</span>
        </button>
      </div>

      {/* State Selector Dropdown */}
      <div className="relative flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-xl border border-white/[0.06] transition-colors cursor-pointer group">
        <MapPin className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors shrink-0" />
        <select
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer appearance-none pr-5 py-0.5"
        >
          <option value="ALL" className="bg-zinc-950 text-white">All India (National View)</option>
          {Object.values(STATES_REGISTRY).map((s) => (
            <option key={s.slug} value={s.slug} className="bg-zinc-950 text-white">
              {s.name}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 pointer-events-none group-hover:text-white transition-colors" />
      </div>
    </div>
  );
}
