from dataclasses import dataclass
from typing import List

@dataclass
class CognitiveQuestionAnswers:
    who_controls_market: str
    why_price_is_here: str
    liquidity_taken: str
    institutional_confirmation: str
    narrative_coherence: str
    confidence_level: str
    execution_verdict: str

@dataclass
class MarketNarrativeResult:
    story_summary: str
    bullet_breakdown: List[str]
    answers: CognitiveQuestionAnswers
    is_coherent: bool
