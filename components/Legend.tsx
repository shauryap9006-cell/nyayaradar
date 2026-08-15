"use client";

export function Legend() {
  return (
    <div className="glass-panel rounded-2xl p-4 shadow-2xl text-xs text-white space-y-3 max-w-xs border border-white/[0.1]">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-white tracking-tight text-sm">Court Location Markers</span>
      </div>

      <div className="space-y-3 pt-1">
        {/* Supreme Court Marker: Apex Hexagonal Shield Beacon */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-9 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 36 50" width="24" height="34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 0L34 7V26C34 37 25 46 18 50C11 46 2 37 2 26V7L18 0Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
              <circle cx="18" cy="22" r="11" fill="#000000" />
              <circle cx="18" cy="22" r="8" fill="#FFFFFF" />
              <circle cx="18" cy="22" r="4.5" fill="#000000" />
              <circle cx="18" cy="22" r="2" fill="#FFFFFF" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-white text-xs flex items-center gap-1.5">
              <span>Supreme Court of India</span>
              <span className="text-[9px] font-mono bg-white text-black font-extrabold px-1.5 rounded">SC</span>
            </div>
            <div className="text-[10px] text-zinc-400">Large White Shield Beacon (Apex)</div>
          </div>
        </div>

        {/* High Court Marker: Pillar Architectural Teardrop */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-9 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 28 40" width="20" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 0C6.268 0 0 6.268 0 14C0 23.5 12.6 38.8 13.1 39.4C13.55 39.95 14.45 39.95 14.9 39.4C15.4 38.8 28 23.5 28 14C28 6.268 21.732 0 14 0Z" fill="#000000" stroke="#FFFFFF" strokeWidth="2" />
              <polygon points="14,6 7,11 21,11" fill="#FFFFFF" />
              <rect x="8" y="12" width="2" height="7" fill="#FFFFFF" rx="0.5" />
              <rect x="13" y="12" width="2" height="7" fill="#FFFFFF" rx="0.5" />
              <rect x="18" y="12" width="2" height="7" fill="#FFFFFF" rx="0.5" />
              <rect x="7" y="20" width="14" height="2" fill="#FFFFFF" rx="0.5" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-white text-xs">25 High Courts</div>
            <div className="text-[10px] text-zinc-400">Medium Black Pillar Teardrop (State)</div>
          </div>
        </div>

        {/* District Court Marker: Precision Diamond Needle */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-9 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 30" width="16" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0L19 9L10 29L1 9L10 0Z" fill="#18181b" stroke="#FFFFFF" strokeWidth="1.6" />
              <circle cx="10" cy="10" r="4.2" fill="#27272a" stroke="#FFFFFF" strokeWidth="1" />
              <circle cx="10" cy="10" r="1.8" fill="#FFFFFF" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-white text-xs">755 District Courts</div>
            <div className="text-[10px] text-zinc-400">Compact Obsidian Diamond (Subordinate)</div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <span>Click marker for stats</span>
        <span>781 Total</span>
      </div>
    </div>
  );
}
