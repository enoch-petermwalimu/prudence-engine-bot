from .models import CognitiveQuestionAnswers, MarketNarrativeResult
from prudence_engine.engines.market_bias.models import BiasResult, BiasDirection
from prudence_engine.engines.market_regime.models import RegimeResult
from prudence_engine.engines.institutional_zone.models import ZoneAnalysisResult
from prudence_engine.engines.liquidity.models import LiquidityAnalysisResult, SweepDirection
from prudence_engine.engines.price_action.models import PriceActionResult
from prudence_engine.engines.displacement.models import DisplacementResult
from prudence_engine.engines.structure.models import StructureResult

class NarrativeEngine:
    """
    Engine 9: Narrative Engine
    Synthesizes outputs from all upstream engines into a unified institutional narrative.
    """
    def process(
        self,
        bias: BiasResult,
        regime: RegimeResult,
        zone_analysis: ZoneAnalysisResult,
        liquidity: LiquidityAnalysisResult,
        price_action: PriceActionResult,
        displacement: DisplacementResult,
        structure: StructureResult
    ) -> MarketNarrativeResult:

        # 1. Who controls the market?
        if bias.direction == BiasDirection.BUY:
            who_controls = f"Institutional Buyers in control ({bias.confidence}% bias confidence; {bias.ema_alignment})."
        elif bias.direction == BiasDirection.SELL:
            who_controls = f"Institutional Sellers in control ({bias.confidence}% bias confidence; {bias.ema_alignment})."
        else:
            who_controls = "Market in balanced equilibrium / neutral consolidation with no clear dominant party."

        # 2. Why is price here?
        val = zone_analysis.current_valuation
        disc = zone_analysis.discount_level
        if val == "DISCOUNT":
            why_here = f"Price re-traced into an Institutional DISCOUNT area ({disc}% of current swing range) seeking sell-side liquidity."
        elif val == "PREMIUM":
            why_here = f"Price expanded into an Institutional PREMIUM area ({disc}% of current swing range) rebalancing buy-side inefficiency."
        else:
            why_here = f"Price is rotating near EQUILIBRIUM median level ({disc}% of current swing range)."

        # 3. What liquidity has been taken?
        if liquidity.has_sweep and liquidity.active_sweep:
            sw = liquidity.active_sweep
            liq_taken = f"{sw.event_type.value} swept at level {sw.swept_level} ({sw.direction.value})."
        else:
            liq_taken = f"No major liquidity sweep detected on trigger candle; BSL at {liquidity.bsl_level}, SSL at {liquidity.ssl_level} intact."

        # 4. Is there institutional confirmation?
        disp_quality = displacement.quality.value
        pa_pat = price_action.primary_pattern.pattern_type.value
        if displacement.quality in ("STRONG", "INSTITUTIONAL") or price_action.primary_pattern.strength >= 8.0:
            inst_conf = f"YES. Confirmed by {disp_quality} displacement ({displacement.atr_expansion_multiplier}x ATR) and {pa_pat} pattern."
        else:
            inst_conf = f"WEAK/MODERATE. Displacement is {disp_quality} with {pa_pat} pattern."

        # 5. Does the market narrative make sense?
        is_coherent = False
        if bias.direction == BiasDirection.BUY:
            is_coherent = (val == "DISCOUNT") or liquidity.has_sweep or (structure.direction.value == "BULLISH")
        elif bias.direction == BiasDirection.SELL:
            is_coherent = (val == "PREMIUM") or liquidity.has_sweep or (structure.direction.value == "BEARISH")
        else:
            is_coherent = False

        coherence_text = "NARRATIVE COHERENT: Alignment between Market Bias, Institutional Zone valuation, Liquidity Sweep, and Structure Shift." if is_coherent else "NARRATIVE MIXED: Conflicting signals across timeframe structure and zone valuation."

        # 6. What is the confidence level?
        conf_str = "HIGH CONFIDENCE" if is_coherent and displacement.quality != "WEAK" else "MEDIUM/LOW CONFIDENCE"

        # 7. Should we execute or wait?
        if is_coherent and (structure.event_type.value in ("MSS", "BOS") or liquidity.has_sweep):
            execution_verdict = f"EXECUTE: High-probability setup aligning {bias.direction.value} bias with structural confirmation."
        else:
            execution_verdict = "WAIT: Narrative incomplete or structural confirmation pending."

        answers = CognitiveQuestionAnswers(
            who_controls_market=who_controls,
            why_price_is_here=why_here,
            liquidity_taken=liq_taken,
            institutional_confirmation=inst_conf,
            narrative_coherence=coherence_text,
            confidence_level=conf_str,
            execution_verdict=execution_verdict
        )

        # Build full story paragraph
        story = (
            f"Market is operating under a {bias.direction.value} bias ({regime.regime.value} regime). "
            f"{why_here} {liq_taken} "
            f"Displacement quality is {disp_quality} with {price_action.primary_pattern.pattern_type.value} price action. "
            f"Structure status: {structure.description} "
            f"Verdict: {execution_verdict}"
        )

        bullets = [
            f"Dominant Bias: {bias.direction.value} ({bias.confidence}%)",
            f"Regime: {regime.regime.value} (Volatility Ratio: {regime.volatility_ratio})",
            f"Zone Valuation: {val} (Discount Level: {disc}%)",
            f"Liquidity Sweep: {liq_taken}",
            f"Price Action: {pa_pat} (Strength: {price_action.primary_pattern.strength}/10)",
            f"Displacement: {disp_quality} ({displacement.atr_expansion_multiplier}x ATR)",
            f"Structure Shift: {structure.event_type.value} ({structure.direction.value})"
        ]

        return MarketNarrativeResult(
            story_summary=story,
            bullet_breakdown=bullets,
            answers=answers,
            is_coherent=is_coherent
        )
