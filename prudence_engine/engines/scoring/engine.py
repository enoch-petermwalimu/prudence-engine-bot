from .models import ScoreClassification, ScoreBreakdown, ScoringResult
from prudence_engine.config.config import ScoringWeightsConfig, ThresholdsConfig
from prudence_engine.engines.market_bias.models import BiasResult, BiasDirection
from prudence_engine.engines.market_regime.models import RegimeResult, RegimeType
from prudence_engine.engines.institutional_zone.models import ZoneAnalysisResult
from prudence_engine.engines.liquidity.models import LiquidityAnalysisResult
from prudence_engine.engines.price_action.models import PriceActionResult, PatternType
from prudence_engine.engines.displacement.models import DisplacementResult, DisplacementQuality
from prudence_engine.engines.structure.models import StructureResult, StructureEventType

class ScoringEngine:
    """
    Engine 10: Scoring Engine
    Calculates weighted modular points (0 to 15 max) and classifies opportunity setup quality.
    """
    def __init__(self, weights: ScoringWeightsConfig = None, thresholds: ThresholdsConfig = None):
        self.weights = weights or ScoringWeightsConfig()
        self.thresholds = thresholds or ThresholdsConfig()

    def process(
        self,
        bias: BiasResult,
        regime: RegimeResult,
        zone_analysis: ZoneAnalysisResult,
        liquidity: LiquidityAnalysisResult,
        price_action: PriceActionResult,
        displacement: DisplacementResult,
        structure: StructureResult,
        dynamic_confidence_multiplier: float = 1.0
    ) -> ScoringResult:

        # 1. Bias Points (max 2.0)
        if bias.direction in (BiasDirection.BUY, BiasDirection.SELL):
            bias_pts = (bias.confidence / 100.0) * self.weights.bias
        else:
            bias_pts = 0.5

        # 2. Regime Points (max 2.0)
        if regime.regime in (RegimeType.TREND, RegimeType.EXPANSION):
            regime_pts = self.weights.regime
        elif regime.regime == RegimeType.RANGE:
            regime_pts = 1.0
        else:
            regime_pts = 0.5

        # 3. Institutional Zone Points (max 2.0)
        val = zone_analysis.current_valuation
        if (bias.direction == BiasDirection.BUY and val == "DISCOUNT") or \
           (bias.direction == BiasDirection.SELL and val == "PREMIUM"):
            zone_pts = self.weights.zone
        elif val == "EQUILIBRIUM":
            zone_pts = 1.0
        else:
            zone_pts = 0.4

        # 4. Liquidity Points (max 2.0)
        if liquidity.has_sweep and liquidity.active_sweep:
            sweep = liquidity.active_sweep
            if (bias.direction == BiasDirection.BUY and sweep.direction.value == "BULLISH_SWEEP") or \
               (bias.direction == BiasDirection.SELL and sweep.direction.value == "BEARISH_SWEEP"):
                liquidity_pts = self.weights.liquidity
            else:
                liquidity_pts = 1.2
        else:
            liquidity_pts = 0.5

        # 5. Price Action Points (max 2.0)
        pa_strength = price_action.primary_pattern.strength  # 1-10
        pa_pts = (pa_strength / 10.0) * self.weights.price_action

        # 6. Displacement Points (max 2.0)
        dq = displacement.quality
        if dq == DisplacementQuality.INSTITUTIONAL:
            disp_pts = self.weights.displacement
        elif dq == DisplacementQuality.STRONG:
            disp_pts = 1.6
        elif dq == DisplacementQuality.MEDIUM:
            disp_pts = 1.0
        else:
            disp_pts = 0.4

        # 7. Structure Points (max 3.0)
        st_event = structure.event_type
        if st_event == StructureEventType.MSS:
            struct_pts = self.weights.structure
        elif st_event == StructureEventType.BOS:
            struct_pts = 2.2
        elif st_event == StructureEventType.CHOCH:
            struct_pts = 1.5
        else:
            struct_pts = 0.5

        raw_total = (bias_pts + regime_pts + zone_pts + liquidity_pts + pa_pts + disp_pts + struct_pts)

        # Apply Experience Engine dynamic confidence multiplier
        adjusted_score = min(raw_total * dynamic_confidence_multiplier, 15.0)

        if adjusted_score >= self.thresholds.excellent_min_score:
            classification = ScoreClassification.EXCELLENT
        elif adjusted_score >= self.thresholds.medium_min_score:
            classification = ScoreClassification.MEDIUM
        else:
            classification = ScoreClassification.IGNORE

        conf_pct = round((adjusted_score / 15.0) * 100.0, 1)

        breakdown = ScoreBreakdown(
            bias_points=round(bias_pts, 2),
            regime_points=round(regime_pts, 2),
            zone_points=round(zone_pts, 2),
            liquidity_points=round(liquidity_pts, 2),
            price_action_points=round(pa_pts, 2),
            displacement_points=round(disp_pts, 2),
            structure_points=round(struct_pts, 2)
        )

        details = {
            "raw_score": f"{round(raw_total, 2)} / 15.0",
            "multiplier": f"{round(dynamic_confidence_multiplier, 2)}x",
            "adjusted_score": f"{round(adjusted_score, 2)} / 15.0",
            "threshold_tier": classification.value
        }

        return ScoringResult(
            total_score=round(adjusted_score, 2),
            max_score=15.0,
            classification=classification,
            confidence_percentage=conf_pct,
            breakdown=breakdown,
            details=details
        )
