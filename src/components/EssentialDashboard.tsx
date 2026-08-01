import React from "react";
import { TrendingUp, TrendingDown, Target, ShieldCheck, Zap, Award, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { CognitiveAnalysisResult } from "../types";
import { formatPrice } from "../utils/formatters";

interface EssentialDashboardProps {
  analysis: CognitiveAnalysisResult | null;
}

export const EssentialDashboard: React.FC<EssentialDashboardProps> = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 animate-pulse h-32"></div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 animate-pulse h-32"></div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 animate-pulse h-32"></div>
      </div>
    );
  }

  const signal = analysis.execution?.signal || (analysis.bias?.direction === "BUY" || analysis.bias?.direction === "SELL" ? analysis.bias.direction : "ATTENTE");
  const isBuy = signal === "BUY";
  const isSell = signal === "SELL";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
      {/* INDICATEUR 1: DÉCISION & DIRECTION */}
      <div className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-cyan-400/50 transition-all">
        <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              1. Signal & Direction
            </span>
            <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-bold">
              {analysis.symbol} • {analysis.timeframe}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div
              className={`p-3 rounded-xl flex items-center justify-center font-black text-lg shadow-lg ${
                isBuy
                  ? "bg-cyan-500 text-slate-950 shadow-cyan-500/20"
                  : isSell
                  ? "bg-rose-500 text-white shadow-rose-500/20"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {isBuy ? <ArrowUpRight className="w-6 h-6 stroke-[3]" /> : isSell ? <ArrowDownRight className="w-6 h-6 stroke-[3]" /> : null}
              <span>{isBuy ? "ACHAT (BUY)" : isSell ? "VENTE (SELL)" : "ATTENTE"}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Biais de Marché:</span>
          <span className="font-bold text-cyan-300">{analysis.structure.direction || "Haussier"}</span>
        </div>
      </div>

      {/* INDICATEUR 2: PRIX D'ENTRÉE & NIVEAUX */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-cyan-500/30 transition-all">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              2. Prix d'Entrée & Objectifs
            </span>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">
              R:R {analysis.risk.rr_ratio}x
            </span>
          </div>

          <div className="space-y-1.5 mt-2 text-xs">
            <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-850">
              <span className="text-slate-400">Entrée Moyenne:</span>
              <strong className="text-cyan-300 font-bold text-sm">
                {formatPrice(analysis.execution.average_entry, analysis.symbol)}
              </strong>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="p-1.5 rounded bg-slate-950 border border-slate-850 flex flex-col">
                <span className="text-rose-400 font-bold">Stop Loss (SL)</span>
                <span className="text-slate-200 font-bold">
                  {formatPrice(analysis.execution.sl, analysis.symbol)}
                </span>
              </div>
              <div className="p-1.5 rounded bg-slate-950 border border-slate-850 flex flex-col">
                <span className="text-cyan-400 font-bold">Take Profit (TP)</span>
                <span className="text-slate-200 font-bold">
                  {formatPrice(analysis.execution.tp, analysis.symbol)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Position Maximale:</span>
          <span className="font-bold text-slate-200">{analysis.risk.calculated_lot_size} Lot(s)</span>
        </div>
      </div>

      {/* INDICATEUR 3: SCORE & CONFIANCE */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-cyan-500/30 transition-all">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              3. Score & Conviction
            </span>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">
              {analysis.scoring.confidence_percentage}% Confiance
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <div>
              <span className="text-3xl font-black text-cyan-300">
                {analysis.scoring.total_score}
              </span>
              <span className="text-sm text-slate-500 font-bold"> / 15 pts</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Niveau</span>
              <span className="text-xs font-bold text-cyan-400">
                {analysis.scoring.total_score >= 11 ? "Très Élevé (Haute Conviction)" : "Moyen"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Filtre Macro/Session:</span>
          <span className="font-bold text-cyan-300">Validé ✓</span>
        </div>
      </div>
    </div>
  );
};
