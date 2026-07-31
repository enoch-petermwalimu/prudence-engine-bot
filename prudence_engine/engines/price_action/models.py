from enum import Enum
from dataclasses import dataclass

class PatternType(str, Enum):
    BULLISH_ENGULFING = "BULLISH_ENGULFING"
    BEARISH_ENGULFING = "BEARISH_ENGULFING"
    BULLISH_PINBAR = "BULLISH_PINBAR"
    BEARISH_PINBAR = "BEARISH_PINBAR"
    INSIDE_BAR = "INSIDE_BAR"
    OUTSIDE_BAR = "OUTSIDE_BAR"
    STRONG_REJECTION = "STRONG_REJECTION"
    NONE = "NONE"

@dataclass
class PriceActionPattern:
    pattern_type: PatternType
    strength: float     # 1 to 10
    confidence: float   # 0 to 100
    description: str

@dataclass
class PriceActionResult:
    primary_pattern: PriceActionPattern
    detected_patterns: list[PriceActionPattern]
