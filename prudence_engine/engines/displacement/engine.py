from .models import DisplacementQuality, DisplacementResult
from prudence_engine.engines.market_data.models import MarketDataBatch

class DisplacementEngine:
    """
    Engine 7: Displacement Engine
    Measures impulse quality, body ratio, ATR expansion, and momentum speed.
    """
    def process(self, data: MarketDataBatch) -> DisplacementResult:
        if not data or not data.bars or len(data.bars) < 2:
            return DisplacementResult(
                quality=DisplacementQuality.WEAK,
                body_ratio=0.5,
                atr_expansion_multiplier=1.0,
                impulse_momentum=0.0,
                description="Insufficient data for displacement analysis."
            )

        curr = data.bars[-1]
        c_range = curr.high - curr.low if curr.high > curr.low else 0.0001
        c_body = abs(curr.close - curr.open)
        body_ratio = c_body / c_range

        atr = data.indicators.atr14 if (data.indicators and data.indicators.atr14 > 0) else 0.0010
        atr_expansion = c_range / atr

        recent_range_avg = sum(b.high - b.low for b in data.bars[-5:]) / 5.0
        impulse_momentum = c_range / recent_range_avg if recent_range_avg > 0 else 1.0

        if body_ratio >= 0.75 and atr_expansion >= 1.8:
            quality = DisplacementQuality.INSTITUTIONAL
            desc = f"Institutional grade displacement! High body ratio ({round(body_ratio*100)}%) with {round(atr_expansion,1)}x ATR expansion."
        elif body_ratio >= 0.65 and atr_expansion >= 1.3:
            quality = DisplacementQuality.STRONG
            desc = f"Strong displacement impulse with clean body ratio ({round(body_ratio*100)}%)."
        elif body_ratio >= 0.50 and atr_expansion >= 1.0:
            quality = DisplacementQuality.MEDIUM
            desc = f"Moderate price move with average body proportion."
        else:
            quality = DisplacementQuality.WEAK
            desc = f"Weak low-momentum candle lacking institutional displacement."

        return DisplacementResult(
            quality=quality,
            body_ratio=round(body_ratio, 2),
            atr_expansion_multiplier=round(atr_expansion, 2),
            impulse_momentum=round(impulse_momentum, 2),
            description=desc
        )
