from typing import List, Dict, Any
from dataclasses import dataclass, asdict

from prudence_engine.config.config import DEFAULT_CONFIG, GlobalConfig
from prudence_engine.engines.market_data import MarketDataEngine, MarketDataBatch
from prudence_engine.engines.market_bias import MarketBiasEngine, BiasResult
from prudence_engine.engines.market_regime import MarketRegimeEngine, RegimeResult
from prudence_engine.engines.institutional_zone import InstitutionalZoneEngine, ZoneAnalysisResult
from prudence_engine.engines.liquidity import LiquidityEngine, LiquidityAnalysisResult
from prudence_engine.engines.price_action import PriceActionEngine, PriceActionResult
from prudence_engine.engines.displacement import DisplacementEngine, DisplacementResult
from prudence_engine.engines.structure import StructureEngine, StructureResult
from prudence_engine.engines.narrative import NarrativeEngine, MarketNarrativeResult
from prudence_engine.engines.scoring import ScoringEngine, ScoringResult
from prudence_engine.engines.experience import ExperienceEngine, ExperienceStats
from prudence_engine.engines.risk import RiskEngine, AccountStatus, RiskCalculationResult
from prudence_engine.engines.execution import ExecutionEngine, ExecutionPayload

@dataclass
class CognitivePipelineResult:
    symbol: str
    timeframe: str
    market_data: MarketDataBatch
    bias: BiasResult
    regime: RegimeResult
    zone_analysis: ZoneAnalysisResult
    liquidity: LiquidityAnalysisResult
    price_action: PriceActionResult
    displacement: DisplacementResult
    structure: StructureResult
    narrative: MarketNarrativeResult
    scoring: ScoringResult
    experience_stats: ExperienceStats
    risk: RiskCalculationResult
    execution: ExecutionPayload

class PrudenceCognitiveEngine:
    """
    PRUDENCE ENGINE V5 - Master Cognitive Orchestrator
    Encapsulates all 14 independent reasoning engines into a unified decision pipeline.
    """
    def __init__(self, global_config: GlobalConfig = None):
        self.config = global_config or DEFAULT_CONFIG
        self.market_data_engine = MarketDataEngine()
        self.bias_engine = MarketBiasEngine()
        self.regime_engine = MarketRegimeEngine()
        self.zone_engine = InstitutionalZoneEngine()
        self.liquidity_engine = LiquidityEngine()
        self.price_action_engine = PriceActionEngine()
        self.displacement_engine = DisplacementEngine()
        self.structure_engine = StructureEngine()
        self.narrative_engine = NarrativeEngine()
        self.scoring_engine = ScoringEngine(weights=self.config.scoring, thresholds=self.config.thresholds)
        self.experience_engine = ExperienceEngine()
        self.risk_engine = RiskEngine(config=self.config.risk)
        self.execution_engine = ExecutionEngine()

    def analyze_market(
        self,
        symbol: str,
        timeframe: str,
        raw_bars: List[Dict[str, Any]],
        account_status: AccountStatus = None,
        layer_count: int = 3
    ) -> CognitivePipelineResult:

        if account_status is None:
            account_status = AccountStatus(
                balance=50000.0,
                equity=50800.0,
                daily_starting_equity=50000.0,
                current_daily_loss=0.0,
                consecutive_losses=0,
                open_positions_count=1
            )

        # 1. Market Data Normalization
        market_data = self.market_data_engine.process(symbol, timeframe, raw_bars)

        # 2. Market Bias Engine
        bias = self.bias_engine.process(market_data)

        # 3. Market Regime Engine
        regime = self.regime_engine.process(market_data)

        # 4. Institutional Zone Engine
        zone_analysis = self.zone_engine.process(market_data)

        # 5. Liquidity Engine
        liquidity = self.liquidity_engine.process(market_data)

        # 6. Price Action Engine
        price_action = self.price_action_engine.process(market_data)

        # 7. Displacement Engine
        displacement = self.displacement_engine.process(market_data)

        # 8. Structure Engine
        structure = self.structure_engine.process(market_data, displacement.quality)

        # 9. Narrative Engine
        narrative = self.narrative_engine.process(
            bias=bias,
            regime=regime,
            zone_analysis=zone_analysis,
            liquidity=liquidity,
            price_action=price_action,
            displacement=displacement,
            structure=structure
        )

        # 10. Experience Engine Stats & Dynamic Confidence Multiplier
        experience_stats = self.experience_engine.compute_stats()
        dynamic_multiplier = experience_stats.recommended_confidence_multiplier

        # 11. Scoring Engine
        scoring = self.scoring_engine.process(
            bias=bias,
            regime=regime,
            zone_analysis=zone_analysis,
            liquidity=liquidity,
            price_action=price_action,
            displacement=displacement,
            structure=structure,
            dynamic_confidence_multiplier=dynamic_multiplier
        )

        # Signal direction determination
        signal_direction = bias.direction.value if bias.direction.value != "NEUTRAL" else "BUY"

        # Determine reference entry, SL, TP for Risk Engine
        entry_price = market_data.last_close
        if signal_direction == "BUY":
            active_z = zone_analysis.active_demand_zone
            sl_price = active_z.low if active_z else entry_price - (market_data.indicators.atr14 * 1.5)
            tp_price = entry_price + (abs(entry_price - sl_price) * self.config.risk.default_reward_ratio)
        else:
            active_z = zone_analysis.active_supply_zone
            sl_price = active_z.high if active_z else entry_price + (market_data.indicators.atr14 * 1.5)
            tp_price = entry_price - (abs(sl_price - entry_price) * self.config.risk.default_reward_ratio)

        # 12. Risk Engine
        risk_result = self.risk_engine.process(
            account=account_status,
            entry_price=entry_price,
            stop_loss_price=sl_price,
            take_profit_price=tp_price,
            signal_direction=signal_direction,
            symbol=symbol
        )

        # 13 & 14. Execution Engine & Layering
        execution = self.execution_engine.process(
            symbol=symbol,
            timeframe=timeframe,
            scoring=scoring,
            narrative=narrative,
            zone_analysis=zone_analysis,
            risk_result=risk_result,
            signal_direction=signal_direction,
            layer_count=layer_count
        )

        return CognitivePipelineResult(
            symbol=symbol,
            timeframe=timeframe,
            market_data=market_data,
            bias=bias,
            regime=regime,
            zone_analysis=zone_analysis,
            liquidity=liquidity,
            price_action=price_action,
            displacement=displacement,
            structure=structure,
            narrative=narrative,
            scoring=scoring,
            experience_stats=experience_stats,
            risk=risk_result,
            execution=execution
        )
