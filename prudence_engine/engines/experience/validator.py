class ExperienceValidator:
    @staticmethod
    def validate_trade_record(trade_data: dict) -> bool:
        if not isinstance(trade_data, dict):
            raise ValueError("Trade data must be a dictionary.")
        return True
