import React, { useState, useEffect } from "react";
import { DerivSymbol } from "../types";
import { Search, X, Zap, Globe, Flame, Coins, LineChart, Check } from "lucide-react";

interface DerivAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export const DerivAssetModal: React.FC<DerivAssetModalProps> = ({
  isOpen,
  onClose,
  selectedSymbol,
  onSelectSymbol,
}) => {
  const [symbols, setSymbols] = useState<DerivSymbol[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [dataSource, setDataSource] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/deriv/symbols")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.symbols) {
            setSymbols(data.symbols);
            setDataSource(data.source || "DERIV_WS_LIVE");
          }
        })
        .catch((err) => console.error("Failed to load Deriv symbols", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Categories filter logic
  const filteredSymbols = symbols.filter((item) => {
    const matchesSearch =
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.submarket_display_name &&
        item.submarket_display_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeCategory === "derived") {
      return item.market === "synthetic_index" || item.market === "derived";
    }
    if (activeCategory === "forex") {
      return item.market === "forex";
    }
    if (activeCategory === "commodities") {
      return item.market === "commodities";
    }
    if (activeCategory === "crypto") {
      return item.market === "cryptocurrency";
    }
    if (activeCategory === "indices") {
      return item.market === "indices" || item.market === "basket_index";
    }
    return true; // "all"
  });

  const handleSelect = (symbolCode: string) => {
    onSelectSymbol(symbolCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-mono">
                  Catalogue des Actifs <span className="text-cyan-400">Deriv</span>
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-full">
                  {dataSource === "DERIV_WS_LIVE" ? "DERIV WS EN DIRECT" : "SERVEUR DERIV PRÊT"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sélectionnez n'importe quel actif synthétique ou paire pour alimenter le moteur cognitif.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Category Filters */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un actif Deriv (ex: Volatility 75, Boom 1000, EURUSD, Step...)"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono no-scrollbar">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === "all"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              Tous ({symbols.length})
            </button>
            <button
              onClick={() => setActiveCategory("derived")}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === "derived"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Indices Synthétiques
            </button>
            <button
              onClick={() => setActiveCategory("forex")}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === "forex"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Forex
            </button>
            <button
              onClick={() => setActiveCategory("commodities")}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === "commodities"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              Matières Premières
            </button>
            <button
              onClick={() => setActiveCategory("crypto")}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === "crypto"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-cyan-400" />
              Cryptomonnaies
            </button>
          </div>
        </div>

        {/* Assets Grid / List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
              <span>Connexion au catalogue Deriv en cours...</span>
            </div>
          ) : filteredSymbols.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              Aucun actif Deriv ne correspond à la recherche "{searchQuery}".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredSymbols.map((item) => {
                const isSelected =
                  selectedSymbol === item.symbol ||
                  (selectedSymbol === "EURUSD" && item.symbol === "frxEURUSD") ||
                  (selectedSymbol === "GBPUSD" && item.symbol === "frxGBPUSD") ||
                  (selectedSymbol === "XAUUSD" && item.symbol === "frxXAUUSD") ||
                  (selectedSymbol === "BTCUSD" && item.symbol === "cryBTCUSD");

                return (
                  <button
                    key={item.symbol}
                    onClick={() => handleSelect(item.symbol)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 group relative overflow-hidden ${
                      isSelected
                        ? "bg-cyan-950/30 border-cyan-500/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                        : "bg-slate-900/40 hover:bg-slate-900 border-slate-800/80 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-cyan-300 group-hover:text-cyan-200">
                        {item.display_name}
                      </span>
                      {isSelected && (
                        <span className="p-1 rounded-full bg-cyan-500 text-slate-950 font-bold">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                        {item.symbol}
                      </span>
                      <span className="text-slate-500 uppercase">
                        {item.submarket_display_name || item.market_display_name || item.market}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>{filteredSymbols.length} actifs Deriv disponibles</span>
          <span className="text-cyan-400 font-bold">Deriv API v3 Active</span>
        </div>
      </div>
    </div>
  );
};
