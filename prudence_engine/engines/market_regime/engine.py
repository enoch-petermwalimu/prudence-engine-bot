from .models import RegimeType, RegimeResult
from prudence_engine.engines.market_data.models import MarketDataBatch

class MarketRegimeEngine:
    """
    Engine 3: Market Regime Engine
    Detects market conditions: TREND, RANGE, EXPANSION, or CONSOLIDATION.
    """
    def process(self, data: MarketDataBatch) -> RegimeResult:
        if not data or not data.bars or len(data.bars) < 14:
            return RegimeResult(
                regime=RegimeType.CONSOLIDATION,
                volatility_ratio=1.0,
                description="Insufficient historical bars for regime classification."
            )

        atr = data.indicators.atr14 if data.indicators else 0.0010
        recent_bars = data.bars[-14:]
        avg_recent_range = sum(b.high - b.low for b in recent_bars) / len(recent_bars)

        volatility_ratio = avg_recent_range / atr if atr > 0 else 1.0

        # Measure net price displacement over 14 bars
        price_displacement = abs(data.bars[-1].close - data.bars[-14].open)
        total_movement = sum(abs(data.bars[i].close - data.bars[i-1].close) for i in range(-13, 0))
        efficiency_ratio = price_displacement / total_movement if total_movement > 0 else 0.0

        if volatility_ratio > 1.45:
            regime = RegimeType.EXPANSION
            desc = "High volatility expansion phase with enlarged candle ranges."
        elif efficiency_ratio > 0.48:
            regime = RegimeType.TREND
            desc = "Directional trend regime with high directional price efficiency."
        elif volatility_ratio < 0.75:
            regime = RegimeType.CONSOLIDATION
            desc = "Low volatility compressed consolidation range."
        else:
            regime = RegimeType.RANGE
            desc = "Stationary range-bound sideways market condition."

        return RegimeResult(
            regime=regime,
            volatility_ratio=round(volatility_ratio, 2),
            description=desc
        )
