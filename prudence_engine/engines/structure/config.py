from dataclasses import dataclass

@dataclass
class StructureConfig:
    lookback_bars: int = 10
