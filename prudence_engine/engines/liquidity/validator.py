class LiquidityValidator:
    @staticmethod
    def validate(data) -> bool:
        if not data:
            raise ValueError("Data required for liquidity engine.")
        return True
