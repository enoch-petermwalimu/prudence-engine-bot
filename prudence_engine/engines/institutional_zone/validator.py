class ZoneValidator:
    @staticmethod
    def validate_zone(zone) -> bool:
        if zone.high < zone.low:
            raise ValueError(f"Zone High ({zone.high}) cannot be less than Zone Low ({zone.low}).")
        return True
