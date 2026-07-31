from enum import Enum
from dataclasses import dataclass

class StructureEventType(str, Enum):
    MSS = "MSS"      # Market Structure Shift
    BOS = "BOS"      # Break of Structure
    CHOCH = "CHOCH"  # Change of Character
    NONE = "NONE"

class StructureDirection(str, Enum):
    BULLISH = "BULLISH"
    BEARISH = "BEARISH"
    NEUTRAL = "NEUTRAL"

@dataclass
class StructureResult:
    event_type: StructureEventType
    direction: StructureDirection
    broken_level: float
    is_continuation: bool
    is_reversal: bool
    description: str
