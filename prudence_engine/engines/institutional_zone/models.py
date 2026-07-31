from enum import Enum
from dataclasses import dataclass
from datetime import datetime
from typing import List

class ZoneType(str, Enum):
    SUPPLY = "SUPPLY"
    DEMAND = "DEMAND"
    BUY_VAULT = "BUY_VAULT"
    SELL_VAULT = "SELL_VAULT"

class ZoneStatus(str, Enum):
    ACTIVE = "ACTIVE"
    MITIGATED = "MITIGATED"
    BROKEN = "BROKEN"

@dataclass
class InstitutionalZone:
    zone_id: str
    zone_type: ZoneType
    high: float
    low: float
    creation_time: str
    strength: float  # 1 to 10
    freshness: bool
    touch_count: int
    status: ZoneStatus

@dataclass
class ZoneAnalysisResult:
    current_valuation: str  # PREMIUM or DISCOUNT or EQUILIBRIUM
    discount_level: float   # 0 to 100%
    equilibrium_price: float
    active_zones: List[InstitutionalZone]
    active_demand_zone: InstitutionalZone | None
    active_supply_zone: InstitutionalZone | None
