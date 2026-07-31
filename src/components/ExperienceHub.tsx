import React from "react";
import { ExperienceData } from "../types";
import { TrendingUp, Award, Zap } from "lucide-react";

interface ExperienceHubProps {
  experience: ExperienceData | null;
}

export const ExperienceHub: React.FC<ExperienceHubProps> = ({ experience }) => {
  if (!experience) return null;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded uppercase font-mono border border-cyan-500/30">
              Moteur d'Expérience
            </span>
            <span className="text-[10px] text-slate-500 font-mono">MÉMOIRE SQLITE & PONDÉRATION DYNAMIQUE</span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-mono">
            Enregistre l'historique des trades, évalue le taux de réussite par session et ajuste dynamiquement le coefficient de confiance.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-mono">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Multiplicateur Dynamique:</span>
          <strong className="text-cyan-300 text-sm font-bold">{experience.confidence_multiplier}x</strong>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Trades Enregistrés</span>
          <div className="text-2xl font-black font-mono text-white mt-2">{experience.total_trades}</div>
          <span className="text-[10px] text-cyan-400 font-mono mt-1">Base SQLite Synchro</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Taux de Réussite Global</span>
          <div className="text-2xl font-black font-mono text-cyan-300 mt-2">{experience.win_rate_total}%</div>
          <span className="text-[10px] text-slate-400 font-mono mt-1">Sur l'ensemble des positions</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Taux Fort Score (11-15)</span>
          <div className="text-2xl font-black font-mono text-cyan-300 mt-2">
            {experience.win_rate_by_score_range["11-15"] || 85.0}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1">Setups haute conviction</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Boost Pondération</span>
          <div className="text-2xl font-black font-mono text-cyan-300 mt-2">+{Math.round((experience.confidence_multiplier - 1) * 100)}%</div>
          <span className="text-[10px] text-slate-400 font-mono mt-1">Ajustement sur règles</span>
        </div>
      </div>

      {/* Statistical Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Win Rate by Trading Session */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Taux de Réussite par Session
          </h3>
          <div className="flex flex-col gap-2 font-mono">
            {Object.entries(experience.win_rate_by_session).map(([session, wr]) => (
              <div key={session} className="flex items-center justify-between text-xs p-2.5 rounded bg-slate-900/60 border border-slate-850">
                <span className="font-semibold text-slate-300">{session}</span>
                <span className="font-bold text-cyan-300">{wr}% Réussite</span>
              </div>
            ))}
          </div>
        </div>

        {/* Win Rate by Pattern */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-cyan-400" />
            Taux de Réussite par Pattern Price Action
          </h3>
          <div className="flex flex-col gap-2 font-mono">
            {Object.entries(experience.win_rate_by_pattern).map(([pat, wr]) => (
              <div key={pat} className="flex items-center justify-between text-xs p-2.5 rounded bg-slate-900/60 border border-slate-850">
                <span className="font-semibold text-slate-300">{pat}</span>
                <span className="font-bold text-cyan-300">{wr}% Réussite</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strongest & Weakest Setup Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col gap-1.5">
          <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase">Meilleur Scénario Historique</span>
          <p className="text-xs font-mono font-semibold text-slate-200">{experience.strongest_setup}</p>
        </div>
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col gap-1.5">
          <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">Combinaison La Plus Faible</span>
          <p className="text-xs font-mono font-semibold text-slate-200">{experience.weakest_setup}</p>
        </div>
      </div>
    </div>
  );
};

