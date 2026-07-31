export interface OHLCBar {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketBiasData {
  direction: "BUY" | "SELL" | "NEUTRAL";
  confidence: number;
  ema_alignment: string;
  reason: string;
}

export interface MarketRegimeData {
  type: "TREND" | "RANGE" | "EXPANSION" | "CONSOLIDATION";
  volatility_ratio: number;
  description: string;
}

export interface InstitutionalZoneItem {
  zone_id: string;
  zone_type: "SUPPLY" | "DEMAND" | "BUY_VAULT" | "SELL_VAULT";
  high: number;
  low: number;
  creation_time: string;
  strength: number;
  freshness: boolean;
  touch_count: number;
  status: "ACTIVE" | "MITIGATED" | "BROKEN";
}

export interface ZoneValuationData {
  valuation: "PREMIUM" | "DISCOUNT" | "EQUILIBRIUM";
  discount_level: number;
  equilibrium_price: number;
  active_zones?: InstitutionalZoneItem[];
}

export interface LiquidityData {
  has_sweep: boolean;
  bsl_level: number;
  ssl_level: number;
  equal_highs: number[];
  equal_lows: number[];
  sweep_details: string;
}

export interface PriceActionData {
  primary_pattern: string;
  strength: number;
  confidence: number;
  description: string;
}

export interface DisplacementData {
  quality: "WEAK" | "MEDIUM" | "STRONG" | "INSTITUTIONAL";
  body_ratio: number;
  atr_multiplier: number;
  description: string;
}

export interface StructureData {
  event_type: "MSS" | "BOS" | "CHOCH" | "NONE";
  direction: "BULLISH" | "BEARISH" | "NEUTRAL";
  broken_level: number;
  description: string;
}

export interface CognitiveQuestionAnswers {
  who_controls_market: string;
  why_price_is_here: string;
  liquidity_taken: string;
  institutional_confirmation: string;
  narrative_coherence: string;
  confidence_level: string;
  execution_verdict: string;
}

export interface NarrativeData {
  story: string;
  is_coherent: boolean;
  answers: CognitiveQuestionAnswers;
}

export interface ScoreBreakdown {
  bias: number;
  regime: number;
  zone: number;
  liquidity: number;
  price_action: number;
  displacement: number;
  structure: number;
}

export interface ScoringData {
  total_score: number;
  max_score: number;
  classification: "IGNORE" | "MEDIUM" | "EXCELLENT";
  confidence_percentage: number;
  breakdown: ScoreBreakdown;
}

export interface ExperienceData {
  total_trades: number;
  win_rate_total: number;
  win_rate_by_session: Record<string, number>;
  win_rate_by_pattern: Record<string, number>;
  win_rate_by_zone: Record<string, number>;
  win_rate_by_structure: Record<string, number>;
  win_rate_by_score_range: Record<string, number>;
  strongest_setup: string;
  weakest_setup: string;
  confidence_multiplier: number;
}

export interface RiskData {
  is_permitted: boolean;
  risk_amount_usd: number;
  calculated_lot_size: number;
  sl_pips: number;
  tp_pips: number;
  rr_ratio: number;
  rejection_reason: string | null;
}

export interface LayerDetail {
  layer_id: number;
  entry_type: "MARKET" | "LIMIT";
  price: number;
  lot_size: number;
  allocation_percent: number;
  stop_loss: number;
  take_profit: number;
}

export interface ExecutionData {
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  score: number;
  symbol: string;
  timeframe: string;
  entry_zone: { low: number; high: number };
  average_entry: number;
  sl: number;
  tp: number;
  risk_reward_ratio: number;
  reason: string;
  layer_count: number;
  layers: LayerDetail[];
}

export interface CognitiveAnalysisResult {
  symbol: string;
  timeframe: string;
  bias: MarketBiasData;
  regime: MarketRegimeData;
  zone_valuation: ZoneValuationData;
  liquidity: LiquidityData;
  price_action: PriceActionData;
  displacement: DisplacementData;
  structure: StructureData;
  narrative: NarrativeData;
  scoring: ScoringData;
  experience: ExperienceData;
  risk: RiskData;
  execution: ExecutionData;
}

export interface DerivSymbol {
  symbol: string;
  display_name: string;
  market: string;
  market_display_name: string;
  submarket: string;
  submarket_display_name: string;
  pip: number;
  is_trading_suspended?: number;
}

export interface EngineConfig {
  data_source: "DERIV_API" | "LIVE_API" | "MT5_BRIDGE" | "TWELVE_DATA" | "ALPHA_VANTAGE";
  deriv_app_id?: string;
  deriv_api_token?: string;
  mt5_bridge_url: string;
  mt5_api_key: string;
  mt5_account_id: string;
  auto_trading_enabled: boolean;
  risk_percent_per_trade: number;
  max_daily_loss_percent: number;
  max_open_layers: number;
  min_rr_ratio: number;
  scoring_threshold: number;
  min_confidence_percent: number;
  ema_fast: number;
  ema_med: number;
  ema_slow: number;
}

