from flask import Blueprint, request, jsonify
from prudence_engine.engines.orchestrator import PrudenceCognitiveEngine
from prudence_engine.engines.risk.models import AccountStatus

api_bp = Blueprint("api", __name__)
engine_instance = PrudenceCognitiveEngine()

@api_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ONLINE", "engine": "PRUDENCE ENGINE V5", "version": "5.0.0"})

@api_bp.route("/analyze", methods=["POST"])
def analyze():
    body = request.get_json() or {}
    symbol = body.get("symbol", "EURUSD")
    timeframe = body.get("timeframe", "M15")
    bars = body.get("bars", [])
    account_info = body.get("account", {})

    account_status = AccountStatus(
        balance=float(account_info.get("balance", 50000.0)),
        equity=float(account_info.get("equity", 50800.0)),
        daily_starting_equity=float(account_info.get("daily_starting_equity", 50000.0)),
        current_daily_loss=float(account_info.get("current_daily_loss", 0.0)),
        consecutive_losses=int(account_info.get("consecutive_losses", 0)),
        open_positions_count=int(account_info.get("open_positions_count", 1))
    )

    layer_count = int(body.get("layer_count", 3))

    res = engine_instance.analyze_market(
        symbol=symbol,
        timeframe=timeframe,
        raw_bars=bars,
        account_status=account_status,
        layer_count=layer_count
    )

    return jsonify({
        "symbol": res.symbol,
        "timeframe": res.timeframe,
        "bias": {
            "direction": res.bias.direction.value,
            "confidence": res.bias.confidence,
            "ema_alignment": res.bias.ema_alignment,
            "reason": res.bias.reason
        },
        "regime": {
            "type": res.regime.regime.value,
            "volatility_ratio": res.regime.volatility_ratio,
            "description": res.regime.description
        },
        "zone_valuation": {
            "valuation": res.zone_analysis.current_valuation,
            "discount_level": res.zone_analysis.discount_level,
            "equilibrium_price": res.zone_analysis.equilibrium_price
        },
        "liquidity": {
            "has_sweep": res.liquidity.has_sweep,
            "bsl_level": res.liquidity.bsl_level,
            "ssl_level": res.liquidity.ssl_level,
            "sweep_details": res.liquidity.active_sweep.description if res.liquidity.active_sweep else "None"
        },
        "price_action": {
            "primary_pattern": res.price_action.primary_pattern.pattern_type.value,
            "strength": res.price_action.primary_pattern.strength,
            "description": res.price_action.primary_pattern.description
        },
        "displacement": {
            "quality": res.displacement.quality.value,
            "atr_multiplier": res.displacement.atr_expansion_multiplier,
            "description": res.displacement.description
        },
        "structure": {
            "event_type": res.structure.event_type.value,
            "direction": res.structure.direction.value,
            "broken_level": res.structure.broken_level,
            "description": res.structure.description
        },
        "narrative": {
            "story": res.narrative.story_summary,
            "is_coherent": res.narrative.is_coherent,
            "answers": {
                "who_controls_market": res.narrative.answers.who_controls_market,
                "why_price_is_here": res.narrative.answers.why_price_is_here,
                "liquidity_taken": res.narrative.answers.liquidity_taken,
                "institutional_confirmation": res.narrative.answers.institutional_confirmation,
                "narrative_coherence": res.narrative.answers.narrative_coherence,
                "confidence_level": res.narrative.answers.confidence_level,
                "execution_verdict": res.narrative.answers.execution_verdict
            }
        },
        "scoring": {
            "total_score": res.scoring.total_score,
            "max_score": res.scoring.max_score,
            "classification": res.scoring.classification.value,
            "breakdown": {
                "bias": res.scoring.breakdown.bias_points,
                "regime": res.scoring.breakdown.regime_points,
                "zone": res.scoring.breakdown.zone_points,
                "liquidity": res.scoring.breakdown.liquidity_points,
                "price_action": res.scoring.breakdown.price_action_points,
                "displacement": res.scoring.breakdown.displacement_points,
                "structure": res.scoring.breakdown.structure_points
            }
        },
        "risk": {
            "is_permitted": res.risk.is_execution_permitted,
            "risk_amount_usd": res.risk.risk_amount_usd,
            "calculated_lot_size": res.risk.calculated_lot_size,
            "sl_pips": res.risk.stop_loss_pips,
            "tp_pips": res.risk.take_profit_pips,
            "rr_ratio": res.risk.risk_reward_ratio,
            "rejection_reason": res.risk.rejection_reason
        },
        "execution": {
            "signal": res.execution.signal,
            "confidence": res.execution.confidence,
            "score": res.execution.score,
            "symbol": res.execution.symbol,
            "timeframe": res.execution.timeframe,
            "entry_zone": res.execution.entry_zone,
            "average_entry": res.execution.average_entry,
            "sl": res.execution.sl,
            "tp": res.execution.tp,
            "risk_reward_ratio": res.execution.risk_reward_ratio,
            "reason": res.execution.reason,
            "layer_count": res.execution.layer_count,
            "layers": [
                {
                    "layer_id": l.layer_id,
                    "entry_type": l.entry_type,
                    "price": l.price,
                    "lot_size": l.lot_size,
                    "allocation_percent": l.allocation_percent,
                    "stop_loss": l.stop_loss,
                    "take_profit": l.take_profit
                } for l in res.execution.layers
            ]
        }
    })

@api_bp.route("/experience/stats", methods=["GET"])
def experience_stats():
    stats = engine_instance.experience_engine.compute_stats()
    return jsonify({
        "total_trades": stats.total_trades,
        "win_rate_total": stats.win_rate_total,
        "win_rate_by_session": stats.win_rate_by_session,
        "win_rate_by_pattern": stats.win_rate_by_pattern,
        "win_rate_by_zone": stats.win_rate_by_zone,
        "win_rate_by_structure": stats.win_rate_by_structure,
        "win_rate_by_score_range": stats.win_rate_by_score_range,
        "strongest_setup_combination": stats.strongest_setup_combination,
        "weakest_setup_combination": stats.weakest_setup_combination,
        "recommended_confidence_multiplier": stats.recommended_confidence_multiplier
    })

@api_bp.route("/experience/record", methods=["POST"])
def record_trade():
    data = request.get_json() or {}
    engine_instance.experience_engine.record_trade(data)
    return jsonify({"status": "RECORDED", "trade_id": data.get("trade_id")})
