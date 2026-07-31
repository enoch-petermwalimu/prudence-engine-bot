from typing import List, Dict
from datetime import datetime
from .models import LayerDetail, ExecutionPayload
from prudence_engine.engines.scoring.models import ScoringResult, ScoreClassification
from prudence_engine.engines.narrative.models import MarketNarrativeResult
from prudence_engine.engines.institutional_zone.models import ZoneAnalysisResult
from prudence_engine.engines.risk.models import RiskCalculationResult

class ExecutionEngine:
    """
    Engine 13 & 14: Execution Engine & Multi-Layering Engine
    Formulates the final executable MT5 JSON payload with multi-entry layering strategies.
    Python NEVER opens trades directly — it produces signal payloads for MT5 EAs.
    """
    def process(
        self,
        symbol: str,
        timeframe: str,
        scoring: ScoringResult,
        narrative: MarketNarrativeResult,
        zone_analysis: ZoneAnalysisResult,
        risk_result: RiskCalculationResult,
        signal_direction: str = "BUY",
        layer_count: int = 3
    ) -> ExecutionPayload:

        if scoring.classification == ScoreClassification.IGNORE or not risk_result.is_execution_permitted:
            return ExecutionPayload(
                signal="HOLD",
                confidence=scoring.confidence_percentage,
                score=scoring.total_score,
                symbol=symbol,
                timeframe=timeframe,
                entry_zone={"low": 0.0, "high": 0.0},
                average_entry=0.0,
                sl=0.0,
                tp=0.0,
                risk_reward_ratio=0.0,
                reason=risk_result.rejection_reason or "Setup score below threshold (HOLD / NO TRADE).",
                layer_count=0,
                layers=[],
                timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            )

        # Active Zone bounds
        if signal_direction == "BUY":
            active_z = zone_analysis.active_demand_zone
        else:
            active_z = zone_analysis.active_supply_zone

        if active_z:
            z_low = active_z.low
            z_high = active_z.high
        else:
            ref_price = zone_analysis.equilibrium_price
            z_low = ref_price * 0.999
            z_high = ref_price * 1.001

        zone_range = abs(z_high - z_low)

        # Stop Loss and Take Profit levels
        if signal_direction == "BUY":
            sl_price = round(z_low - (zone_range * 0.4), 5)
            tp_price = round(z_high + (abs(z_high - sl_price) * risk_result.risk_reward_ratio), 5)
        else:
            sl_price = round(z_high + (zone_range * 0.4), 5)
            tp_price = round(z_low - (abs(sl_price - z_low) * risk_result.risk_reward_ratio), 5)

        total_lot = risk_result.calculated_lot_size

        # Create 3 multi-entry layers inside institutional zone
        # Allocation: Layer 1 (40%), Layer 2 (35%), Layer 3 (25%)
        allocations = [0.40, 0.35, 0.25] if layer_count == 3 else [1.0 / layer_count] * layer_count
        layers: List[LayerDetail] = []
        weighted_entry_sum = 0.0

        for idx in range(layer_count):
            alloc = allocations[idx] if idx < len(allocations) else (1.0 / layer_count)
            layer_lot = round(max(0.01, total_lot * alloc), 2)

            if signal_direction == "BUY":
                # Layer 1 = Top of zone, Layer 2 = Midpoint, Layer 3 = Deep 75% zone
                depth = (idx / max(1, layer_count - 1)) * 0.75
                l_price = round(z_high - (zone_range * depth), 5)
            else:
                depth = (idx / max(1, layer_count - 1)) * 0.75
                l_price = round(z_low + (zone_range * depth), 5)

            weighted_entry_sum += l_price * alloc

            layers.append(LayerDetail(
                layer_id=idx + 1,
                entry_type="MARKET" if idx == 0 else "LIMIT",
                price=l_price,
                lot_size=layer_lot,
                allocation_percent=round(alloc * 100, 1),
                stop_loss=sl_price,
                take_profit=tp_price
            ))

        avg_entry = round(weighted_entry_sum, 5)

        return ExecutionPayload(
            signal=signal_direction,
            confidence=scoring.confidence_percentage,
            score=scoring.total_score,
            symbol=symbol,
            timeframe=timeframe,
            entry_zone={"low": round(z_low, 5), "high": round(z_high, 5)},
            average_entry=avg_entry,
            sl=sl_price,
            tp=tp_price,
            risk_reward_ratio=risk_result.risk_reward_ratio,
            reason=narrative.answers.execution_verdict + " " + narrative.story_summary,
            layer_count=len(layers),
            layers=layers,
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
