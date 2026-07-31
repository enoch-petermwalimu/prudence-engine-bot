from .models import AccountStatus, RiskCalculationResult
from prudence_engine.config.config import RiskConfig

class RiskEngine:
    """
    Engine 12: Risk Engine
    Calculates exact lot size, position parameters, and enforces daily drawdown and max position controls.
    """
    def __init__(self, config: RiskConfig = None):
        self.config = config or RiskConfig()

    def process(
        self,
        account: AccountStatus,
        entry_price: float,
        stop_loss_price: float,
        take_profit_price: float,
        signal_direction: str = "BUY",
        symbol: str = "EURUSD"
    ) -> RiskCalculationResult:

        # 1. Enforce max daily loss limit
        max_daily_loss_usd = account.daily_starting_equity * (self.config.max_daily_loss_percent / 100.0)
        if account.current_daily_loss >= max_daily_loss_usd:
            return RiskCalculationResult(
                is_execution_permitted=False,
                risk_amount_usd=0.0,
                risk_percent=0.0,
                calculated_lot_size=0.0,
                stop_loss_pips=0.0,
                take_profit_pips=0.0,
                risk_reward_ratio=0.0,
                rejection_reason=f"REJECTED: Daily max drawdown limit reached (${account.current_daily_loss:.2f} >= ${max_daily_loss_usd:.2f})."
            )

        # 2. Enforce max consecutive losses
        if account.consecutive_losses >= self.config.max_consecutive_losses:
            return RiskCalculationResult(
                is_execution_permitted=False,
                risk_amount_usd=0.0,
                risk_percent=0.0,
                calculated_lot_size=0.0,
                stop_loss_pips=0.0,
                take_profit_pips=0.0,
                risk_reward_ratio=0.0,
                rejection_reason=f"REJECTED: Consecutive loss threshold hit ({account.consecutive_losses} losses). System in risk cooloff."
            )

        # 3. Enforce max open positions
        if account.open_positions_count >= self.config.max_open_positions:
            return RiskCalculationResult(
                is_execution_permitted=False,
                risk_amount_usd=0.0,
                risk_percent=0.0,
                calculated_lot_size=0.0,
                stop_loss_pips=0.0,
                take_profit_pips=0.0,
                risk_reward_ratio=0.0,
                rejection_reason=f"REJECTED: Max open positions limit reached ({account.open_positions_count}/{self.config.max_open_positions})."
            )

        # Calculate distances
        sl_distance = abs(entry_price - stop_loss_price)
        tp_distance = abs(take_profit_price - entry_price)

        if sl_distance == 0:
            sl_distance = 0.0015

        rr_ratio = tp_distance / sl_distance if sl_distance > 0 else 0.0

        # Calculate risk amount USD
        risk_pct = self.config.default_risk_percent
        risk_usd = account.balance * (risk_pct / 100.0)

        # Lot calculation standard formula: Lot = Risk USD / (SL_pips * PipValuePerLot)
        # For FX 1 Lot = 100,000 units, 1 pip (0.0001) = $10 per lot
        pip_size = 0.01 if "JPY" in symbol or "XAU" in symbol or "BTC" in symbol else 0.0001
        sl_pips = sl_distance / pip_size
        tp_pips = tp_distance / pip_size
        pip_value = 10.0 if pip_size == 0.0001 else 1.0

        lot_size = risk_usd / (sl_pips * pip_value) if (sl_pips * pip_value) > 0 else 0.1
        lot_size = round(max(0.01, min(lot_size, 50.0)), 2)

        return RiskCalculationResult(
            is_execution_permitted=True,
            risk_amount_usd=round(risk_usd, 2),
            risk_percent=risk_pct,
            calculated_lot_size=lot_size,
            stop_loss_pips=round(sl_pips, 1),
            take_profit_pips=round(tp_pips, 1),
            risk_reward_ratio=round(rr_ratio, 2),
            rejection_reason=None
        )
