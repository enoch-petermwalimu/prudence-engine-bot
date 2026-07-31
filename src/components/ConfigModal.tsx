import React, { useState } from "react";
import { Settings, Shield, Cpu, Database, Server, Check, X, Sliders, Lock } from "lucide-react";
import { EngineConfig } from "../types";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: EngineConfig;
  onSave: (newConfig: EngineConfig) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [formData, setFormData] = useState<EngineConfig>(config);
  const [activeTab, setActiveTab] = useState<"datasource" | "mt5" | "risk" | "cognitive">("datasource");
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleChange = (key: keyof EngineConfig, val: any) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">
                Panneau de Configuration Prudence V5
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Paramètres Système • Flux Données Réelles • Pont EA MT5 • Gestion du Risque
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Category Tabs */}
        <div className="flex items-center bg-slate-950 border-b border-slate-800/80 px-6 pt-2 gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab("datasource")}
            className={`px-4 py-2.5 font-bold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === "datasource"
                ? "border-cyan-400 text-cyan-300 bg-slate-900/50"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            1. Flux Données
          </button>
          <button
            onClick={() => setActiveTab("mt5")}
            className={`px-4 py-2.5 font-bold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === "mt5"
                ? "border-cyan-400 text-cyan-300 bg-slate-900/50"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            2. Pont MT5 & EA
          </button>
          <button
            onClick={() => setActiveTab("risk")}
            className={`px-4 py-2.5 font-bold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === "risk"
                ? "border-cyan-400 text-cyan-300 bg-slate-900/50"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            3. Règles de Risque
          </button>
          <button
            onClick={() => setActiveTab("cognitive")}
            className={`px-4 py-2.5 font-bold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === "cognitive"
                ? "border-cyan-400 text-cyan-300 bg-slate-900/50"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            4. Seuil & Pipeline
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs font-mono">
          {activeTab === "datasource" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                <span className="font-bold uppercase tracking-wider block mb-1">
                  ✓ FLUX DE DONNÉES TEMPS RÉEL ACTIF
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Prudence Engine connects directly to live exchange feeds (Binance for Crypto, Yahoo Finance & Global FX feeds for Forex/Gold). Zero mock or synthetic data used when requested.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Fournisseur de Flux de Données Principal</label>
                <select
                  value={formData.data_source}
                  onChange={(e) => handleChange("data_source", e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                >
                  <option value="DERIV_API">Deriv WebSocket API (Indices Synthétiques, Volatility, Boom/Crash & Forex)</option>
                  <option value="LIVE_API">Live Financial API Feed (Yahoo Finance / Binance API - Real Time)</option>
                  <option value="MT5_BRIDGE">MetaTrader 5 Direct REST Gateway (Terminal Sync)</option>
                  <option value="TWELVE_DATA">TwelveData Real-time FX Endpoint</option>
                  <option value="ALPHA_VANTAGE">AlphaVantage Institutional Feed</option>
                </select>
              </div>

              {formData.data_source === "DERIV_API" && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
                  <span className="text-cyan-300 font-bold uppercase text-[11px] tracking-wider block flex items-center gap-1.5">
                    ⚡ Paramètres Deriv API Direct Connection
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Deriv App ID (Public: 1089)</label>
                      <input
                        type="text"
                        value={formData.deriv_app_id || "1089"}
                        onChange={(e) => handleChange("deriv_app_id", e.target.value)}
                        placeholder="1089"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Clé API Deriv / Token (Optionnel)</label>
                      <input
                        type="password"
                        value={formData.deriv_api_token || ""}
                        onChange={(e) => handleChange("deriv_api_token", e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Supported Live Tickers</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                    <span className="text-cyan-300 font-bold block">EURUSD</span>
                    <span className="text-[10px] text-slate-500">Live Forex Spot</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                    <span className="text-cyan-300 font-bold block">XAUUSD</span>
                    <span className="text-[10px] text-slate-500">Gold Spot (GC=F)</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                    <span className="text-cyan-300 font-bold block">GBPUSD</span>
                    <span className="text-[10px] text-slate-500">Live Cable Spot</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300">
                    <span className="text-cyan-300 font-bold block">BTCUSD</span>
                    <span className="text-[10px] text-slate-500">Binance BTCUSDT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "mt5" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-bold block">Activer la sortie Auto-Trading EA</span>
                  <span className="text-[10px] text-slate-400">Génère le payload JSON MT5 structuré pour l'exécution par l'EA</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.auto_trading_enabled}
                  onChange={(e) => handleChange("auto_trading_enabled", e.target.checked)}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">URL de la Passerelle MT5 REST Bridge</label>
                <input
                  type="text"
                  value={formData.mt5_bridge_url}
                  onChange={(e) => handleChange("mt5_bridge_url", e.target.value)}
                  placeholder="http://localhost:8080 or https://mt5.yourserver.com/api"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">ID / Magic Number Compte MT5</label>
                  <input
                    type="text"
                    value={formData.mt5_account_id}
                    onChange={(e) => handleChange("mt5_account_id", e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Token de Sécurité / Clé API</label>
                  <input
                    type="password"
                    value={formData.mt5_api_key}
                    onChange={(e) => handleChange("mt5_api_key", e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
                <span className="text-cyan-300 font-bold block">🔒 Règle de Sécurité Institutionnelle</span>
                <p>
                  Le moteur cognitif ne passe JAMAIS d'ordres directement sur le marché sans votre accord. Il génère un payload JSON haute probabilité transmis à votre Expert Advisor MetaTrader 5.
                </p>
              </div>
            </div>
          )}

          {activeTab === "risk" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Risque par Trade (% Capital)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.risk_percent_per_trade}
                    onChange={(e) => handleChange("risk_percent_per_trade", parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500">Allocation institutionnelle standard : 1.0%</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Perte Maximale Journalière (% Capital)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.max_daily_loss_percent}
                    onChange={(e) => handleChange("max_daily_loss_percent", parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-rose-400 font-bold focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500">Seuil Coupe-Circuit Strict : 5.0%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Nombre Max d'Ordres Fractionnés</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.max_open_layers}
                    onChange={(e) => handleChange("max_open_layers", parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Ratio R:R Minimum Exigé</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.min_rr_ratio}
                    onChange={(e) => handleChange("min_rr_ratio", parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "cognitive" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Seuil de Validation Score (Échelle 15 Pts)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.scoring_threshold}
                    onChange={(e) => handleChange("scoring_threshold", parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500">Les setups en dessous du seuil sont rejetés</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Pourcentage de Confiance Minimum (%)</label>
                  <input
                    type="number"
                    value={formData.min_confidence_percent}
                    onChange={(e) => handleChange("min_confidence_percent", parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Périodes d'Alignement EMA (Rapide / Moyenne / Lente)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={formData.ema_fast}
                    onChange={(e) => handleChange("ema_fast", parseInt(e.target.value))}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-center"
                  />
                  <input
                    type="number"
                    value={formData.ema_med}
                    onChange={(e) => handleChange("ema_med", parseInt(e.target.value))}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-center"
                  />
                  <input
                    type="number"
                    value={formData.ema_slow}
                    onChange={(e) => handleChange("ema_slow", parseInt(e.target.value))}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-center"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">
              Paramètres conservés en mémoire et runtime actif
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-cyan-500/20"
              >
                {isSaved ? <Check className="w-4 h-4" /> : null}
                {isSaved ? "Enregistré avec Succès !" : "Sauvegarder les Configurations"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
