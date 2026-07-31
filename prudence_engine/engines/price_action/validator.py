class PriceActionValidator:
    @staticmethod
    def validate(data) -> bool:
        if not data:
            raise ValueError("Market data required for price action engine.")
        return True
