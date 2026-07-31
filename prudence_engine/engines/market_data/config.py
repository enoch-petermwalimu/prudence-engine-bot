from dataclasses import dataclass

@dataclass
class MarketDataConfig:
    ema_fast: int = 20
    ema_mid: int = 60
    ema_slow: int = 200
    atr_period: int = 14
    swing_lookback: int = 3
