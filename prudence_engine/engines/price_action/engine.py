from .models import PatternType, PriceActionPattern, PriceActionResult
from prudence_engine.engines.market_data.models import MarketDataBatch

class PriceActionEngine:
    """
    Engine 6: Price Action Engine
    Recognizes Bullish/Bearish Engulfing, Pin Bars, Inside/Outside Bars, and Rejection wicks.
    """
    def process(self, data: MarketDataBatch) -> PriceActionResult:
        patterns = []
        if not data or not data.bars or len(data.bars) < 2:
            default_pat = PriceActionPattern(
                pattern_type=PatternType.NONE,
                strength=0.0,
                confidence=0.0,
                description="Insufficient bars for price action analysis."
            )
            return PriceActionResult(primary_pattern=default_pat, detected_patterns=[])

        curr = data.bars[-1]
        prev = data.bars[-2]

        c_range = curr.high - curr.low if curr.high > curr.low else 0.0001
        c_body = abs(curr.close - curr.open)
        c_upper_wick = curr.high - max(curr.open, curr.close)
        c_lower_wick = min(curr.open, curr.close) - curr.low

        p_range = prev.high - prev.low if prev.high > prev.low else 0.0001

        # Bullish Engulfing
        if prev.close < prev.open and curr.close > curr.open and curr.close > prev.open and curr.open <= prev.close:
            patterns.append(PriceActionPattern(
                pattern_type=PatternType.BULLISH_ENGULFING,
                strength=8.8,
                confidence=90.0,
                description="Bullish Engulfing candle completely engulfs prior bearish candle body."
            ))

        # Bearish Engulfing
        if prev.close > prev.open and curr.close < curr.open and curr.close < prev.open and curr.open >= prev.close:
            patterns.append(PriceActionPattern(
                pattern_type=PatternType.BEARISH_ENGULFING,
                strength=8.8,
                confidence=90.0,
                description="Bearish Engulfing candle completely engulfs prior bullish candle body."
            ))

        # Bullish Pin Bar
        if c_lower_wick / c_range >= 0.60 and c_body / c_range <= 0.35:
            patterns.append(PriceActionPattern(
                pattern_type=PatternType.BULLISH_PINBAR,
                strength=8.5,
                confidence=88.0,
                description="Bullish Pin Bar with lower rejection wick occupying >60% of total bar range."
            ))

        # Bearish Pin Bar
        if c_upper_wick / c_range >= 0.60 and c_body / c_range <= 0.35:
            patterns.append(PriceActionPattern(
                pattern_type=PatternType.BEARISH_PINBAR,
                strength=8.5,
                confidence=88.0,
                description="Bearish Pin Bar with upper rejection wick occupying >60% of total bar range."
            ))

        # Inside Bar
        if curr.high <= prev.high and curr.low >= prev.low:
            patterns.append(PriceActionPattern(
                pattern_type=PatternType.INSIDE_BAR,
                strength=6.5,
                confidence=70.0,
                description="Inside Bar reflecting volatility compression inside previous candle bounds."
            ))

        # Outside Bar
        if curr.high > prev.high and curr.low < prev.low:
            patterns.append(PriceActionPattern(
                pattern_type=PatternType.OUTSIDE_BAR,
                strength=7.5,
                confidence=78.0,
                description="Outside Bar engulfing both high and low of prior bar."
            ))

        # Strong Rejection
        if (c_lower_wick / c_range >= 0.65) or (c_upper_wick / c_range >= 0.65):
            patterns.append(PriceActionPattern(
                pattern_type=PatternType.STRONG_REJECTION,
                strength=8.0,
                confidence=85.0,
                description="Strong price rejection wick demonstrating aggressive institutional absorbing liquidity."
            ))

        if not patterns:
            primary = PriceActionPattern(
                pattern_type=PatternType.NONE,
                strength=3.0,
                confidence=40.0,
                description="Standard candle formation without dominant candlestick trigger pattern."
            )
        else:
            # Pick pattern with highest strength
            primary = max(patterns, key=lambda p: p.strength)

        return PriceActionResult(primary_pattern=primary, detected_patterns=patterns)
