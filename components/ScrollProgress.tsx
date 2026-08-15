"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollProgress() {
  const [scrollPct, setScrollPct] = useState(0);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = (window.scrollY / totalHeight) * 100;
        setScrollPct(Math.min(100, Math.max(0, current)));
        setShowTopBtn(window.scrollY > 300);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Top Glow Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 bg-white/[0.06] pointer-events-none">
        <div
          className="h-full bg-white transition-all duration-150 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          style={{ width: `${scrollPct}%` }}
        />
      </div>

      {/* Floating Back to Top Button */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-white text-black font-semibold text-xs shadow-2xl hover:bg-zinc-200 transition-all hover:scale-110 active:scale-95 border border-white/20 animate-in fade-in zoom-in-50 duration-200 backdrop-blur-md"
          title="Scroll back to top"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4 text-black stroke-[2.5]" />
        </button>
      )}
    </>
  );
}
