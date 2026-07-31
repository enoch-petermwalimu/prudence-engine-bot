import React from "react";
import { Activity, RefreshCw, Settings, Wifi, Layers } from "lucide-react";

interface HeaderProps {
  symbol: string;
  setSymbol: (s: string) => void;
  timeframe: string;
  setTimeframe: (tf: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenConfig: () => void;
  onOpenDerivCatalog?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  symbol,
  setSymbol,
  timeframe,
  setTimeframe,
  onAnalyze,
  isLoading,
  activeTab,
  setActiveTab,
  onOpenConfig,
  onOpenDerivCatalog,
}) => {
  return (
    <header className="bg-[#05070a]/90 backdrop-blur-md border-b border-slate-800/60 text-slate-100 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50 shadow-2xl">
      {/* Brand & Engine Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner">
          <span className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse"></span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 font-mono">
              PRUDENCE <span className="text-cyan-400">V5</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-full flex items-center gap-1">
              <Wifi className="w-2.5 h-2.5 animate-pulse text-cyan-400" />
              FLUX DERIV / EN DIRECT
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono uppercase tracking-widest">
            Moteur Cognitif Institutionnel • Données Deriv & Marchés
          </p>
        </div>
      </div>

      {/* Navigation Tabs (Turquoise Style) */}
      <div className="flex items-center bg-slate-900/60 border border-slate-800/80 rounded-xl p-1 text-xs">
        <button
          onClick={() => setActiveTab("workbench")}
          className="px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          Tableau de Bord
        </button>
      </div>

      {/* Control Actions & Status */}
      <div className="flex items-center gap-3 flex-wrap justify-end">
        {/* Deriv Catalog Button */}
        {onOpenDerivCatalog && (
          <button
            onClick={onOpenDerivCatalog}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 transition-all cursor-pointer font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm"
            title="Ouvrir le Catalogue des Actifs Deriv"
          >
            <Layers className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Actifs Deriv</span>
          </button>
        )}

        {/* Config Button */}
        <button
          onClick={onOpenConfig}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-all cursor-pointer font-mono text-xs flex items-center gap-1.5"
          title="Ouvrir la Configuration"
        >
          <Settings className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Configs</span>
        </button>

        {/* Pair / Symbol Select */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 rounded-xl px-3 py-1.5 text-xs font-mono">
          <span className="text-slate-500 uppercase">Actif:</span>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-transparent text-cyan-400 font-bold focus:outline-none cursor-pointer max-w-[140px]"
          >
            <optgroup label="Indices Synthétiques Deriv">
              <option value="R_100" className="bg-slate-950 text-white">Volatility 100 Index</option>
              <option value="R_75" className="bg-slate-950 text-white">Volatility 75 Index</option>
              <option value="R_50" className="bg-slate-950 text-white">Volatility 50 Index</option>
              <option value="R_25" className="bg-slate-950 text-white">Volatility 25 Index</option>
              <option value="1HZ10V" className="bg-slate-950 text-white">Volatility 10 (1s) Index</option>
              <option value="BOOM1000" className="bg-slate-950 text-white">Boom 1000 Index</option>
              <option value="CRASH1000" className="bg-slate-950 text-white">Crash 1000 Index</option>
              <option value="STEP" className="bg-slate-950 text-white">Step Index</option>
              <option value="JD10" className="bg-slate-950 text-white">Jump 10 Index</option>
            </optgroup>
            <optgroup label="Forex & Matières Premières">
              <option value="EURUSD" className="bg-slate-950 text-white">EUR/USD</option>
              <option value="GBPUSD" className="bg-slate-950 text-white">GBP/USD</option>
              <option value="XAUUSD" className="bg-slate-950 text-white">XAUUSD (Or)</option>
              <option value="BTCUSD" className="bg-slate-950 text-white">BTC/USD</option>
            </optgroup>
          </select>
        </div>

        {/* Timeframe Select */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 rounded-xl px-3 py-1.5 text-xs font-mono">
          <span className="text-slate-500 uppercase">UT:</span>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-transparent text-cyan-400 font-bold focus:outline-none cursor-pointer"
          >
            <option value="M5" className="bg-slate-950 text-white">M5</option>
            <option value="M15" className="bg-slate-950 text-white">M15</option>
            <option value="H1" className="bg-slate-950 text-white">H1</option>
            <option value="H4" className="bg-slate-950 text-white">H4</option>
          </select>
        </div>

        {/* Trigger Analysis Button */}
        <button
          onClick={onAnalyze}
          disabled={isLoading}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-all active:scale-95 font-mono uppercase tracking-wider"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Analyse..." : "Analyser"}
        </button>
      </div>
    </header>
  );
};


