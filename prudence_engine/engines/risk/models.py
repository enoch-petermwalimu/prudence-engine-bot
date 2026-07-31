from dataclasses import dataclass

@dataclass
class AccountStatus:
    balance: float              # e.g., 50000.0 USD
    equity: float               # e.g., 50800.0 USD
    daily_starting_equity: float # e.g., 50000.0 USD
    current_daily_loss: float   # e.g., 250.0 USD
    consecutive_losses: int    # e.g., 0
    open_positions_count: int  # e.g., 1

@dataclass
class RiskCalculationResult:
    is_execution_permitted: bool
    risk_amount_usd: float
    risk_percent: float
    calculated_lot_size: float
    stop_loss_pips: float
    take_profit_pips: float
    risk_reward_ratio: float
    rejection_reason: str | None
