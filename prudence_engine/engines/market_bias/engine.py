from .models import BiasDirection, BiasResult
from prudence_engine.engines.market_data.models import MarketDataBatch

class MarketBiasEngine:
    """
    Engine 2: Market Bias Engine
    Determines dominant market direction using EMA alignment & swing structure.
    """
    def process(self, data: MarketDataBatch) -> BiasResult:
        if not data or not data.indicators or not data.bars:
            return BiasResult(
                direction=BiasDirection.NEUTRAL,
                confidence=50.0,
                ema_alignment="UNAVAILABLE",
                swing_structure="UNAVAILABLE",
                reason="Insufficient market data for bias calculation."
            )

        ind = data.indicators
        last_close = data.last_close
        ema20 = ind.ema20
        ema60 = ind.ema60
        ema200 = ind.ema200

        # Check EMA alignment
        bullish_ema = (ema20 > ema60 > ema200) and (last_close > ema20)
        bearish_ema = (ema20 < ema60 < ema200) and (last_close < ema20)

        # Check Swing structure
        swings_h = ind.swing_highs
        swings_l = ind.swing_lows

        higher_highs = len(swings_h) >= 2 and swings_h[-1] > swings_h[-2]
        higher_lows = len(swings_l) >= 2 and swings_l[-1] > swings_l[-2]

        lower_highs = len(swings_h) >= 2 and swings_h[-1] < swings_h[-2]
        lower_lows = len(swings_l) >= 2 and swings_l[-1] < swings_l[-2]

        bullish_swings = higher_highs and higher_lows
        bearish_swings = lower_highs and lower_lows

        score = 50.0
        reason_parts = []

        if bullish_ema:
            score += 25.0
            ema_str = "BULLISH_STACK (EMA20 > EMA60 > EMA200)"
            reason_parts.append("EMAs stacked bullishly above 200 EMA")
        elif bearish_ema:
            score -= 25.0
            ema_str = "BEARISH_STACK (EMA20 < EMA60 < EMA200)"
            reason_parts.append("EMAs stacked bearishly below 200 EMA")
        else:
            ema_str = "MIXED_EMA"
            if last_close > ema200:
                score += 10.0
                reason_parts.append("Price above 200 EMA")
            else:
                score -= 10.0
                reason_parts.append("Price below 200 EMA")

        if bullish_swings:
            score += 25.0
            swing_str = "HIGHER_HIGHS_HIGHER_LOWS"
            reason_parts.append("Swing structure making HHs and HLs")
        elif bearish_swings:
            score -= 25.0
            swing_str = "LOWER_HIGHS_LOWER_LOWS"
            reason_parts.append("Swing structure making LHs and LLs")
        else:
            swing_str = "CONSOLIDATING_SWINGS"

        if score >= 70.0:
            direction = BiasDirection.BUY
            confidence = min(score, 98.0)
        elif score <= 30.0:
            direction = BiasDirection.SELL
            confidence = min(100.0 - score, 98.0)
        else:
            direction = BiasDirection.NEUTRAL
            confidence = 50.0

        return BiasResult(
            direction=direction,
            confidence=round(confidence, 1),
            ema_alignment=ema_str,
            swing_structure=swing_str,
            reason="; ".join(reason_parts) if reason_parts else "Market in neutral consolidation."
        )
