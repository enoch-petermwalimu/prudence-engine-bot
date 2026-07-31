from dataclasses import dataclass

@dataclass
class MarketBiasConfig:
    bullish_threshold: float = 70.0
    bearish_threshold: float = 30.0
