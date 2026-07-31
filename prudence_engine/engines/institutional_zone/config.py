from dataclasses import dataclass

@dataclass
class ZoneConfig:
    premium_threshold: float = 55.0
    discount_threshold: float = 45.0
    expansion_atr_multiplier: float = 1.1
