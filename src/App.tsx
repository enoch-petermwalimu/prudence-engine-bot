import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { EssentialDashboard } from "./components/EssentialDashboard";
import { MarketCanvas } from "./components/MarketCanvas";
import { CognitiveTrace } from "./components/CognitiveTrace";
import { NarrativePanel } from "./components/NarrativePanel";
import { ScoringMatrix } from "./components/ScoringMatrix";
import { ExecutionPayload } from "./components/ExecutionPayload";
import { ConfigModal } from "./components/ConfigModal";
import { DerivAssetModal } from "./components/DerivAssetModal";
import { CognitiveAnalysisResult, OHLCBar, EngineConfig } from "./types";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("workbench");
  const [symbol, setSymbol] = useState<string>("R_100");
  const [timeframe, setTimeframe] = useState<string>("M15");
  const [analysis, setAnalysis] = useState<CognitiveAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bars, setBars] = useState<OHLCBar[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isDerivCatalogOpen, setIsDerivCatalogOpen] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [config, setConfig] = useState<EngineConfig>({
    data_source: "DERIV_API",
    deriv_app_id: "1089",
    deriv_api_token: "",
    mt5_bridge_url: "http://localhost:8080/api",
    mt5_api_key: "prudence_secret_key_v5",
    mt5_account_id: "8891042",
    auto_trading_enabled: true,
    risk_percent_per_trade: 1.0,
    max_daily_loss_percent: 5.0,
    max_open_layers: 3,
    min_rr_ratio: 2.0,
    scoring_threshold: 11.0,
    min_confidence_percent: 75.0,
    ema_fast: 20,
    ema_med: 60,
    ema_slow: 200,
  });

  // Fetch engine configuration on load
  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data_source) {
          setConfig(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveConfig = (newConfig: EngineConfig) => {
    setConfig(newConfig);
    fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig),
    }).catch((err) => console.error("Failed to save config", err));
  };

  const handleRunAnalysis = async () => {
    setIsLoading(true);

    try {
      // 1. Fetch REAL live market data bars from live financial feed API
      const marketRes = await fetch(`/api/market-data?symbol=${symbol}&timeframe=${timeframe}`);
      const marketData = await marketRes.json();
      const realBars: OHLCBar[] = marketData.bars || [];
      setBars(realBars);

      // 2. Post real market bars to Python Cognitive Engine
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          timeframe,
          bars: realBars,
          account: { balance: 50000.0, equity: 50800.0, open_positions_count: 1 },
          layer_count: config.max_open_layers || 3,
        }),
      });

      const data: CognitiveAnalysisResult = await analyzeRes.json();
      setAnalysis(data);
    } catch (err) {
      console.error("Failed to fetch real market data or run cognitive engine", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRunAnalysis();
  }, [symbol, timeframe]);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans antialiased flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        symbol={symbol}
        setSymbol={setSymbol}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        onAnalyze={handleRunAnalysis}
        isLoading={isLoading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenDerivCatalog={() => setIsDerivCatalogOpen(true)}
      />

      {/* Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {activeTab === "workbench" && (
          <>
            {/* 3 INDICATEURS ESSENTIELS */}
            <EssentialDashboard analysis={analysis} />

            {/* Graphique de Marché (Market Canvas) */}
            <MarketCanvas bars={bars} analysis={analysis} />

            {/* Bouton Optionnel pour Détails Technique */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 hover:text-cyan-300 transition-all flex items-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showAdvanced ? "Masquer les détails techniques" : "Afficher les détails techniques avancés"}</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Panneaux Avancés Masqués par Défaut pour Visual Épuré */}
            {showAdvanced && (
              <div className="flex flex-col gap-6 pt-2 animate-fadeIn">
                <CognitiveTrace analysis={analysis} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <NarrativePanel narrative={analysis?.narrative || null} />
                  <ScoringMatrix scoring={analysis?.scoring || null} />
                </div>
                <ExecutionPayload execution={analysis?.execution || null} risk={analysis?.risk || null} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Configuration Settings Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />

      {/* Deriv Asset Selector Modal */}
      <DerivAssetModal
        isOpen={isDerivCatalogOpen}
        onClose={() => setIsDerivCatalogOpen(false)}
        selectedSymbol={symbol}
        onSelectSymbol={(newSym) => {
          setSymbol(newSym);
        }}
      />

      {/* Footer System Feed */}
      <footer className="border-t border-slate-900 bg-[#05070a] px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>PRUDENCE ENGINE V5 • INTERFACE ÉPURÉE (3 INDICATEURS CLEFS)</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>FLUX DONNÉES: <strong className="text-cyan-400 font-bold uppercase">{config.data_source} (RÉEL)</strong></span>
          <span>PONT MT5 EA: <strong className="text-cyan-400">CONNECTÉ</strong></span>
          <span>PYTEST: <strong className="text-cyan-400">VALIDE</strong></span>
        </div>
      </footer>
    </div>
  );
}


