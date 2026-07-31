from typing import List
from .models import LiquidityType, SweepDirection, LiquidityEvent, LiquidityAnalysisResult
from prudence_engine.engines.market_data.models import MarketDataBatch

class LiquidityEngine:
    """
    Engine 5: Liquidity Engine
    Detects EQH, EQL, BSL, SSL, Liquidity Sweeps, and Internal/External Liquidity.
    """
    def process(self, data: MarketDataBatch) -> LiquidityAnalysisResult:
        if not data or not data.bars or len(data.bars) < 15:
            return LiquidityAnalysisResult(
                has_sweep=False,
                active_sweep=None,
                equal_highs=[],
                equal_lows=[],
                bsl_level=data.last_close if data else 0.0,
                ssl_level=data.last_close if data else 0.0
            )

        bars = data.bars
        recent_bars = bars[-20:]

        bsl_level = max(b.high for b in recent_bars[:-1])
        ssl_level = min(b.low for b in recent_bars[:-1])

        # Find Equal Highs (EQH) and Equal Lows (EQL)
        eqh_levels = []
        eql_levels = []
        pip_tolerance = (data.indicators.atr14 * 0.1) if (data.indicators and data.indicators.atr14) else 0.0003

        for i in range(len(recent_bars)-1):
            for j in range(i+1, len(recent_bars)):
                if abs(recent_bars[i].high - recent_bars[j].high) <= pip_tolerance:
                    eqh_levels.append(round((recent_bars[i].high + recent_bars[j].high)/2.0, 5))
                if abs(recent_bars[i].low - recent_bars[j].low) <= pip_tolerance:
                    eql_levels.append(round((recent_bars[i].low + recent_bars[j].low)/2.0, 5))

        eqh_levels = list(set(eqh_levels))[:3]
        eql_levels = list(set(eql_levels))[:3]

        # Check for Liquidity Sweep on the current bar / recent 3 bars
        last_bar = bars[-1]
        prev_bars = bars[-6:-1]
        active_sweep = None

        # Bullish Sweep: Price spikes below SSL/EQL low with wick, body closes above level
        recent_low_target = min(b.low for b in prev_bars) if prev_bars else ssl_level
        if last_bar.low < recent_low_target and last_bar.close > recent_low_target:
            active_sweep = LiquidityEvent(
                event_type=LiquidityType.PREVIOUS_LOW,
                direction=SweepDirection.BULLISH_SWEEP,
                swept_level=round(recent_low_target, 5),
                confidence=90.0,
                description=f"Swept Sell-Side Liquidity (SSL) at {recent_low_target:.5f} with immediate rejection wick back inside range."
            )
        # Bearish Sweep: Price spikes above BSL/EQH high with wick, body closes below level
        recent_high_target = max(b.high for b in prev_bars) if prev_bars else bsl_level
        if last_bar.high > recent_high_target and last_bar.close < recent_high_target:
            active_sweep = LiquidityEvent(
                event_type=LiquidityType.PREVIOUS_HIGH,
                direction=SweepDirection.BEARISH_SWEEP,
                swept_level=round(recent_high_target, 5),
                confidence=90.0,
                description=f"Swept Buy-Side Liquidity (BSL) at {recent_high_target:.5f} with immediate rejection wick back inside range."
            )

        # Fallback check if no sweep on last bar, check if bar -2 had a sweep followed by confirmation
        if not active_sweep and len(bars) >= 3:
            bar_m1 = bars[-2]
            if bar_m1.low < ssl_level and bar_m1.close > ssl_level:
                active_sweep = LiquidityEvent(
                    event_type=LiquidityType.SELL_SIDE,
                    direction=SweepDirection.BULLISH_SWEEP,
                    swept_level=round(ssl_level, 5),
                    confidence=85.0,
                    description=f"Swept Sell-Side Liquidity at {ssl_level:.5f} on prior bar."
                )

        return LiquidityAnalysisResult(
            has_sweep=active_sweep is not None,
            active_sweep=active_sweep,
            equal_highs=eqh_levels,
            equal_lows=eql_levels,
            bsl_level=round(bsl_level, 5),
            ssl_level=round(ssl_level, 5)
        )
