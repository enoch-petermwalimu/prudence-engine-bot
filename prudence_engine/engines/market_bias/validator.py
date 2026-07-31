class MarketBiasValidator:
    @staticmethod
    def validate_bias_input(data) -> bool:
        if not data:
            raise ValueError("MarketDataBatch is required for bias processing.")
        return True
