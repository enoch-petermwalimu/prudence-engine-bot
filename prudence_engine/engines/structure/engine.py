from .models import StructureEventType, StructureDirection, StructureResult
from prudence_engine.engines.market_data.models import MarketDataBatch
from prudence_engine.engines.displacement.models import DisplacementQuality

class StructureEngine:
    """
    Engine 8: Structure Engine
    Detects Market Structure Shift (MSS), Break of Structure (BOS), and Change of Character (CHOCH).
    """
    def process(self, data: MarketDataBatch, displacement_quality: DisplacementQuality = DisplacementQuality.MEDIUM) -> StructureResult:
        if not data or not data.bars or len(data.bars) < 10:
            return StructureResult(
                event_type=StructureEventType.NONE,
                direction=StructureDirection.NEUTRAL,
                broken_level=0.0,
                is_continuation=False,
                is_reversal=False,
                description="Insufficient historical bars for structural analysis."
            )

        bars = data.bars
        last_bar = bars[-1]
        ind = data.indicators

        swings_h = ind.swing_highs if ind else []
        swings_l = ind.swing_lows if ind else []

        recent_high = max(b.high for b in bars[-10:-1])
        recent_low = min(b.low for b in bars[-10:-1])

        # Bullish MSS / CHOCH / BOS
        if last_bar.close > recent_high:
            # If accompanied by strong/institutional displacement -> Bullish MSS
            if displacement_quality in (DisplacementQuality.STRONG, DisplacementQuality.INSTITUTIONAL):
                return StructureResult(
                    event_type=StructureEventType.MSS,
                    direction=StructureDirection.BULLISH,
                    broken_level=round(recent_high, 5),
                    is_continuation=False,
                    is_reversal=True,
                    description=f"Bullish Market Structure Shift (MSS) confirmed! Price breached swing high at {recent_high:.5f} with strong displacement."
                )
            else:
                return StructureResult(
                    event_type=StructureEventType.BOS,
                    direction=StructureDirection.BULLISH,
                    broken_level=round(recent_high, 5),
                    is_continuation=True,
                    is_reversal=False,
                    description=f"Bullish Break of Structure (BOS) over recent high at {recent_high:.5f}."
                )

        # Bearish MSS / CHOCH / BOS
        elif last_bar.close < recent_low:
            if displacement_quality in (DisplacementQuality.STRONG, DisplacementQuality.INSTITUTIONAL):
                return StructureResult(
                    event_type=StructureEventType.MSS,
                    direction=StructureDirection.BEARISH,
                    broken_level=round(recent_low, 5),
                    is_continuation=False,
                    is_reversal=True,
                    description=f"Bearish Market Structure Shift (MSS) confirmed! Price breached swing low at {recent_low:.5f} with strong displacement."
                )
            else:
                return StructureResult(
                    event_type=StructureEventType.BOS,
                    direction=StructureDirection.BEARISH,
                    broken_level=round(recent_low, 5),
                    is_continuation=True,
                    is_reversal=False,
                    description=f"Bearish Break of Structure (BOS) below recent low at {recent_low:.5f}."
                )

        # Early CHOCH check
        elif len(bars) >= 4 and last_bar.high > bars[-2].high and last_bar.close > bars[-2].open:
            return StructureResult(
                event_type=StructureEventType.CHOCH,
                direction=StructureDirection.BULLISH,
                broken_level=round(bars[-2].high, 5),
                is_continuation=False,
                is_reversal=True,
                description=f"Early Bullish Change of Character (CHOCH) detected on micro-structure."
            )

        return StructureResult(
            event_type=StructureEventType.NONE,
            direction=StructureDirection.NEUTRAL,
            broken_level=0.0,
            is_continuation=False,
            is_reversal=False,
            description="Market structure intact without new structural breaks."
        )
