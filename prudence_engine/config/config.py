"""
PRUDENCE ENGINE V5 - Global Configuration Module
Provides default configuration parameters for all 14 reasoning engines.
"""
from dataclasses import dataclass, field
from typing import Dict, Any

@dataclass
class ScoringWeightsConfig:
    bias: float = 2.0
    regime: float = 2.0
    zone: float = 2.0
    liquidity: float = 2.0
    price_action: float = 2.0
    displacement: float = 2.0
    structure: float = 3.0

@dataclass
class ThresholdsConfig:
    ignore_max_score: float = 7.0
    medium_min_score: float = 8.0
    medium_max_score: float = 10.0
    excellent_min_score: float = 11.0
    max_score: float = 15.0

@dataclass
class RiskConfig:
    default_risk_percent: float = 1.0
    max_daily_loss_percent: float = 3.0
    max_consecutive_losses: int = 3
    max_open_positions: int = 3
    max_account_exposure_percent: float = 5.0
    default_reward_ratio: float = 2.5

@dataclass
class LayeringConfig:
    default_layers: int = 3
    default_allocations: list[float] = field(default_factory=lambda: [0.4, 0.35, 0.25])
    default_zone_spread_ratio: float = 0.5

@dataclass
class GlobalConfig:
    scoring: ScoringWeightsConfig = field(default_factory=ScoringWeightsConfig)
    thresholds: ThresholdsConfig = field(default_factory=ThresholdsConfig)
    risk: RiskConfig = field(default_factory=RiskConfig)
    layering: LayeringConfig = field(default_factory=LayeringConfig)
    db_uri: str = "sqlite:///prudence_experience.db"
    environment: str = "production"

DEFAULT_CONFIG = GlobalConfig()
