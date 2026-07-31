class MarketDataValidator:
    @staticmethod
    def validate_raw_bars(raw_bars: list) -> bool:
        if not raw_bars or not isinstance(raw_bars, list):
            raise ValueError("Raw bars must be a non-empty list.")
        for bar in raw_bars:
            if not all(k in bar for k in ["open", "high", "low", "close"]):
                raise ValueError(f"Bar missing required OHLC keys: {bar}")
            if bar["high"] < bar["low"]:
                raise ValueError(f"High price {bar['high']} is lower than Low price {bar['low']}")
        return True
