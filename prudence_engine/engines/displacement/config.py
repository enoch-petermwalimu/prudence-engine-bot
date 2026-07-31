from dataclasses import dataclass

@dataclass
class DisplacementConfig:
    institutional_body_ratio_min: float = 0.75
    institutional_atr_multiplier_min: float = 1.8
