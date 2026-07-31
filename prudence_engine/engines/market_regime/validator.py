class MarketRegimeValidator:
    @staticmethod
    def validate(data) -> bool:
        if not data:
            raise ValueError("Data batch required")
        return True
