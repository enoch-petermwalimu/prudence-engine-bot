from enum import Enum
from dataclasses import dataclass

class DisplacementQuality(str, Enum):
    WEAK = "WEAK"
    MEDIUM = "MEDIUM"
    STRONG = "STRONG"
    INSTITUTIONAL = "INSTITUTIONAL"

@dataclass
class DisplacementResult:
    quality: DisplacementQuality
    body_ratio: float           # e.g., 0.82 (82%)
    atr_expansion_multiplier: float  # e.g., 2.1x ATR
    impulse_momentum: float     # points or pips speed
    description: str
