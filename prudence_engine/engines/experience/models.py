from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict

class TradeResult(str, Enum):
    WIN = "WIN"
    LOSS = "LOSS"
    BREAKEVEN = "BREAKEVEN"

@dataclass
class TradeRecord:
    trade_id: str
    timestamp: str
    session: str            # LONDON, NEW_YORK, ASIAN
    symbol: str
    market_bias: str
    zone_type: str
    liquidity_sweep: str
    pattern: str
    displacement: str
    structure: str
    score: float
    entry_price: float
    exit_price: float
    result: TradeResult
    risk_reward: float
    pnl: float

@dataclass
class ExperienceStats:
    total_trades: int
    win_rate_total: float
    win_rate_by_session: Dict[str, float]
    win_rate_by_pattern: Dict[str, float]
    win_rate_by_zone: Dict[str, float]
    win_rate_by_structure: Dict[str, float]
    win_rate_by_score_range: Dict[str, float]
    strongest_setup_combination: str
    weakest_setup_combination: str
    recommended_confidence_multiplier: float
