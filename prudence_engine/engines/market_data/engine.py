from typing import List
from datetime import datetime
from .models import OHLCBar, MarketIndicators, MarketDataBatch

class MarketDataEngine:
    """
    Engine 1: Market Data Engine
    Normalizes OHLC data from MT5 and calculates key technical indicators.
    """
    def __init__(self, ema_fast: int = 20, ema_mid: int = 60, ema_slow: int = 200, atr_period: int = 14):
        self.ema_fast = ema_fast
        self.ema_mid = ema_mid
        self.ema_slow = ema_slow
        self.atr_period = atr_period

    def calculate_ema(self, prices: List[float], period: int) -> float:
        if not prices:
            return 0.0
        if len(prices) < period:
            return sum(prices) / len(prices)
        multiplier = 2.0 / (period + 1)
        ema = sum(prices[:period]) / period
        for price in prices[period:]:
            ema = (price - ema) * multiplier + ema
        return float(ema)

    def calculate_atr(self, bars: List[OHLCBar], period: int = 14) -> float:
        if len(bars) < 2:
            return 0.0010
        tr_list = []
        for i in range(1, len(bars)):
            high = bars[i].high
            low = bars[i].low
            prev_close = bars[i-1].close
            tr = max(high - low, abs(high - prev_close), abs(low - prev_close))
            tr_list.append(tr)
        if len(tr_list) < period:
            return float(sum(tr_list) / len(tr_list)) if tr_list else 0.0010
        recent_tr = tr_list[-period:]
        return float(sum(recent_tr) / len(recent_tr))

    def detect_swings(self, bars: List[OHLCBar], lookback: int = 3) -> tuple[List[float], List[float]]:
        highs = []
        lows = []
        n = len(bars)
        for i in range(lookback, n - lookback):
            current_high = bars[i].high
            current_low = bars[i].low
            is_swing_high = all(current_high >= bars[i-j].high for j in range(1, lookback + 1)) and \
                            all(current_high >= bars[i+j].high for j in range(1, lookback + 1))
            is_swing_low = all(current_low <= bars[i-j].low for j in range(1, lookback + 1)) and \
                           all(current_low <= bars[i+j].low for j in range(1, lookback + 1))
            if is_swing_high:
                highs.append(current_high)
            if is_swing_low:
                lows.append(current_low)
        return highs, lows

    def process(self, symbol: str, timeframe: str, raw_bars: List[dict]) -> MarketDataBatch:
        bars = []
        for b in raw_bars:
            ts = b.get("timestamp")
            if isinstance(ts, (int, float)):
                dt = datetime.fromtimestamp(ts)
            elif isinstance(ts, str):
                try:
                    dt = datetime.fromisoformat(ts)
                except ValueError:
                    dt = datetime.now()
            else:
                dt = datetime.now()

            bars.append(OHLCBar(
                timestamp=dt,
                open=float(b.get("open", 0.0)),
                high=float(b.get("high", 0.0)),
                low=float(b.get("low", 0.0)),
                close=float(b.get("close", 0.0)),
                volume=float(b.get("volume", 0.0))
            ))

        closes = [bar.close for bar in bars]
        ema20 = self.calculate_ema(closes, self.ema_fast)
        ema60 = self.calculate_ema(closes, self.ema_mid)
        ema200 = self.calculate_ema(closes, self.ema_slow)
        atr14 = self.calculate_atr(bars, self.atr_period)
        s_highs, s_lows = self.detect_swings(bars)

        indicators = MarketIndicators(
            ema20=ema20,
            ema60=ema60,
            ema200=ema200,
            atr14=atr14,
            swing_highs=s_highs,
            swing_lows=s_lows
        )

        return MarketDataBatch(
            symbol=symbol,
            timeframe=timeframe,
            bars=bars,
            indicators=indicators,
            last_close=closes[-1] if closes else 0.0
        )
