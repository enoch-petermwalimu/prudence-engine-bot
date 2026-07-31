from enum import Enum
from dataclasses import dataclass

class BiasDirection(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    NEUTRAL = "NEUTRAL"

@dataclass
class BiasResult:
    direction: BiasDirection
    confidence: float  # 0 to 100
    ema_alignment: str
    swing_structure: str
    reason: str
