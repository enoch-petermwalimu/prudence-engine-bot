import React, { useState, useEffect } from "react";
import { ActivePosition, AccountSummary, CognitiveAnalysisResult } from "../types";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  XCircle,
  RefreshCw,
  Zap,
  Server,
  DollarSign,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Link,
  ShieldCheck,
  Key,
  LogOut,
  HelpCircle,
  Play
} from "lucide-react";
import { formatPrice } from "../utils/formatters";

interface PositionsPanelProps {
  analysis: CognitiveAnalysisResult | null;
  symbol: string;
}

export const PositionsPanel: React.FC<PositionsPanelProps> = ({ analysis, symbol }) => {
  const [positions, setPositions] = useState<ActivePosition[]>([]);
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState<boolean>(false);

  // Form states for connecting real MetaTrader / Deriv account
  const [connectAccountId, setConnectAccountId] = useState<string>("");
  const [connectApiToken, setConnectApiToken] = useState<string>("");
  const [connectServer, setConnectServer] = useState<string>("Deriv-Server-01");
  const [connectBalance, setConnectBalance] = useState<string>("1000.00");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Form for manual order entry directly into MT5/Deriv
  const [manualType, setManualType] = useState<"BUY" | "SELL">("BUY");
  const [manualLots, setManualLots] = useState<number>(0.5);
  const [manualSl, setManualSl] = useState<string>("");
  const [manualTp, setManualTp] = useState<string>("");

  const fetchPositions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/positions");
      if (res.ok) {
        const data = await res.json();
        setPositions(data.positions || []);
        setAccount(data.account || null);
      }
    } catch (err) {
      // Quietly handle transient network fetch errors
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleConnectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    try {
      const res = await fetch("/api/account/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: connectAccountId,
          api_token: connectApiToken,
          server: connectServer,
          balance: parseFloat(connectBalance) || 1000.00,
          mode: "real"
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        fetchPositions();
        setTimeout(() => setActionMessage(null), 5000);
      }
    } catch (err) {
      console.error("Connection failed", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectDemo = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/account/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "demo" })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage("Compte Démo MetaTrader ($10,000 USD) connecté avec succès !");
        fetchPositions();
        setTimeout(() => setActionMessage(null), 5000);
      }
    } catch (err) {
      console.error("Demo connection failed", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Voulez-vous déconnecter votre compte MetaTrader / Deriv de Prudence V5 ?")) return;
    try {
      const res = await fetch("/api/account/disconnect", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        fetchPositions();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      console.error("Disconnect failed", err);
    }
  };

  const handleClosePosition = async (ticket: string) => {
    try {
      const res = await fetch("/api/positions/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        fetchPositions();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      console.error("Error closing position", err);
    }
  };

  const handleCloseAll = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir fermer TOUTES les positions ouvertes sur votre compte MetaTrader / Deriv ?")) return;
    try {
      const res = await fetch("/api/positions/close-all", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        fetchPositions();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      console.error("Error closing all positions", err);
    }
  };

  const handleExecutePrudenceLayers = async () => {
    if (!analysis || !analysis.execution) return;
    const exec = analysis.execution;

    try {
      setIsLoading(true);
      for (const layer of exec.layers) {
        await fetch("/api/positions/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbol: exec.symbol,
            type: exec.signal,
            lots: layer.lot_size,
            open_price: layer.price,
            sl: exec.sl,
            tp: exec.tp,
            comment: `Prudence V5 Layer ${layer.layer_id} (${layer.entry_type})`
          })
        });
      }
      setActionMessage(`Les ${exec.layers.length} couches de l'analyse Prudence ont été transmises à MetaTrader / Deriv avec succès !`);
      fetchPositions();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err) {
      console.error("Failed to execute layers", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const entryPrice = analysis?.execution?.average_entry || 1.0850;
      const res = await fetch("/api/positions/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          type: manualType,
          lots: manualLots,
          open_price: entryPrice,
          sl: manualSl ? parseFloat(manualSl) : 0,
          tp: manualTp ? parseFloat(manualTp) : 0,
          comment: "Ordre Manuel Prudence V5"
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        setShowNewOrderModal(false);
        fetchPositions();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      console.error("Failed to create manual order", err);
    }
  };

  const isConnected = account && account.connected;

  return (
    <div className="bg-[#0b0e14] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-6 font-sans">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white font-mono flex items-center gap-2 tracking-wide">
              SYNCHRONISATION POSITIONS & COMPTE METATRADER / DERIV
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Connecté ({account.account_id})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Non Connecté
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Suivi en temps réel des ordres actifs, de votre solde et de vos P/L flottants
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isConnected && (
            <>
              <button
                onClick={fetchPositions}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-all cursor-pointer font-mono text-xs flex items-center gap-1.5"
                title="Rafraîchir les positions"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
                <span className="hidden sm:inline">Sync Live</span>
              </button>

              {positions.length > 0 && (
                <button
                  onClick={handleCloseAll}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Tout Fermer ({positions.length})</span>
                </button>
              )}

              <button
                onClick={() => setShowNewOrderModal(true)}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nouvel Ordre</span>
              </button>

              <button
                onClick={handleDisconnect}
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 text-slate-400 hover:text-rose-400 transition-all cursor-pointer font-mono text-xs flex items-center gap-1"
                title="Déconnecter le compte"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* UNCONNECTED STATE: Connection Guide & Login Form */}
      {!isConnected && (
        <div className="flex flex-col gap-6">
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-6 flex flex-col lg:flex-row gap-6">
            {/* Guide Steps */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-cyan-400 font-mono font-black text-sm uppercase tracking-wide">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                Comment connecter votre compte MetaTrader / Deriv ?
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                Afin de visualiser vos positions réelles et votre solde directement dans l'application Prudence V5, suivez les étapes de connexion sécurisée ci-dessous :
              </p>

              <div className="flex flex-col gap-3 font-mono text-xs text-slate-300">
                <div className="flex items-start gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-xs flex-shrink-0">1</span>
                  <div>
                    <strong className="text-white block">Obtenir votre Jeton API Deriv (API Token)</strong>
                    Rendez-vous sur votre compte <strong>Deriv.com</strong> &gt; <em>Paramètres du Compte</em> &gt; <em>API Token</em>. Créez un jeton avec les autorisations <strong>Read</strong> &amp; <strong>Trade</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-xs flex-shrink-0">2</span>
                  <div>
                    <strong className="text-white block">Saisir vos Identifiants MT5 / Deriv</strong>
                    Entrez votre ID de Compte (ex: <code>CR1089245</code> ou <code>MT5-1089245</code>) et votre Jeton API dans le formulaire ci-contre.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-xs flex-shrink-0">3</span>
                  <div>
                    <strong className="text-white block">Acheminement Automatique des Signaux</strong>
                    Chaque signal généré par le moteur Prudence (3 couches d'entrées) pourra être transmis en un clic sur votre compte réel ou démo.
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Form */}
            <div className="w-full lg:w-96 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-extrabold text-white flex items-center gap-2">
                  <Link className="w-4 h-4 text-cyan-400" />
                  Connexion Compte Réel
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>

              <form onSubmit={handleConnectAccount} className="flex flex-col gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">ID Compte (CR / MT5)</label>
                  <input
                    type="text"
                    placeholder="ex: CR1089245 ou MT5-1089245"
                    value={connectAccountId}
                    onChange={(e) => setConnectAccountId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold placeholder:text-slate-600 focus:border-cyan-500/50 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Jeton API (Deriv Token)</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Collez votre Jeton API ici..."
                      value={connectApiToken}
                      onChange={(e) => setConnectApiToken(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-bold placeholder:text-slate-600 focus:border-cyan-500/50 outline-none"
                    />
                    <Key className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Serveur MT5</label>
                    <input
                      type="text"
                      value={connectServer}
                      onChange={(e) => setConnectServer(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Solde ($ USD)</label>
                    <input
                      type="number"
                      step="any"
                      value={connectBalance}
                      onChange={(e) => setConnectBalance(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-emerald-400 font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full mt-2 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-xl cursor-pointer shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Link className="w-4 h-4" />
                  <span>Connecter mon Compte Réel</span>
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase">Ou</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <button
                onClick={handleConnectDemo}
                disabled={isConnecting}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tester en Compte Démo ($10,000 USD)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONNECTED STATE: Account Metrics Bar */}
      {isConnected && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Solde Compte</span>
            <div className="text-lg font-black text-white font-mono flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              {account.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs text-slate-400 font-normal">{account.currency}</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Équité</span>
            <div className="text-lg font-black text-cyan-300 font-mono flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              {account.equity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">P/L Flottant</span>
            <div className={`text-lg font-black font-mono flex items-center gap-1 ${account.floating_profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {account.floating_profit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {account.floating_profit >= 0 ? "+" : ""}
              {account.floating_profit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {account.currency}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Marge Libre</span>
            <div className="text-lg font-black text-slate-200 font-mono">
              ${account.free_margin.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Serveur & Levoyer</span>
            <div className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1 truncate">
              <Server className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="truncate">{account.server}</span>
            </div>
          </div>
        </div>
      )}

      {/* CONNECTED STATE: Signal Execution Bridge Banner */}
      {isConnected && analysis && analysis.execution && (
        <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 text-cyan-300 rounded-lg">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono uppercase">
                  Signal Actuel Prudence : {analysis.execution.signal} {analysis.execution.symbol}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {analysis.execution.layers?.length || 3} Couches Prêtes
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Entrée moyenne : <strong className="text-white">{formatPrice(analysis.execution.average_entry, analysis.execution.symbol)}</strong> | SL : {formatPrice(analysis.execution.sl, analysis.execution.symbol)} | TP : {formatPrice(analysis.execution.tp, analysis.execution.symbol)}
              </p>
            </div>
          </div>

          <button
            onClick={handleExecutePrudenceLayers}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black font-mono text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all self-stretch sm:self-auto justify-center"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Transmettre à MetaTrader ({analysis.execution.layers?.length || 3} Ordres)</span>
          </button>
        </div>
      )}

      {/* CONNECTED STATE: Active Positions Table */}
      {isConnected && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
              Positions Ouvertes ({positions.length})
            </h3>
          </div>

          {positions.length === 0 ? (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-8 h-8 text-slate-600" />
              <p className="text-sm font-mono text-slate-300 font-bold">Aucune position ouverte actuellement sur votre compte</p>
              <p className="text-xs text-slate-500 font-mono max-w-md">
                Les ordres s'afficheront ici automatiquement dès que vous transmettrez un signal du Moteur Prudence ou placerez un ordre manuel ci-dessus.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-800/80 rounded-xl bg-slate-950/50">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <th className="p-3">Ticket</th>
                    <th className="p-3">Actif</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Volume</th>
                    <th className="p-3">Prix Entrée</th>
                    <th className="p-3">Prix Actuel</th>
                    <th className="p-3">SL</th>
                    <th className="p-3">TP</th>
                    <th className="p-3">Profit (USD)</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {positions.map((pos) => {
                    const isBuy = pos.type === "BUY";
                    const isProfit = pos.profit >= 0;

                    return (
                      <tr key={pos.ticket} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 font-bold text-slate-400">#{pos.ticket}</td>
                        <td className="p-3 font-black text-white">{pos.symbol}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isBuy ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" : "bg-rose-500/10 text-rose-300 border-rose-500/30"}`}>
                            {pos.type}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-300">{pos.lots} Lot</td>
                        <td className="p-3 text-slate-200">{formatPrice(pos.open_price, pos.symbol)}</td>
                        <td className="p-3 font-bold text-cyan-300">{formatPrice(pos.current_price, pos.symbol)}</td>
                        <td className="p-3 text-rose-400 font-bold">{pos.sl ? formatPrice(pos.sl, pos.symbol) : "-"}</td>
                        <td className="p-3 text-cyan-400 font-bold">{pos.tp ? formatPrice(pos.tp, pos.symbol) : "-"}</td>
                        <td className="p-3">
                          <span className={`font-black text-sm ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                            {isProfit ? "+" : ""}{pos.profit.toFixed(2)} USD
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleClosePosition(pos.ticket)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold hover:text-white transition-all cursor-pointer text-[11px]"
                          >
                            Fermer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal for Manual Trade Creation */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white font-mono flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cyan-400" />
                Passer un Ordre sur MetaTrader / Deriv
              </h3>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="text-slate-500 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="flex flex-col gap-4 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Actif Sélectionné</label>
                <input
                  type="text"
                  value={symbol}
                  disabled
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Direction</label>
                  <select
                    value={manualType}
                    onChange={(e) => setManualType(e.target.value as "BUY" | "SELL")}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="BUY">BUY (Achat)</option>
                    <option value="SELL">SELL (Vente)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Volume (Lots)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={manualLots}
                    onChange={(e) => setManualLots(parseFloat(e.target.value) || 0.1)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Stop Loss (Optionnel)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="ex: 2830.00"
                    value={manualSl}
                    onChange={(e) => setManualSl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-rose-300 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Take Profit (Optionnel)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="ex: 2885.00"
                    value={manualTp}
                    onChange={(e) => setManualTp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  Exécuter l'Ordre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
