"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  Scale,
  ChevronRight,
  MapPin,
  Clock,
  ShieldCheck,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { CourtMarkerData } from "./MapView";
import { MapActionPayload } from "@/app/api/ai/chat/route";

interface NyayaCopilotProps {
  activeCourt?: CourtMarkerData | null;
  activeState?: string;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  onMapAction?: (action: MapActionPayload) => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: string;
  mapAction?: MapActionPayload;
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  { label: "⚡ Fastest Bail in Maharashtra", query: "Which district in Maharashtra has the fastest bail disposal speed?" },
  { label: "🚨 Most Pending Cases in India", query: "Show me the court with the most pending cases in India" },
  { label: "⚖️ Allahabad HC Backlog", query: "Why is Allahabad High Court accumulating backlog?" },
  { label: "⏱️ Gurgaon Cheque Bounce Time", query: "I have a cheque bounce case in Gurgaon. What is the average resolution time?" },
  { label: "👥 Bihar Judge Vacancy Crisis", query: "Summarize the judge vacancy crisis across Bihar district courts." },
];

// High-Fidelity Custom Markdown & Rich Component Parser
function RenderFormattedMessage({ content }: { content: string }) {
  // Split into paragraphs / blocks
  const blocks = useMemo(() => {
    const lines = content.split("\n");
    const parsedBlocks: Array<{
      type: "header" | "bullet" | "table" | "quote" | "hr" | "text";
      level?: number;
      text?: string;
      items?: string[];
      tableHeaders?: string[];
      tableRows?: string[][];
    }> = [];

    let currentTable: { headers: string[]; rows: string[][] } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        if (currentTable) {
          parsedBlocks.push({ type: "table", tableHeaders: currentTable.headers, tableRows: currentTable.rows });
          currentTable = null;
        }
        continue;
      }

      // Horizontal Rule
      if (line === "---" || line === "***") {
        if (currentTable) {
          parsedBlocks.push({ type: "table", tableHeaders: currentTable.headers, tableRows: currentTable.rows });
          currentTable = null;
        }
        parsedBlocks.push({ type: "hr" });
        continue;
      }

      // Markdown Table Parser
      if (line.startsWith("|") && line.endsWith("|")) {
        const cells = line
          .split("|")
          .map((c) => c.trim())
          .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);

        // Check if separator line
        const isSeparator = cells.every((c) => /^:?-+:?$/.test(c));

        if (isSeparator) {
          continue;
        }

        if (!currentTable) {
          currentTable = { headers: cells, rows: [] };
        } else {
          currentTable.rows.push(cells);
        }
        continue;
      } else if (currentTable) {
        parsedBlocks.push({ type: "table", tableHeaders: currentTable.headers, tableRows: currentTable.rows });
        currentTable = null;
      }

      // Headers (### or ####)
      if (line.startsWith("#### ")) {
        parsedBlocks.push({ type: "header", level: 4, text: line.replace(/^####\s+/, "") });
      } else if (line.startsWith("### ")) {
        parsedBlocks.push({ type: "header", level: 3, text: line.replace(/^###\s+/, "") });
      } else if (line.startsWith("## ")) {
        parsedBlocks.push({ type: "header", level: 2, text: line.replace(/^##\s+/, "") });
      } else if (line.startsWith("> ")) {
        parsedBlocks.push({ type: "quote", text: line.replace(/^>\s+/, "") });
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        parsedBlocks.push({ type: "bullet", text: line.replace(/^[-*]\s+/, "") });
      } else if (/^\d+\.\s+/.test(line)) {
        parsedBlocks.push({ type: "bullet", text: line });
      } else {
        parsedBlocks.push({ type: "text", text: line });
      }
    }

    if (currentTable) {
      parsedBlocks.push({ type: "table", tableHeaders: currentTable.headers, tableRows: currentTable.rows });
    }

    return parsedBlocks;
  }, [content]);

  // Helper to format inline tokens: `code`, **bold**, *italic*
  const formatInline = (text: string) => {
    if (!text) return null;

    // Tokenize text into inline parts
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        const codeText = part.slice(1, -1);
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded-md bg-white/10 text-emerald-300 font-mono text-[10px] font-semibold border border-white/10 tracking-tight inline-block my-0.5"
          >
            {codeText}
          </code>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={index} className="text-zinc-300 italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-2.5 w-full break-words leading-relaxed text-zinc-300">
      {blocks.map((block, idx) => {
        if (block.type === "hr") {
          return <hr key={idx} className="border-t border-white/[0.08] my-3" />;
        }

        if (block.type === "header") {
          if (block.level === 4) {
            return (
              <h4 key={idx} className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5 pt-1">
                {formatInline(block.text || "")}
              </h4>
            );
          }
          return (
            <h3
              key={idx}
              className="text-[13px] font-bold text-white tracking-tight pb-1 border-b border-white/[0.08] flex items-center gap-2"
            >
              {formatInline(block.text || "")}
            </h3>
          );
        }

        if (block.type === "quote") {
          return (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white/[0.03] border-l-2 border-emerald-400 border-white/[0.06] text-xs text-zinc-300 space-y-1"
            >
              {formatInline(block.text || "")}
            </div>
          );
        }

        if (block.type === "bullet") {
          return (
            <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
              <div className="flex-1 break-words">{formatInline(block.text || "")}</div>
            </div>
          );
        }

        if (block.type === "table" && block.tableHeaders) {
          return (
            <div key={idx} className="w-full my-2 overflow-x-auto rounded-xl border border-white/10 bg-black/40">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-white/[0.06] border-b border-white/10 text-white font-semibold">
                  <tr>
                    {block.tableHeaders.map((th, hIdx) => (
                      <th key={hIdx} className="p-2 border-r border-white/5 last:border-r-0 whitespace-nowrap">
                        {th}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {block.tableRows?.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/[0.02]">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2 border-r border-white/5 last:border-r-0 break-words">
                          {formatInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p key={idx} className="text-xs text-zinc-300 leading-relaxed">
            {formatInline(block.text || "")}
          </p>
        );
      })}
    </div>
  );
}

export function NyayaCopilot({ activeCourt, activeState, isOpen, onToggle, onMapAction }: NyayaCopilotProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: `### ⚖️ Welcome to NyayaAI Copilot

I am your **National Judicial Intelligence Assistant**, connected to **all 781 courts across India**.

---

### 🔍 How I Can Assist You:
- ⏱️ **Predict Trial Timelines:** Average resolution months for civil, criminal & cheque bounce disputes.
- ⚡ **Bail Speed Analysis:** Turnaround velocity for urgent bail pleas in any district.
- 🗺️ **Interactive Map Control:** Ask me about any court, and I will **automatically zoom and focus** the map camera on that location!
- 📞 **Free Citizen Legal Aid:** Direct helpline (**\`15100\`**) and DLSA guidance.

💡 *Click any suggested question below or type your query in English or Hindi!*`,
      source: "NyayaRadar Intelligence Engine",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          courtContext: activeCourt
            ? {
                name: activeCourt.court.name,
                tier: activeCourt.court.tier,
                district: activeCourt.court.district,
                state: activeCourt.court.state,
                total: activeCourt.total,
                civil: activeCourt.civil,
                criminal: activeCourt.criminal,
                judge_strength: activeCourt.judge_strength,
                case_clearance_rate: activeCourt.case_clearance_rate,
              }
            : undefined,
          stateContext: activeState && activeState !== "ALL" ? activeState : undefined,
        }),
      });

      const data = await res.json();
      const aiReply = data.reply || "I encountered an issue processing your query. Please try again.";

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: aiReply,
        source: data.source || "Gemini Flash / Judicial RAG",
        mapAction: data.mapAction,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically trigger camera flight if map action returned
      if (data.mapAction && onMapAction) {
        onMapAction(data.mapAction);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: "assistant",
          content: "Failed to connect to NyayaAI server. Please check your internet connection.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // If sidebar is closed, render floating trigger button only
  if (!isOpen) {
    return (
      <button
        onClick={() => onToggle(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-white text-black font-semibold text-xs shadow-2xl hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 border border-white/20 group backdrop-blur-md"
        aria-label="Open NyayaAI Copilot Sidebar"
      >
        <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white group-hover:rotate-12 transition-transform" />
        </div>
        <span className="tracking-tight font-bold">Ask NyayaAI</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </button>
    );
  }

  // When open, render full-height flex column sidebar
  return (
    <div className="w-full h-full flex flex-col bg-[#09090b] text-white overflow-hidden select-text">
      {/* Sidebar Header */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-black/70 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-white text-black flex items-center justify-center font-bold text-sm shadow-md shrink-0">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white tracking-tight">NyayaAI Copilot</h3>
              <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Map Controller</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">National Judicial Intelligence Command</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              setMessages([
                {
                  id: "welcome-reset",
                  role: "assistant",
                  content: "Chat cleared! How can I assist you with court data or legal timelines today?",
                  source: "NyayaRadar",
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ])
            }
            title="Reset Conversation"
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggle(false)}
            title="Collapse Sidebar"
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Active Context Bar */}
      {(activeCourt || (activeState && activeState !== "ALL")) && (
        <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06] text-xs text-zinc-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Scale className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">
              Focus: <strong className="text-white">{activeCourt ? activeCourt.court.name : activeState}</strong>
            </span>
          </div>
          {activeCourt && (
            <button
              onClick={() => handleSend(`Give me a complete intelligence summary of ${activeCourt.court.name}`)}
              className="text-[10px] font-semibold text-white px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0"
            >
              Analyze Court &rarr;
            </button>
          )}
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs scrollbar-thin">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`w-full flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-1 border border-white/10 shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`rounded-2xl p-4 leading-relaxed shadow-sm overflow-hidden break-words ${
                m.role === "user"
                  ? "max-w-[85%] bg-white text-black font-medium self-end"
                  : "w-full bg-white/[0.04] text-zinc-200 border border-white/[0.08] backdrop-blur-md"
              }`}
            >
              {/* Render Structured Content */}
              {m.role === "user" ? (
                <div className="text-xs font-medium text-black">{m.content}</div>
              ) : (
                <RenderFormattedMessage content={m.content} />
              )}

              {/* Interactive Map Focus Action Button if available */}
              {m.mapAction && (
                <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                  <button
                    onClick={() => m.mapAction && onMapAction && onMapAction(m.mapAction)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black font-bold text-[11px] hover:bg-zinc-200 transition-all shadow-md active:scale-95 shrink-0"
                  >
                    <MapPin className="w-3.5 h-3.5 text-black" />
                    <span>Focus on Map</span>
                  </button>
                  <span className="text-[10px] text-zinc-400 font-mono truncate">
                    {m.mapAction.courtName || m.mapAction.state}
                  </span>
                </div>
              )}

              {/* Metadata Footer */}
              <div
                className={`text-[9px] font-mono flex items-center justify-between pt-2 mt-2 border-t ${
                  m.role === "user" ? "border-black/10 text-zinc-600" : "border-white/5 text-zinc-500"
                }`}
              >
                <span>{m.source || (m.role === "user" ? "You" : "NyayaAI")}</span>
                <span>{m.timestamp}</span>
              </div>
            </div>

            {m.role === "user" && (
              <div className="w-7 h-7 rounded-xl bg-white text-black flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start w-full">
            <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 text-xs text-zinc-400 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span className="font-mono text-[11px]">Computing judicial metrics & camera coordinates...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips Carousel */}
      <div className="p-3 sm:p-4 border-t border-white/[0.06] bg-black/50 space-y-2 shrink-0">
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
          <span>Quick Intelligence Queries (Auto-Fly)</span>
          <span className="font-mono text-emerald-400">1-Click</span>
        </div>
        <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto scrollbar-thin">
          {SUGGESTED_PROMPTS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleSend(item.query)}
              className="w-full text-[11px] px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/10 text-zinc-300 hover:text-white border border-white/[0.06] transition-all text-left truncate active:scale-[0.99] flex items-center justify-between group"
              title={item.query}
            >
              <span className="truncate">{item.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white shrink-0 ml-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 border-t border-white/[0.08] bg-black/80 flex items-center gap-2.5 shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask in English or Hindi (e.g. most pending cases, bail speed)..."
          className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-11 h-11 rounded-2xl bg-white text-black hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-lg"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
