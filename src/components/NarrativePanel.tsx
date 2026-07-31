import React from "react";
import { NarrativeData } from "../types";
import { MessageSquare, UserCheck, HelpCircle, Layers, CheckCircle2, AlertCircle } from "lucide-react";

interface NarrativePanelProps {
  narrative: NarrativeData | null;
}

export const NarrativePanel: React.FC<NarrativePanelProps> = ({ narrative }) => {
  if (!narrative) return null;

  const { answers } = narrative;

  const questions = [
    {
      q: "1. Who controls the market?",
      a: answers.who_controls_market,
      icon: UserCheck,
      color: "border-slate-800 bg-slate-950/60 text-slate-300",
    },
    {
      q: "2. Why is price here?",
      a: answers.why_price_is_here,
      icon: HelpCircle,
      color: "border-slate-800 bg-slate-950/60 text-slate-300",
    },
    {
      q: "3. What liquidity was swept?",
      a: answers.liquidity_taken,
      icon: Layers,
      color: "border-purple-500/20 bg-purple-500/5 text-purple-300",
    },
    {
      q: "4. Institutional confirmation?",
      a: answers.institutional_confirmation,
      icon: CheckCircle2,
      color: "border-cyan-500/20 bg-cyan-500/5 text-cyan-300",
    },
    {
      q: "5. Narrative coherence?",
      a: answers.narrative_coherence,
      icon: AlertCircle,
      color: narrative.is_coherent
        ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-300"
        : "border-amber-500/20 bg-amber-500/5 text-amber-300",
    },
    {
      q: "6. Confidence level?",
      a: answers.confidence_level,
      icon: MessageSquare,
      color: "border-slate-800 bg-slate-950/60 text-slate-300",
    },
    {
      q: "7. Execution verdict?",
      a: answers.execution_verdict,
      icon: CheckCircle2,
      color: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-bold",
    },
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded uppercase font-mono">
            Moteur de Récit
          </span>
          <span className="text-[10px] text-slate-500 font-mono">ID: PRD-992-TX</span>
        </div>
        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
            narrative.is_coherent
              ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          }`}
        >
          {narrative.is_coherent ? "SYNTHÈSE COHÉRENTE" : "SYNTHÈSE MIXTE"}
        </span>
      </div>

      {/* Primary Narrative Story Callout */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-sm leading-relaxed relative overflow-hidden">
        <h2 className="text-base font-semibold text-white mb-2 italic font-serif">Cognitive Market Synthesis</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
          "{narrative.story}"
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="px-2.5 py-1 bg-slate-900 rounded text-[10px] text-slate-300 border border-slate-800 font-mono">+ BULLISH BIAS</div>
          <div className="px-2.5 py-1 bg-slate-900 rounded text-[10px] text-slate-300 border border-slate-800 font-mono">+ LIQUIDITY SWEEP</div>
          <div className="px-2.5 py-1 bg-slate-900 rounded text-[10px] text-slate-300 border border-slate-800 font-mono">+ DISPLACEMENT CONFIRMED</div>
        </div>
      </div>

      {/* The 7 Core Institutional Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {questions.map((item, index) => {
          const IconComp = item.icon;
          return (
            <div key={index} className={`p-3 rounded-lg border ${item.color} flex flex-col gap-1`}>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider">
                <IconComp className="w-3.5 h-3.5" />
                <span>{item.q}</span>
              </div>
              <p className="text-xs text-slate-300 font-medium pl-5 leading-relaxed">{item.a}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
