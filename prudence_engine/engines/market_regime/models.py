from enum import Enum
from dataclasses import dataclass

class RegimeType(str, Enum):
    TREND = "TREND"
    RANGE = "RANGE"
    EXPANSION = "EXPANSION"
    CONSOLIDATION = "CONSOLIDATION"

@dataclass
class RegimeResult:
    regime: RegimeType
    volatility_ratio: float
    description: str
