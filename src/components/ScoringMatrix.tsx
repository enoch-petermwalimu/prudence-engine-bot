import React from "react";
import { ScoringData } from "../types";
import { Award, ShieldAlert, CheckCircle2, Sliders } from "lucide-react";

interface ScoringMatrixProps {
  scoring: ScoringData | null;
}

export const ScoringMatrix: React.FC<ScoringMatrixProps> = ({ scoring }) => {
  if (!scoring) return null;

  const { breakdown } = scoring;

  const items = [
    { label: "Market Bias", pts: breakdown.bias, max: 2.0 },
    { label: "Market Regime", pts: breakdown.regime, max: 2.0 },
    { label: "Institutional Zone", pts: breakdown.zone, max: 2.0 },
    { label: "Liquidity Sweep", pts: breakdown.liquidity, max: 2.0 },
    { label: "Price Action Pattern", pts: breakdown.price_action, max: 2.0 },
    { label: "Displacement", pts: breakdown.displacement, max: 2.0 },
    { label: "Market Structure (MSS/BOS)", pts: breakdown.structure, max: 3.0 },
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded uppercase font-mono">
            Moteur de Scoring
          </span>
          <span className="text-[10px] text-slate-500 font-mono">ID: SCORE-15-PT</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
              scoring.classification === "EXCELLENT"
                ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                : scoring.classification === "MEDIUM"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {scoring.classification} ({scoring.total_score} / 15.0)
          </span>
        </div>
      </div>

      {/* Main Score Progress Card */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col items-center justify-center font-mono">
            <span className="text-2xl font-black text-cyan-300">{scoring.total_score}</span>
            <span className="text-[10px] text-slate-500">/ 15.0</span>
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Taux de Confiance</div>
            <div className="text-base font-bold text-white font-mono">{scoring.confidence_percentage}% Probabilité de Réussite</div>
            <p className="text-xs text-slate-400 mt-0.5">Classification: 0-7 (Ignorer), 8-10 (Moyen), 11-15 (Excellent)</p>
          </div>
        </div>

        {/* Threshold indicator */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-500">
            0-7: IGNORER
          </div>
          <div className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
            8-10: MOYEN
          </div>
          <div className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
            11-15: EXCELLENT
          </div>
        </div>
      </div>

      {/* Point Breakdown Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {items.map((it, idx) => {
          const pct = Math.min(100, (it.pts / it.max) * 100);
          return (
            <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300 text-[11px]">{it.label}</span>
                <span className="font-mono font-bold text-cyan-300 text-xs">
                  {it.pts} / {it.max} pts
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct >= 80 ? "bg-cyan-400" : pct >= 50 ? "bg-cyan-500/70" : "bg-amber-500"
                  }`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
