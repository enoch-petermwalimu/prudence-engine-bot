from enum import Enum
from dataclasses import dataclass
from typing import List

class LiquidityType(str, Enum):
    EQUAL_HIGH = "EQUAL_HIGH"
    EQUAL_LOW = "EQUAL_LOW"
    PREVIOUS_HIGH = "PREVIOUS_HIGH"
    PREVIOUS_LOW = "PREVIOUS_LOW"
    INTERNAL_LIQUIDITY = "INTERNAL_LIQUIDITY"
    EXTERNAL_LIQUIDITY = "EXTERNAL_LIQUIDITY"

class SweepDirection(str, Enum):
    BULLISH_SWEEP = "BULLISH_SWEEP"  # Swept sell-side liquidity below low -> Bullish reversal
    BEARISH_SWEEP = "BEARISH_SWEEP"  # Swept buy-side liquidity above high -> Bearish reversal
    NONE = "NONE"

@dataclass
class LiquidityEvent:
    event_type: LiquidityType
    direction: SweepDirection
    swept_level: float
    confidence: float
    description: str

@dataclass
class LiquidityAnalysisResult:
    has_sweep: bool
    active_sweep: LiquidityEvent | None
    equal_highs: List[float]
    equal_lows: List[float]
    bsl_level: float
    ssl_level: float
