from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime

@dataclass
class OHLCBar:
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float = 0.0

@dataclass
class MarketIndicators:
    ema20: float
    ema60: float
    ema200: float
    atr14: float
    swing_highs: List[float] = field(default_factory=list)
    swing_lows: List[float] = field(default_factory=list)

@dataclass
class MarketDataBatch:
    symbol: str
    timeframe: str
    bars: List[OHLCBar]
    indicators: Optional[MarketIndicators] = None
    last_close: float = 0.0
