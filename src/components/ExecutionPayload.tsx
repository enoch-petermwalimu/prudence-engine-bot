import React, { useState } from "react";
import { ExecutionData, RiskData } from "../types";
import { Code, Copy, Check, Send, Layers, ShieldCheck } from "lucide-react";

interface ExecutionPayloadProps {
  execution: ExecutionData | null;
  risk: RiskData | null;
}

export const ExecutionPayload: React.FC<ExecutionPayloadProps> = ({ execution, risk }) => {
  const [copied, setCopied] = useState(false);

  if (!execution) return null;

  const jsonString = JSON.stringify(execution, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded uppercase font-mono">
            Payload d'Exécution MT5
          </span>
          <span className="text-[10px] text-slate-500 font-mono">MT5 EA BRIDGE READY</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-mono font-semibold rounded-lg border border-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "COPIÉ" : "COPIER JSON"}
          </button>
        </div>
      </div>

      {/* Signal Status Summary Banner */}
      <div
        className={`p-5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          execution.signal === "BUY"
            ? "bg-cyan-950/20 border-cyan-500/30 text-cyan-300"
            : execution.signal === "SELL"
            ? "bg-rose-950/20 border-rose-500/30 text-rose-300"
            : "bg-slate-950 border-slate-800 text-slate-300"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl font-mono border ${
              execution.signal === "BUY"
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : execution.signal === "SELL"
                ? "bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            {execution.signal}
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Signal de Trad & Direction</div>
            <div className="text-lg font-bold text-white font-mono">
              {execution.signal} {execution.symbol} ({execution.timeframe})
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed mt-0.5">{execution.reason}</p>
          </div>
        </div>

        <div className="text-right font-mono flex flex-col items-end gap-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Prix d'Entrée Moyen</span>
          <span className="text-xl font-black text-white">{execution.average_entry}</span>
          <div className="text-xs flex items-center gap-2 font-bold mt-0.5">
            <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">SL: {execution.sl}</span>
            <span className="text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">TP: {execution.tp}</span>
          </div>
        </div>
      </div>

      {/* Multi-Layering Breakdown */}
      {execution.layers && execution.layers.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            Fractionnement des Ordres ({execution.layer_count} Ordres)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {execution.layers.map((layer) => (
              <div key={layer.layer_id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-1.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300">Ordre #{layer.layer_id}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] border border-slate-800">
                    {layer.entry_type}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Prix:</span>
                  <strong className="text-white">{layer.price}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Volume:</span>
                  <strong className="text-cyan-300">{layer.lot_size} Lots ({layer.allocation_percent}%)</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JSON Payload Code Viewer */}
      <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
        <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>payload_output.json</span>
          <span className="text-cyan-300 text-[11px]">Protocole Strict: EA Exécute les Ordres</span>
        </div>
        <pre className="p-4 text-xs font-mono text-cyan-300 overflow-x-auto max-h-56">
          <code>{jsonString}</code>
        </pre>
      </div>
    </div>
  );
};
