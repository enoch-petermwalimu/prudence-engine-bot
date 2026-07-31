from dataclasses import dataclass

@dataclass
class LiquidityConfig:
    pip_tolerance_atr_ratio: float = 0.1
    sweep_lookback_bars: int = 20
