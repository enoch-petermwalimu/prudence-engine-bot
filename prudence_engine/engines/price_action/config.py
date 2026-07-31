from dataclasses import dataclass

@dataclass
class PriceActionConfig:
    pinbar_wick_ratio_min: float = 0.60
    pinbar_body_ratio_max: float = 0.35
