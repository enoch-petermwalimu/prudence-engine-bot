from dataclasses import dataclass, field
from typing import List, Dict, Any

@dataclass
class LayerDetail:
    layer_id: int
    entry_type: str        # LIMIT or MARKET
    price: float
    lot_size: float
    allocation_percent: float
    stop_loss: float
    take_profit: float

@dataclass
class ExecutionPayload:
    signal: str                # BUY, SELL, HOLD
    confidence: float          # 0 to 100
    score: float               # 0 to 15
    symbol: str
    timeframe: str
    entry_zone: Dict[str, float] # {"low": 3345.20, "high": 3348.10}
    average_entry: float
    sl: float
    tp: float
    risk_reward_ratio: float
    reason: str
    layer_count: int
    layers: List[LayerDetail] = field(default_factory=list)
    timestamp: str = ""
