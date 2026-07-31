import React from "react";
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, ReferenceArea, ReferenceLine } from "recharts";
import { OHLCBar, CognitiveAnalysisResult } from "../types";
import { TrendingUp, ShieldAlert, Award, Layers, Target } from "lucide-react";

interface MarketCanvasProps {
  bars: OHLCBar[];
  analysis: CognitiveAnalysisResult | null;
}

export const MarketCanvas: React.FC<MarketCanvasProps> = ({ bars, analysis }) => {
  if (!bars || bars.length === 0) return null;

  const chartData = bars.map((b, idx) => {
    return {
      time: b.timestamp.split(" ")[1] || `${idx}`,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
      price: b.close,
      ema20: b.close * 0.9995,
      ema60: b.close * 0.9985,
      ema200: b.close * 0.9970,
    };
  });

  const minPrice = Math.min(...bars.map((b) => b.low));
  const maxPrice = Math.max(...bars.map((b) => b.high));
  const range = maxPrice - minPrice || 0.001;
  const equilibrium = (maxPrice + minPrice) / 2;

  const demandZoneLow = analysis?.execution.entry_zone.low || minPrice + range * 0.1;
  const demandZoneHigh = analysis?.execution.entry_zone.high || minPrice + range * 0.25;

  const slLevel = analysis?.execution.sl;
  const tpLevel = analysis?.execution.tp;
  const avgEntry = analysis?.execution.average_entry;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
      {/* Chart Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold font-mono text-white">{analysis?.symbol || "EURUSD"}</span>
            <span className="text-[10px] font-mono font-bold bg-slate-900 text-cyan-400 border border-slate-800 px-2 py-0.5 rounded">
              {analysis?.timeframe || "M15"}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-800"></div>
          {analysis && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-500 uppercase">Valorisation:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[10px] border ${
                  analysis.zone_valuation.valuation === "DISCOUNT"
                    ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                    : analysis.zone_valuation.valuation === "PREMIUM"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
              >
                {analysis.zone_valuation.valuation === "DISCOUNT" ? "ZONAGE DÉCOUTE" : analysis.zone_valuation.valuation} ({analysis.zone_valuation.discount_level}%)
              </span>
            </div>
          )}
        </div>

        {analysis && (
          <div className="flex items-center gap-2 text-[10px] font-mono">
            {analysis.liquidity.has_sweep && (
              <span className="bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1 animate-pulse">
                <ShieldAlert className="w-3 h-3 text-purple-400" />
                BALAYAGE DE LIQUIDITÉ
              </span>
            )}
            {analysis.structure.event_type !== "NONE" && (
              <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-cyan-400" />
                {analysis.structure.event_type} ({analysis.structure.direction})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Candlestick & Market Structure Canvas */}
      <div className="h-72 w-full relative pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10, fontFamily: "monospace" }} axisLine={{ stroke: "#1e293b" }} />
            <YAxis
              domain={[minPrice - range * 0.05, maxPrice + range * 0.05]}
              stroke="#475569"
              tick={{ fontSize: 10, fontFamily: "monospace" }}
              orientation="right"
              axisLine={{ stroke: "#1e293b" }}
              tickFormatter={(v) => v.toFixed(4)}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#05070a", borderColor: "#1e293b", borderRadius: "8px", color: "#f8fafc", fontFamily: "monospace" }}
              formatter={(value: any) => [typeof value === "number" ? value.toFixed(5) : value, ""]}
            />

            {/* Premium vs Discount Shade Areas */}
            {React.createElement(ReferenceArea as any, {
              y1: equilibrium,
              y2: maxPrice + range * 0.05,
              fill: "#ef4444",
              fillOpacity: 0.03,
              label: { value: "ZONE PREMIUM", fill: "#f87171", fontSize: 9, position: "insideTopLeft" }
            })}
            {React.createElement(ReferenceArea as any, {
              y1: minPrice - range * 0.05,
              y2: equilibrium,
              fill: "#06b6d4",
              fillOpacity: 0.03,
              label: { value: "ZONE DÉCOINTE", fill: "#22d3ee", fontSize: 9, position: "insideBottomLeft" }
            })}

            {/* Demand / Supply Institutional Order Vault */}
            {React.createElement(ReferenceArea as any, {
              y1: demandZoneLow,
              y2: demandZoneHigh,
              fill: "#06b6d4",
              fillOpacity: 0.12,
              stroke: "#06b6d4",
              strokeDasharray: "3 3",
              label: { value: "VAULT INSTITUTIONNEL", fill: "#22d3ee", fontSize: 9, position: "insideRight" }
            })}

            {/* Stop Loss & Take Profit Execution Lines */}
            {slLevel && (
              <ReferenceLine
                y={slLevel}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                label={{ value: `SL: ${slLevel.toFixed(4)}`, fill: "#fb7185", fontSize: 10, position: "right" }}
              />
            )}
            {tpLevel && (
              <ReferenceLine
                y={tpLevel}
                stroke="#06b6d4"
                strokeDasharray="4 4"
                label={{ value: `TP: ${tpLevel.toFixed(4)}`, fill: "#22d3ee", fontSize: 10, position: "right" }}
              />
            )}
            {avgEntry && (
              <ReferenceLine
                y={avgEntry}
                stroke="#06b6d4"
                strokeWidth={2}
                label={{ value: `ENTRÉE MOY: ${avgEntry.toFixed(4)}`, fill: "#22d3ee", fontSize: 10, position: "right" }}
              />
            )}

            {/* Close Price Line */}
            <Line type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Canvas Footnote Indicators */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Zone Décote (&lt;50%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Zone Premium (&gt;50%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Vault Demand Institutionnel
          </span>
        </div>

        {analysis && (
          <div className="flex items-center gap-3 text-[11px]">
            <span>Ratio R:R : <strong className="text-white">{analysis.risk.rr_ratio}x</strong></span>
            <span>Lot Recommandé : <strong className="text-cyan-400">{analysis.risk.calculated_lot_size} Lots</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};
