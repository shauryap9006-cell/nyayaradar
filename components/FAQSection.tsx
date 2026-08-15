"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Scale, ShieldCheck, PhoneCall, Clock } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  icon: any;
}

const FAQS: FAQItem[] = [
  {
    icon: Scale,
    question: "What is Case Clearance Rate (CCR %) and why is it sometimes above 100%?",
    answer: "Case Clearance Rate (CCR) is defined as (Disposed Cases / Instituted Cases) × 100. When a court disposes of more cases in a year than new cases filed, its CCR exceeds 100%. This indicates that the court is actively reducing its historical backlog rather than accumulating new delays.",
  },
  {
    icon: Clock,
    question: "What is Statutory Default Bail under Section 167(2) CrPC?",
    answer: "Under Section 167(2) of the Code of Criminal Procedure (CrPC), an accused person has an absolute, non-discretionary right to default bail if the police investigation is not completed and the chargesheet is not filed within 60 days (for offenses punishable up to 10 years) or 90 days (for offenses punishable with 10+ years or life imprisonment).",
  },
  {
    icon: PhoneCall,
    question: "How can citizens access Free Government Legal Representation?",
    answer: "Under the Legal Services Authorities Act (1987) and Article 39A of the Indian Constitution, marginalized citizens, women, children, undertrial prisoners, and persons with annual income below statutory limits are entitled to 100% free legal representation. Citizens can dial the National Legal Aid Toll-Free Helpline at 15100 (available 24/7) or visit their local District Legal Services Authority (DLSA) office.",
  },
  {
    icon: ShieldCheck,
    question: "How does NyayaRadar ensure data accuracy from government portals?",
    answer: "Every dataset snapshot must pass 5 non-negotiable automated sanity rules: (1) Maximum 25% delta deviation cap, (2) Civil + Criminal = Total parity within 2%, (3) Registry completeness across all 781 courts, (4) Strict zero/null bans, and (5) Sovereign Indian boundary coordinate validation. Any anomaly is quarantined automatically.",
  },
  {
    icon: Scale,
    question: "What is the expected resolution timeline for Section 138 (Cheque Bounce) cases?",
    answer: "While Section 143(3) of the Negotiable Instruments Act aims for trial conclusion within 6 months, the national average in district courts is currently 16–24 months due to docket load. Litigants can fast-track recovery by requesting reference to National Lok Adalats (which offer same-day settlement and 100% court fee refunds) or dedicated Special NI Act Fast-Track Courts.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-3">
      {FAQS.map((faq, idx) => {
        const isOpen = openIndex === idx;
        const Icon = faq.icon;

        return (
          <div
            key={idx}
            className={`glass-panel rounded-2xl border transition-all overflow-hidden ${
              isOpen ? "bg-white/[0.05] border-white/20 shadow-lg" : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
            }`}
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-white focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isOpen ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{faq.question}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/[0.06] animate-in fade-in duration-200">
                <p className="max-w-3xl">{faq.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
