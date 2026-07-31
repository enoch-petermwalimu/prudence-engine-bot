import React from "react";
import { CognitiveAnalysisResult } from "../types";
import { CheckCircle2, ChevronRight, Zap, Award, Layers, Sparkles } from "lucide-react";

interface CognitiveTraceProps {
  analysis: CognitiveAnalysisResult | null;
}

export const CognitiveTrace: React.FC<CognitiveTraceProps> = ({ analysis }) => {
  if (!analysis) return null;

  const engines = [
    {
      id: "1",
      name: "Market Data",
      status: "NORMALIZED",
      badge: `${analysis.symbol} ${analysis.timeframe}`,
      color: "border-slate-800 text-slate-300 bg-slate-950/60",
      detail: "OHLC normalized, EMA20/60/200 calculated.",
    },
    {
      id: "2",
      name: "Market Bias",
      status: analysis.bias.direction,
      badge: `${analysis.bias.confidence}% Conf`,
      color:
        analysis.bias.direction === "BUY"
          ? "border-cyan-500/30 text-cyan-300 bg-cyan-500/5"
          : analysis.bias.direction === "SELL"
          ? "border-rose-500/30 text-rose-400 bg-rose-500/5"
          : "border-amber-500/30 text-amber-400 bg-amber-500/5",
      detail: analysis.bias.ema_alignment,
    },
    {
      id: "3",
      name: "Market Regime",
      status: analysis.regime.type,
      badge: `${analysis.regime.volatility_ratio} Vol`,
      color: "border-slate-800 text-slate-300 bg-slate-950/60",
      detail: analysis.regime.description,
    },
    {
      id: "4",
      name: "Institutional Zone",
      status: analysis.zone_valuation.valuation,
      badge: `${analysis.zone_valuation.discount_level}%`,
      color:
        analysis.zone_valuation.valuation === "DISCOUNT"
          ? "border-cyan-500/30 text-cyan-300 bg-cyan-500/5"
          : "border-rose-500/30 text-rose-400 bg-rose-500/5",
      detail: `Equilibrium: ${analysis.zone_valuation.equilibrium_price}`,
    },
    {
      id: "5",
      name: "Liquidity Sweep",
      status: analysis.liquidity.has_sweep ? "SWEEP DETECTED" : "NO SWEEP",
      badge: analysis.liquidity.has_sweep ? "ACTIVE" : "STATIONARY",
      color: analysis.liquidity.has_sweep
        ? "border-purple-500/30 text-purple-300 bg-purple-500/5"
        : "border-slate-800 text-slate-500 bg-slate-950/60",
      detail: analysis.liquidity.sweep_details,
    },
    {
      id: "6",
      name: "Price Action",
      status: analysis.price_action.primary_pattern,
      badge: `Str: ${analysis.price_action.strength}/10`,
      color: "border-slate-800 text-slate-300 bg-slate-950/60",
      detail: analysis.price_action.description,
    },
    {
      id: "7",
      name: "Displacement",
      status: analysis.displacement.quality,
      badge: `${analysis.displacement.atr_multiplier}x ATR`,
      color:
        analysis.displacement.quality === "INSTITUTIONAL"
          ? "border-cyan-500/30 text-cyan-300 bg-cyan-500/5"
          : "border-slate-800 text-slate-300 bg-slate-950/60",
      detail: analysis.displacement.description,
    },
    {
      id: "8",
      name: "Structure",
      status: analysis.structure.event_type,
      badge: analysis.structure.direction,
      color: "border-slate-800 text-slate-300 bg-slate-950/60",
      detail: analysis.structure.description,
    },
    {
      id: "9",
      name: "Narrative",
      status: analysis.narrative.is_coherent ? "COHERENT" : "MIXED",
      badge: analysis.narrative.is_coherent ? "ALIGNMENT" : "CONFLICT",
      color: analysis.narrative.is_coherent
        ? "border-cyan-500/30 text-cyan-300 bg-cyan-500/5"
        : "border-amber-500/30 text-amber-400 bg-amber-500/5",
      detail: "Narrative Engine synthesized 7 institutional answers.",
    },
    {
      id: "10",
      name: "Scoring Matrix",
      status: `${analysis.scoring.total_score} / 15.0`,
      badge: analysis.scoring.classification,
      color:
        analysis.scoring.classification === "EXCELLENT"
          ? "border-cyan-500/40 text-cyan-300 bg-cyan-500/10 font-bold"
          : "border-amber-500/40 text-amber-400 bg-amber-500/10",
      detail: `${analysis.scoring.confidence_percentage}% Confidence Score`,
    },
    {
      id: "11",
      name: "Experience Hub",
      status: `${analysis.experience.win_rate_total}% WR`,
      badge: `${analysis.experience.confidence_multiplier}x Weight`,
      color: "border-slate-800 text-slate-300 bg-slate-950/60",
      detail: `Learned from ${analysis.experience.total_trades} trade records.`,
    },
    {
      id: "12",
      name: "Risk Engine",
      status: analysis.risk.is_permitted ? "PERMITTED" : "REJECTED",
      badge: `${analysis.risk.calculated_lot_size} Lots`,
      color: analysis.risk.is_permitted
        ? "border-cyan-500/30 text-cyan-300 bg-cyan-500/5"
        : "border-rose-500/30 text-rose-400 bg-rose-500/5",
      detail: analysis.risk.rejection_reason || `Risk $${analysis.risk.risk_amount_usd} (${analysis.risk.sl_pips} pips SL)`,
    },
    {
      id: "13 & 14",
      name: "Execution & Layering",
      status: analysis.execution.signal,
      badge: `${analysis.execution.layer_count} Layers`,
      color:
        analysis.execution.signal === "BUY"
          ? "border-cyan-500/40 text-cyan-300 bg-cyan-500/10 font-bold"
          : analysis.execution.signal === "SELL"
          ? "border-rose-500/40 text-rose-400 bg-rose-500/10 font-bold"
          : "border-slate-800 text-slate-500 bg-slate-950/60",
      detail: `Average Entry: ${analysis.execution.average_entry}`,
    },
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded uppercase font-mono border border-cyan-500/30">
            Pipeline Trace
          </span>
          <span className="text-[10px] text-slate-500 font-mono">14 MODULAR COGNITIVE ENGINES</span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Status: <strong className="text-cyan-400">SYNCHRONIZED</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {engines.map((eng) => (
          <div
            key={eng.id}
            className={`p-3 rounded-lg border ${eng.color} flex flex-col justify-between gap-1.5 transition-all hover:border-slate-700`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                ENGINE {eng.id}
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-current">
                {eng.badge}
              </span>
            </div>
            <div>
              <div className="text-[11px] font-bold font-mono text-white flex items-center gap-1">
                {eng.name}
              </div>
              <div className="text-sm font-black font-mono tracking-tight mt-0.5">{eng.status}</div>
            </div>
            <p className="text-[10px] font-mono text-slate-400 leading-snug line-clamp-2 mt-1">{eng.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
