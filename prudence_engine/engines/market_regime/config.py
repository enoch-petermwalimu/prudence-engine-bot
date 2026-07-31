from dataclasses import dataclass

@dataclass
class MarketRegimeConfig:
    expansion_volatility_min: float = 1.45
    trend_efficiency_min: float = 0.48
    consolidation_volatility_max: float = 0.75
