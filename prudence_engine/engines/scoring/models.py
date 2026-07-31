from enum import Enum
from dataclasses import dataclass, field
from typing import Dict

class ScoreClassification(str, Enum):
    IGNORE = "IGNORE"
    MEDIUM = "MEDIUM"
    EXCELLENT = "EXCELLENT"

@dataclass
class ScoreBreakdown:
    bias_points: float          # max 2.0
    regime_points: float        # max 2.0
    zone_points: float          # max 2.0
    liquidity_points: float     # max 2.0
    price_action_points: float  # max 2.0
    displacement_points: float  # max 2.0
    structure_points: float     # max 3.0

@dataclass
class ScoringResult:
    total_score: float         # 0.0 to 15.0
    max_score: float           # 15.0
    classification: ScoreClassification
    confidence_percentage: float
    breakdown: ScoreBreakdown
    details: Dict[str, str] = field(default_factory=dict)
